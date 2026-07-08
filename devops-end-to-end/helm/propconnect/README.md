# PropConnect Helm Chart

This chart packages the PropConnect Kubernetes resources as a single Helm release.

## Install

```bash
helm install propconnect ./devops-end-to-end/helm/propconnect \
  -n propconnect \
  --create-namespace
```

## Local Learning Setup

For Killercoda, the simplest flow is:

1. Install the cluster add-ons and External Secrets setup.
2. Install this Helm chart.
3. Port-forward the frontend service.

```bash
kubectl -n propconnect port-forward --address 0.0.0.0 svc/propconnect-frontend 8080:80
```

## What To Override

Use `values.yaml` to change:

- image tags
- frontend URL
- ingress host and TLS secret
- replica counts
- HPA settings
- secret store name