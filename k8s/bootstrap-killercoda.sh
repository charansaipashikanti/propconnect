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

stage() {
  echo
  echo "============================================================"
  echo "[$(date +%H:%M:%S)] $1"
  echo "============================================================"
}

step() {
  echo "[$(date +%H:%M:%S)] -> $1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_deployments() {
  local namespace="$1"
  if kubectl -n "$namespace" get deployment >/dev/null 2>&1; then
    step "Waiting for deployments in namespace '$namespace' to become Available"
    kubectl -n "$namespace" wait --for=condition=Available deployment --all --timeout=10m
  else
    step "No deployments found yet in namespace '$namespace'"
  fi
}

require_cmd kubectl
require_cmd helm

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
  echo "Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY before running this script." >&2
  exit 1
fi

stage "Bootstrap started"
step "Using AWS region: $AWS_REGION"
step "External Secrets Operator install: $INSTALL_EXTERNAL_SECRETS"
step "NGINX Ingress Controller install: $INSTALL_INGRESS_NGINX"
step "Metrics Server install: $INSTALL_METRICS_SERVER"
step "cert-manager install: $INSTALL_CERT_MANAGER"
step "Killercoda ClusterSecretStore apply: $APPLY_KILLERCODA_STORE"

if [[ "$INSTALL_EXTERNAL_SECRETS" == "true" ]]; then
  stage "1/4 - Installing External Secrets Operator"
  step "Adding Helm repo"
  helm repo add external-secrets https://charts.external-secrets.io >/dev/null
  step "Updating Helm repo cache"
  helm repo update >/dev/null
  step "Installing or upgrading the External Secrets Operator chart"
  helm upgrade --install external-secrets external-secrets/external-secrets \
    -n external-secrets \
    --create-namespace \
    --set installCRDs=true
  wait_for_deployments external-secrets

  stage "1.1 - Creating AWS credential secret for External Secrets Operator"
  step "Writing awssm-secret in external-secrets namespace"
  kubectl -n external-secrets create secret generic awssm-secret \
    --from-literal=access-key="$AWS_ACCESS_KEY_ID" \
    --from-literal=secret-access-key="$AWS_SECRET_ACCESS_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -

  if [[ "$APPLY_KILLERCODA_STORE" == "true" ]]; then
    stage "1.2 - Applying ClusterSecretStore"
    step "Applying $ROOT_DIR/clustersecretstore-aws-killercoda.example.yaml"
    kubectl apply -f "$ROOT_DIR/clustersecretstore-aws-killercoda.example.yaml"
  fi
else
  stage "1 - Skipping External Secrets Operator"
fi

if [[ "$INSTALL_INGRESS_NGINX" == "true" ]]; then
  stage "2/4 - Installing NGINX Ingress Controller"
  step "Adding Helm repo"
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null
  step "Updating Helm repo cache"
  helm repo update >/dev/null
  step "Installing or upgrading the ingress controller chart"
  helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
    -n ingress-nginx \
    --create-namespace
  wait_for_deployments ingress-nginx
else
  stage "2 - Skipping NGINX Ingress Controller"
fi

if [[ "$INSTALL_METRICS_SERVER" == "true" ]]; then
  stage "3/4 - Installing Metrics Server"
  step "Applying upstream Metrics Server manifest"
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

  stage "3.1 - Adding kubelet TLS bypass for playground clusters"
  step "Patching metrics-server deployment for insecure kubelet scraping"
  kubectl -n kube-system patch deployment metrics-server --type='json' -p='[
    {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"},
    {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS"}
  ]' || true
else
  stage "3 - Skipping Metrics Server"
fi

if [[ "$INSTALL_CERT_MANAGER" == "true" ]]; then
  stage "4/4 - Installing cert-manager"
  step "Adding Jetstack Helm repo"
  helm repo add jetstack https://charts.jetstack.io --force-update >/dev/null
  step "Updating Helm repo cache"
  helm repo update >/dev/null
  step "Installing or upgrading the cert-manager chart"
  helm upgrade --install cert-manager jetstack/cert-manager \
    -n cert-manager \
    --create-namespace \
    --set crds.enabled=true
  wait_for_deployments cert-manager
else
  stage "4 - Skipping cert-manager"
fi

stage "Bootstrap finished"
echo "Done. Verify with:"
echo "  kubectl -n external-secrets get pods"
echo "  kubectl -n ingress-nginx get pods"
echo "  kubectl -n kube-system get pods | grep metrics-server"
echo "  kubectl -n cert-manager get pods"
echo "  kubectl get clustersecretstore propconnect-secret-store"
