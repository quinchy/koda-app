#!/usr/bin/env bash
set -euo pipefail

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is required}"
: "${GITHUB_EVENT_NAME:?GITHUB_EVENT_NAME is required}"

AUTH_HEADER="Authorization: Bearer ${VERCEL_TOKEN}"

log() {
  echo "$*" >&2
}

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
    log "Vercel API ${method} ${path} failed with HTTP ${status}"
    log "${response}"
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
  local commit_sha="$2"
  local encoded_branch attempt response deployment_json

  encoded_branch="$(jq -rn --arg branch "${branch}" '$branch|@uri')"

  for attempt in $(seq 1 30); do
    log "Waiting for READY Vercel preview deployment (${attempt}/30) on branch ${branch}..."

    response="$(api GET "/v6/deployments?projectId=${VERCEL_PROJECT_ID}&branch=${encoded_branch}&state=READY&limit=5")"
    deployment_json="$(jq -c --arg sha "${commit_sha}" '
      [.deployments[]? | select(.meta.githubCommitSha == $sha)][0]
      // .deployments[0]?
    ' <<<"${response}")"

    if [[ -n "${deployment_json}" && "${deployment_json}" != "null" ]]; then
      jq -nc \
        --argjson deployment "${deployment_json}" \
        '{
          url: ("https://" + $deployment.url),
          id: ($deployment.id // $deployment.uid),
          name: $deployment.name
        }'
      return 0
    fi

    sleep 10
  done

  log "Timed out waiting for a READY Vercel preview deployment on branch ${branch}"
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
        name: $name
      }')" >/dev/null
}

cleanup_preview_auth_env() {
  local branch="$1"

  delete_branch_env "BETTER_AUTH_URL" "${branch}"
  delete_branch_env "BETTER_AUTH_SECRET" "${branch}"
}

configure_preview_auth_env() {
  local branch="$1"
  local commit_sha="$2"
  local deployment_json preview_url deployment_id project_name auth_secret

  deployment_json="$(wait_for_preview_deployment "${branch}" "${commit_sha}")"
  preview_url="$(jq -r '.url' <<<"${deployment_json}")"
  deployment_id="$(jq -r '.id' <<<"${deployment_json}")"
  project_name="$(jq -r '.name' <<<"${deployment_json}")"

  if [[ ! "${preview_url}" =~ ^https:// ]]; then
    log "Refusing to set BETTER_AUTH_URL because preview URL is invalid: ${preview_url}"
    exit 1
  fi

  if [[ -z "${project_name}" || "${project_name}" == "null" ]]; then
    project_name="$(get_project_name)"
  fi

  auth_secret="$(openssl rand -base64 32)"

  upsert_branch_env "BETTER_AUTH_URL" "${preview_url}" "${branch}"
  upsert_branch_env "BETTER_AUTH_SECRET" "${auth_secret}" "${branch}"

  if redeploy_preview "${deployment_id}" "${project_name}"; then
    log "Redeployed preview ${deployment_id}"
  else
    log "Env vars were set, but redeploy failed. Push again or redeploy manually in Vercel."
    exit 1
  fi

  log "Configured preview auth env for ${branch} at ${preview_url}"
}

if [[ "${GITHUB_EVENT_NAME}" == "pull_request" ]]; then
  BRANCH="${GITHUB_HEAD_REF:-}"
  COMMIT_SHA="${GITHUB_HEAD_SHA:-}"

  if [[ -z "${BRANCH}" ]]; then
    log "Missing pull request head branch"
    exit 1
  fi

  if [[ -z "${COMMIT_SHA}" ]]; then
    log "Missing pull request head commit SHA"
    exit 1
  fi

  ACTION="${GITHUB_EVENT_ACTION:-opened}"

  if [[ "${ACTION}" == "closed" ]]; then
    cleanup_preview_auth_env "${BRANCH}"
    log "Removed preview auth env for ${BRANCH}"
    exit 0
  fi

  configure_preview_auth_env "${BRANCH}" "${COMMIT_SHA}"
fi
