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

  curl --fail --silent --show-error \
    --request "${method}" \
    --url "$(build_url "${path}")" \
    --header "${AUTH_HEADER}" \
    --header "Content-Type: application/json" \
    "$@"
}

delete_branch_env() {
  local key="$1"
  local branch="$2"
  local env_id

  env_id="$(api GET "/v10/projects/${VERCEL_PROJECT_ID}/env" | jq -r --arg key "${key}" --arg branch "${branch}" '
    .envs[]? | select(.key == $key and .gitBranch == $branch) | .id
  ' | head -n 1)"

  if [[ -n "${env_id}" && "${env_id}" != "null" ]]; then
    api DELETE "/v10/projects/${VERCEL_PROJECT_ID}/env/${env_id}"
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
      }')"
}

wait_for_preview_deployment() {
  local branch="$1"
  local encoded_branch attempt deployment_url deployment_id

  encoded_branch="$(jq -rn --arg branch "${branch}" '$branch|@uri')"

  for attempt in $(seq 1 30); do
    read -r deployment_url deployment_id < <(
      api GET "/v6/deployments?projectId=${VERCEL_PROJECT_ID}&meta-githubCommitRef=${encoded_branch}&limit=1" | jq -r '
        .deployments[0]? | [.url, .uid] | @tsv
      '
    )

    if [[ -n "${deployment_url}" && "${deployment_url}" != "null" ]]; then
      printf "%s %s" "https://${deployment_url}" "${deployment_id}"
      return 0
    fi

    sleep 10
  done

  echo "Timed out waiting for a Vercel preview deployment on branch ${branch}" >&2
  return 1
}

redeploy_preview() {
  local deployment_id="$1"

  api POST "/v13/deployments" \
    --data "$(jq -n \
      --arg deploymentId "${deployment_id}" \
      '{
        deploymentId: $deploymentId,
        target: "preview"
      }')"
}

cleanup_preview_auth_env() {
  local branch="$1"

  delete_branch_env "BETTER_AUTH_URL" "${branch}"
  delete_branch_env "BETTER_AUTH_SECRET" "${branch}"
}

configure_preview_auth_env() {
  local branch="$1"
  local preview_url deployment_id auth_secret

  read -r preview_url deployment_id < <(wait_for_preview_deployment "${branch}")
  auth_secret="$(openssl rand -base64 32)"

  upsert_branch_env "BETTER_AUTH_URL" "${preview_url}" "${branch}"
  upsert_branch_env "BETTER_AUTH_SECRET" "${auth_secret}" "${branch}"
  redeploy_preview "${deployment_id}"

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
