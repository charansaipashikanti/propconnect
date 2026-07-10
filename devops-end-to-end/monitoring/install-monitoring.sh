#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_NAME="${MONITORING_RELEASE_NAME:-monitoring}"
NAMESPACE="${MONITORING_NAMESPACE:-monitoring}"
CHART="${MONITORING_CHART:-prometheus-community/kube-prometheus-stack}"
VALUES_FILE="${MONITORING_VALUES_FILE:-$ROOT_DIR/kube-prometheus-stack-values.yaml}"
GRAFANA_PORT="${GRAFANA_PORT:-3000}"
GRAFANA_SERVICE_PORT="${GRAFANA_SERVICE_PORT:-80}"

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
require_cmd helm

if [[ ! -f "$VALUES_FILE" ]]; then
  echo "Values file not found: $VALUES_FILE" >&2
  exit 1
fi

stage "Monitoring bootstrap started"
step "Namespace: $NAMESPACE"
step "Helm chart: $CHART"
step "Release name: $RELEASE_NAME"
step "Values file: $VALUES_FILE"

stage "1/4 - Verifying cluster metrics"
if kubectl top nodes >/dev/null 2>&1; then
  step "Metrics Server is responding"
else
  step "kubectl top is not ready yet; HPA may still work once Metrics Server settles"
fi

stage "2/4 - Installing kube-prometheus-stack"
step "Adding Prometheus Community Helm repo"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null
step "Updating Helm repo cache"
helm repo update >/dev/null
step "Creating namespace if needed"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
step "Installing or upgrading the monitoring release"
helm upgrade --install "$RELEASE_NAME" "$CHART" \
  -n "$NAMESPACE" \
  -f "$VALUES_FILE"

stage "3/4 - Waiting for monitoring workloads"
for target in \
  deployment/${RELEASE_NAME}-grafana \
  deployment/${RELEASE_NAME}-kube-prometheus-operator \
  deployment/${RELEASE_NAME}-kube-state-metrics \
  daemonset/${RELEASE_NAME}-prometheus-node-exporter \
  statefulset/prometheus-${RELEASE_NAME}-kube-prometheus-prometheus; do
  if kubectl -n "$NAMESPACE" get "$target" >/dev/null 2>&1; then
    step "Waiting for $target"
    kubectl -n "$NAMESPACE" rollout status "$target" --timeout=15m || true
  fi
done

stage "4/4 - Show access details"
step "Check pods"
echo "  kubectl -n $NAMESPACE get pods"
step "Open Grafana"
echo "  kubectl -n $NAMESPACE port-forward --address 0.0.0.0 svc/${RELEASE_NAME}-grafana ${GRAFANA_PORT}:${GRAFANA_SERVICE_PORT}"
echo "  Then open the exposed ${GRAFANA_PORT} URL from the playground"

echo
step "Default Grafana login"
echo "  username: admin"
echo "  password: prom-operator (unless you changed the values file)"

stage "Monitoring bootstrap finished"
