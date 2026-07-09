#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash .local/killercoda-bootstrap.sh --git-token TOKEN --aws-access-key-id KEY --aws-secret-access-key SECRET [--aws-region REGION]

Optional:
  --repo-url URL     Git repo URL without credentials
  --repo-dir DIR     Directory to clone into (default: propconnect)
  --repo-branch BR   Branch to clone (default: feature)
  --skip-clone       Skip git clone step
  --skip-argo        Skip Argo CD install step

Environment variables can also be used instead of flags:
  GIT_TOKEN, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, REPO_URL, REPO_DIR, REPO_BRANCH
EOF
}

log() {
  printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$1"
}

die() {
  printf '\nError: %s\n' "$1" >&2
  exit 1
}

retry() {
  local attempts="$1"
  shift
  local n=1
  until "$@"; do
    if [[ $n -ge $attempts ]]; then
      return 1
    fi
    log "Command failed, retrying in 10 seconds (attempt $((n + 1))/$attempts)"
    sleep 10
    n=$((n + 1))
  done
}

GIT_TOKEN="${GIT_TOKEN:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"
AWS_REGION="${AWS_REGION:-ap-south-2}"
REPO_URL="${REPO_URL:-https://github.com/pavansai-pashikanti07/propconnect.git}"
REPO_DIR="${REPO_DIR:-propconnect}"
REPO_BRANCH="${REPO_BRANCH:-feature}"
SKIP_CLONE="false"
SKIP_ARGO="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --git-token)
      GIT_TOKEN="${2:-}"
      shift 2
      ;;
    --aws-access-key-id)
      AWS_ACCESS_KEY_ID="${2:-}"
      shift 2
      ;;
    --aws-secret-access-key)
      AWS_SECRET_ACCESS_KEY="${2:-}"
      shift 2
      ;;
    --aws-region)
      AWS_REGION="${2:-}"
      shift 2
      ;;
    --repo-url)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --repo-dir)
      REPO_DIR="${2:-}"
      shift 2
      ;;
    --repo-branch)
      REPO_BRANCH="${2:-}"
      shift 2
      ;;
    --skip-clone)
      SKIP_CLONE="true"
      shift
      ;;
    --skip-argo)
      SKIP_ARGO="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[[ -n "$GIT_TOKEN" ]] || die "Missing --git-token or GIT_TOKEN."
[[ -n "$AWS_ACCESS_KEY_ID" ]] || die "Missing --aws-access-key-id or AWS_ACCESS_KEY_ID."
[[ -n "$AWS_SECRET_ACCESS_KEY" ]] || die "Missing --aws-secret-access-key or AWS_SECRET_ACCESS_KEY."
[[ -n "$AWS_REGION" ]] || die "Missing --aws-region or AWS_REGION."

if [[ "$SKIP_CLONE" != "true" ]]; then
  if [[ -e "$REPO_DIR" ]]; then
    die "Target directory '$REPO_DIR' already exists. Remove it or use --repo-dir."
  fi

  log "Cloning repository branch '$REPO_BRANCH' into '$REPO_DIR'"
  git clone --branch "$REPO_BRANCH" --single-branch "https://x-access-token:${GIT_TOKEN}@${REPO_URL#https://}" "$REPO_DIR"
fi

cd "$REPO_DIR"

if [[ -f "k8s/bootstrap-killercoda.sh" ]]; then
  log "Making cluster bootstrap script executable"
  chmod +x k8s/bootstrap-killercoda.sh

  log "Installing cluster add-ons and secret-store wiring"
  AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  AWS_REGION="$AWS_REGION" \
  ./k8s/bootstrap-killercoda.sh
else
  die "k8s/bootstrap-killercoda.sh not found."
fi

if [[ "$SKIP_ARGO" != "true" ]]; then
  log "Waiting for the Kubernetes API server to settle"
  retry 6 kubectl get namespaces >/dev/null

  log "Installing Argo CD"
  kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
  retry 6 kubectl apply --server-side --force-conflicts -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml


  log "Waiting for Argo CD pods"
  kubectl -n argocd rollout status deployment/argocd-server --timeout=300s
  kubectl -n argocd rollout status deployment/argocd-repo-server --timeout=300s
  kubectl -n argocd rollout status deployment/argocd-applicationset-controller --timeout=300s
  kubectl -n argocd rollout status statefulset/argocd-application-controller --timeout=300s

  if kubectl -n argocd get deployment argocd-server -o jsonpath='{.spec.template.spec.containers[0].args}' 2>/dev/null | grep -q -- '--insecure'; then
    log "Argo CD server already configured for insecure mode"
  else
    log "Patching Argo CD server for insecure mode"
    kubectl -n argocd patch deployment argocd-server --type=json -p='[
      {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--insecure"}
    ]'
  fi

  log "Restarting Argo CD server"
  kubectl -n argocd rollout restart deployment/argocd-server
  kubectl -n argocd rollout status deployment/argocd-server --timeout=300s

  log "Argo CD initial admin password"
  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
  printf '\n'

  cat <<EOF

Next step for Killercoda browser access:
  kubectl -n argocd port-forward --address 0.0.0.0 svc/argocd-server 8080:80

Login:
  username: admin
  password: (shown above)

EOF
else
  log "Skipping Argo CD install as requested"
fi

log "Bootstrap completed"


