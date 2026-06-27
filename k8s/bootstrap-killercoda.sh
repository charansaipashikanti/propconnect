#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AWS_REGION="${AWS_REGION:-ap-south-2}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"
INSTALL_EXTERNAL_SECRETS="${INSTALL_EXTERNAL_SECRETS:-true}"
INSTALL_INGRESS_NGINX="${INSTALL_INGRESS_NGINX:-true}"
INSTALL_METRICS_SERVER="${INSTALL_METRICS_SERVER:-true}"
INSTALL_CERT_MANAGER="${INSTALL_CERT_MANAGER:-true}"
APPLY_KILLERCODA_STORE="${APPLY_KILLERCODA_STORE:-true}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_deployments() {
  local namespace="$1"
  if kubectl -n "$namespace" get deployment >/dev/null 2>&1; then
    kubectl -n "$namespace" wait --for=condition=Available deployment --all --timeout=10m
  fi
}

require_cmd kubectl
require_cmd helm

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
  echo "Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY before running this script." >&2
  exit 1
fi

echo "Using AWS region: $AWS_REGION"

if [[ "$INSTALL_EXTERNAL_SECRETS" == "true" ]]; then
  echo "Installing External Secrets Operator..."
  helm repo add external-secrets https://charts.external-secrets.io >/dev/null
  helm repo update >/dev/null
  helm upgrade --install external-secrets external-secrets/external-secrets \
    -n external-secrets \
    --create-namespace \
    --set installCRDs=true
  wait_for_deployments external-secrets

  echo "Creating AWS credential secret for External Secrets Operator..."
  kubectl -n external-secrets create secret generic awssm-secret \
    --from-literal=access-key="$AWS_ACCESS_KEY_ID" \
    --from-literal=secret-access-key="$AWS_SECRET_ACCESS_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -

  if [[ "$APPLY_KILLERCODA_STORE" == "true" ]]; then
    echo "Applying ClusterSecretStore..."
    kubectl apply -f "$ROOT_DIR/clustersecretstore-aws-killercoda.example.yaml"
  fi
fi

if [[ "$INSTALL_INGRESS_NGINX" == "true" ]]; then
  echo "Installing NGINX Ingress Controller..."
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null
  helm repo update >/dev/null
  helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
    -n ingress-nginx \
    --create-namespace
  wait_for_deployments ingress-nginx
fi

if [[ "$INSTALL_METRICS_SERVER" == "true" ]]; then
  echo "Installing Metrics Server..."
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

  echo "Adding kubelet TLS bypass for playground clusters..."
  kubectl -n kube-system patch deployment metrics-server --type='json' -p='[
    {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"},
    {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS"}
  ]' || true
fi

if [[ "$INSTALL_CERT_MANAGER" == "true" ]]; then
  echo "Installing cert-manager..."
  helm repo add jetstack https://charts.jetstack.io --force-update >/dev/null
  helm repo update >/dev/null
  helm upgrade --install cert-manager jetstack/cert-manager \
    -n cert-manager \
    --create-namespace \
    --set crds.enabled=true
  wait_for_deployments cert-manager
fi

echo "Done. Verify with:"
echo "  kubectl -n external-secrets get pods"
echo "  kubectl -n ingress-nginx get pods"
echo "  kubectl -n kube-system get pods | grep metrics-server"
echo "  kubectl -n cert-manager get pods"
echo "  kubectl get clustersecretstore propconnect-secret-store"