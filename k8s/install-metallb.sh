#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAMESPACE="${METALLB_NAMESPACE:-metallb-system}"
RELEASE_NAME="${METALLB_RELEASE_NAME:-metallb}"
POOL_FILE="${METALLB_POOL_FILE:-$ROOT_DIR/k8s/metallb-pool.yaml}"
INGRESS_NAMESPACE="${INGRESS_NAMESPACE:-ingress-nginx}"
INGRESS_SERVICE="${INGRESS_SERVICE:-ingress-nginx-controller}"

log() {
  printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"
}

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

log "Checking prerequisites"
require kubectl
require helm

log "Creating MetalLB namespace if needed"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

log "Adding MetalLB Helm repository"
helm repo add metallb https://metallb.github.io/metallb >/dev/null
helm repo update >/dev/null

log "Installing or upgrading MetalLB"
helm upgrade --install "$RELEASE_NAME" metallb/metallb \
  --namespace "$NAMESPACE" \
  --create-namespace

log "Waiting for MetalLB controller and speakers to become ready"
kubectl -n "$NAMESPACE" rollout status deployment/metallb-controller --timeout=180s
kubectl -n "$NAMESPACE" rollout status daemonset/metallb-speaker --timeout=180s

log "Waiting for the webhook service to publish endpoints"
for _ in {1..30}; do
  if kubectl -n "$NAMESPACE" get endpoints metallb-webhook-service -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null | grep -q .; then
    break
  fi
  sleep 2
done

kubectl -n "$NAMESPACE" get pods

log "Applying the Layer 2 address pool"
if [[ ! -f "$POOL_FILE" ]]; then
  echo "Missing MetalLB pool file: $POOL_FILE" >&2
  exit 1
fi
kubectl apply -f "$POOL_FILE"

log "Ensuring the ingress controller service can receive a LoadBalancer IP"
if kubectl -n "$INGRESS_NAMESPACE" get svc "$INGRESS_SERVICE" >/dev/null 2>&1; then
  kubectl -n "$INGRESS_NAMESPACE" patch svc "$INGRESS_SERVICE" \
    --type merge \
    -p '{"spec":{"type":"LoadBalancer"}}'
fi

log "Current MetalLB resources"
kubectl -n "$NAMESPACE" get ipaddresspool,l2advertisement

log "Current ingress controller service"
kubectl -n "$INGRESS_NAMESPACE" get svc "$INGRESS_SERVICE" -o wide

log "Done. Next checks:"
cat <<'EOF'
  kubectl -n metallb-system get pods
  kubectl -n metallb-system get ipaddresspool,l2advertisement
  kubectl -n ingress-nginx get svc ingress-nginx-controller -o wide
EOF
