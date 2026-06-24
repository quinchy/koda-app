#!/usr/bin/env bash
set -euo pipefail

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is required}"
: "${GITHUB_EVENT_NAME:?GITHUB_EVENT_NAME is required}"

AUTH_HEADER="Authorization: Bearer ${VERCEL_TOKEN}"

build_url() {
  local path="$1"

  if [[ -n "${VERCEL_ORG_ID:-}" ]]; then
    if [[ "${path}" == *\?* ]]; then
      printf "https://api.vercel.com%s&teamId=%s" "${path}" "${VERCEL_ORG_ID}"
    else
      printf "https://api.vercel.com%s?teamId=%s" "${path}" "${VERCEL_ORG_ID}"
    fi
  else
    printf "https://api.vercel.com%s" "${path}"
  fi
}

api() {
  local method="$1"
  local path="$2"
  shift 2
  local response
  local status

  response="$(
    curl --silent --show-error \
      --request "${method}" \
      --url "$(build_url "${path}")" \
      --header "${AUTH_HEADER}" \
      --header "Content-Type: application/json" \
      --write-out "\n%{http_code}" \
      "$@"
  )"

  status="${response##*$'\n'}"
  response="${response%$'\n'*}"

  if [[ "${status}" -lt 200 || "${status}" -ge 300 ]]; then
    echo "Vercel API ${method} ${path} failed with HTTP ${status}" >&2
    echo "${response}" >&2
    return 1
  fi

  printf "%s" "${response}"
}

delete_branch_env() {
  local key="$1"
  local branch="$2"
  local env_id

  env_id="$(api GET "/v10/projects/${VERCEL_PROJECT_ID}/env" | jq -r --arg key "${key}" --arg branch "${branch}" '
    .envs[]? | select(.key == $key and .gitBranch == $branch) | .id
  ' | head -n 1)"

  if [[ -n "${env_id}" && "${env_id}" != "null" ]]; then
    api DELETE "/v10/projects/${VERCEL_PROJECT_ID}/env/${env_id}" >/dev/null
  fi
}

upsert_branch_env() {
  local key="$1"
  local value="$2"
  local branch="$3"

  delete_branch_env "${key}" "${branch}"

  api POST "/v10/projects/${VERCEL_PROJECT_ID}/env" \
    --data "$(jq -n \
      --arg key "${key}" \
      --arg value "${value}" \
      --arg branch "${branch}" \
      '{
        key: $key,
        value: $value,
        type: "encrypted",
        target: ["preview"],
        gitBranch: $branch
      }')" >/dev/null
}

wait_for_preview_deployment() {
  local branch="$1"
  local encoded_branch attempt response deployment_url deployment_id project_name

  encoded_branch="$(jq -rn --arg branch "${branch}" '$branch|@uri')"

  for attempt in $(seq 1 30); do
    echo "Waiting for Vercel preview deployment (${attempt}/30) on branch ${branch}..."

    response="$(api GET "/v6/deployments?projectId=${VERCEL_PROJECT_ID}&meta-githubCommitRef=${encoded_branch}&limit=1")"
    deployment_url="$(jq -r '.deployments[0]?.url // empty' <<<"${response}")"
    deployment_id="$(jq -r '.deployments[0]?.uid // empty' <<<"${response}")"
    project_name="$(jq -r '.deployments[0]?.name // empty' <<<"${response}")"

    if [[ -n "${deployment_url}" ]]; then
      echo "https://${deployment_url}"
      echo "${deployment_id}"
      echo "${project_name}"
      return 0
    fi

    sleep 10
  done

  echo "Timed out waiting for a Vercel preview deployment on branch ${branch}" >&2
  return 1
}

get_project_name() {
  api GET "/v9/projects/${VERCEL_PROJECT_ID}" | jq -r '.name'
}

redeploy_preview() {
  local deployment_id="$1"
  local project_name="$2"

  api POST "/v13/deployments" \
    --data "$(jq -n \
      --arg deploymentId "${deployment_id}" \
      --arg name "${project_name}" \
      '{
        deploymentId: $deploymentId,
        name: $name,
        target: "preview"
      }')" >/dev/null
}

cleanup_preview_auth_env() {
  local branch="$1"

  delete_branch_env "BETTER_AUTH_URL" "${branch}"
  delete_branch_env "BETTER_AUTH_SECRET" "${branch}"
}

configure_preview_auth_env() {
  local branch="$1"
  local preview_url deployment_id project_name auth_secret deployment_info

  deployment_info="$(wait_for_preview_deployment "${branch}")"
  preview_url="$(sed -n '1p' <<<"${deployment_info}")"
  deployment_id="$(sed -n '2p' <<<"${deployment_info}")"
  project_name="$(sed -n '3p' <<<"${deployment_info}")"

  if [[ -z "${project_name}" ]]; then
    project_name="$(get_project_name)"
  fi

  auth_secret="$(openssl rand -base64 32)"

  upsert_branch_env "BETTER_AUTH_URL" "${preview_url}" "${branch}"
  upsert_branch_env "BETTER_AUTH_SECRET" "${auth_secret}" "${branch}"
  redeploy_preview "${deployment_id}" "${project_name}"

  echo "Configured preview auth env for ${branch} at ${preview_url}"
}

if [[ "${GITHUB_EVENT_NAME}" == "pull_request" ]]; then
  BRANCH="${GITHUB_HEAD_REF:-}"

  if [[ -z "${BRANCH}" ]]; then
    echo "Missing pull request head branch" >&2
    exit 1
  fi

  ACTION="${GITHUB_EVENT_ACTION:-opened}"

  if [[ "${ACTION}" == "closed" ]]; then
    cleanup_preview_auth_env "${BRANCH}"
    echo "Removed preview auth env for ${BRANCH}"
    exit 0
  fi

  configure_preview_auth_env "${BRANCH}"
fi
