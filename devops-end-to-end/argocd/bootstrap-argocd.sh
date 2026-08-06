#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INSTALL_SCRIPT="$ROOT_DIR/devops-end-to-end/argocd/install-argocd.sh"
PROJECT_FILE="$ROOT_DIR/devops-end-to-end/argocd/project-propconnect.yaml"
APP_FILE="$ROOT_DIR/devops-end-to-end/argocd/application-propconnect.yaml"

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
require bash

log "Installing Argo CD"
bash "$INSTALL_SCRIPT"

log "Applying Argo CD AppProject"
kubectl apply -f "$PROJECT_FILE"

log "Applying PropConnect Application"
kubectl apply -f "$APP_FILE"

log "Current Argo CD application"
kubectl -n argocd get app propconnect 2>/dev/null || true

log "Done. Use the install script output to open the UI and then sync the application."
