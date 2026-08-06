#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAMESPACE="${ARGOCD_NAMESPACE:-argocd}"
MANIFEST_URL="${ARGOCD_MANIFEST_URL:-https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml}"
INSECURE_MODE="${ARGOCD_INSECURE_MODE:-true}"
PORT_HTTP="${ARGOCD_PORT_HTTP:-80}"
PORT_HTTPS="${ARGOCD_PORT_HTTPS:-443}"
FORWARD_PORT="${ARGOCD_FORWARD_PORT:-8080}"

stage() {
  echo
  echo "============================================================"
  echo "[$(date +%H:%M:%S)] $1"
  echo "============================================================"
}

step() {
  echo "[$(date +%H:%M:%S)] -> $1"
}

retry() {
  local attempts="$1"
  shift
  local n=1
  until "$@"; do
    if [[ $n -ge $attempts ]]; then
      return 1
    fi
    step "Command failed, retrying in 10 seconds (attempt $((n + 1))/$attempts)"
    sleep 10
    n=$((n + 1))
  done
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd kubectl

stage "Argo CD bootstrap started"
step "Namespace: $NAMESPACE"
step "Manifest URL: $MANIFEST_URL"
step "Insecure mode: $INSECURE_MODE"

stage "1/5 - Creating namespace"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

stage "2/5 - Installing Argo CD manifests"
step "Waiting for the Kubernetes API server to respond"
retry 6 kubectl get namespaces >/dev/null
step "Applying install manifest with server-side apply"
retry 6 kubectl apply --server-side --force-conflicts -n "$NAMESPACE" -f "$MANIFEST_URL"

stage "3/5 - Waiting for core Argo CD workloads"
for target in \
  deployment/argocd-server \
  deployment/argocd-repo-server \
  deployment/argocd-applicationset-controller \
  deployment/argocd-dex-server \
  deployment/argocd-notifications-controller; do
  if kubectl -n "$NAMESPACE" get "$target" >/dev/null 2>&1; then
    step "Waiting for $target"
    kubectl -n "$NAMESPACE" rollout status "$target" --timeout=10m
  fi
done
if kubectl -n "$NAMESPACE" get statefulset/argocd-application-controller >/dev/null 2>&1; then
  step "Waiting for statefulset/argocd-application-controller"
  kubectl -n "$NAMESPACE" rollout status statefulset/argocd-application-controller --timeout=10m
fi

if [[ "$INSECURE_MODE" == "true" ]]; then
  stage "4/5 - Switching argocd-server to insecure mode"
  if kubectl -n "$NAMESPACE" get deployment argocd-server >/dev/null 2>&1; then
    if kubectl -n "$NAMESPACE" get deployment argocd-server -o jsonpath='{.spec.template.spec.containers[0].args}' 2>/dev/null | grep -q -- '--insecure'; then
      step "argocd-server already has --insecure"
    else
      step "Patching argocd-server deployment"
      kubectl -n "$NAMESPACE" patch deployment argocd-server --type=json -p='[
        {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--insecure"}
      ]'
    fi
    step "Restarting argocd-server"
    kubectl -n "$NAMESPACE" rollout restart deployment/argocd-server
    kubectl -n "$NAMESPACE" rollout status deployment/argocd-server --timeout=10m
  fi
else
  stage "4/5 - Keeping HTTPS mode"
fi

stage "5/5 - Show access details"
ADMIN_SECRET="$(kubectl -n "$NAMESPACE" get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' 2>/dev/null || true)"
if [[ -n "$ADMIN_SECRET" ]]; then
  step "Argo CD initial admin password"
  kubectl -n "$NAMESPACE" get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
  echo
else
  step "Argo CD initial admin password secret is not ready yet"
fi

echo
if [[ "$INSECURE_MODE" == "true" ]]; then
  echo "Port-forward command:"
  echo "  kubectl -n $NAMESPACE port-forward --address 0.0.0.0 svc/argocd-server ${FORWARD_PORT}:${PORT_HTTP}"
  echo "Open the exposed ${FORWARD_PORT} URL from the playground."
else
  echo "Port-forward command:"
  echo "  kubectl -n $NAMESPACE port-forward --address 0.0.0.0 svc/argocd-server ${FORWARD_PORT}:${PORT_HTTPS}"
  echo "Open the exposed ${FORWARD_PORT} URL from the playground over HTTPS."
fi

stage "Argo CD bootstrap finished"
