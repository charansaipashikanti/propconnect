# Argo CD

Argo CD is the GitOps deployment tool in this learning track. It runs inside Kubernetes and continuously reconciles the cluster to match what is stored in Git.

## What Argo CD Does

- Watches a Git repository
- Renders Kubernetes manifests from YAML, Kustomize, or Helm
- Syncs cluster state to the desired state in Git
- Detects drift and can self-heal resources
- Lets you roll back to earlier Git revisions

## Important Concept

Argo CD does not deploy from your local laptop folder directly. It needs a Git repository URL that the cluster can reach.

For this project, the usual flow is:

1. Push the PropConnect repo to GitHub
2. Point Argo CD at the `k8s/` folder in that repo
3. Let Argo CD sync the Kubernetes manifests into Killercoda

## Install Argo CD In Killercoda

Use the helper script from the repo root:

```bash
bash devops-end-to-end/argocd/install-argocd.sh
```

If you want to do it manually, the script is doing the same thing: creating the namespace, applying the official Argo CD manifest, waiting for the core workloads, and optionally patching `argocd-server` into insecure mode for playground access.

Wait until the pods are ready:

```bash
kubectl -n argocd get pods
```

## Access The UI

Start with the normal HTTPS port-forward:

```bash
kubectl -n argocd port-forward --address 0.0.0.0 svc/argocd-server 8080:443
```

Open:

```text
https://localhost:8080
```

If Killercoda shows a redirect loop or `ERR_TOO_MANY_REDIRECTS`, switch Argo CD to insecure mode for local learning.

## Killercoda Redirect Fix

Argo CD server can keep redirecting HTTP to HTTPS, which clashes with the Killercoda browser proxy. The local learning fix is:

```bash
kubectl -n argocd patch deployment argocd-server --type=json -p='[
  {"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--insecure"}
]'
```

Then restart it:

```bash
kubectl -n argocd rollout restart deployment argocd-server
kubectl -n argocd rollout status deployment argocd-server
```

After that, forward the HTTP port instead of HTTPS:

```bash
kubectl -n argocd port-forward --address 0.0.0.0 svc/argocd-server 8080:80
```

Open the Killercoda 8080 browser URL again.

## Get The Initial Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Login with:

- username: `admin`
- password: output from the command above

## Create A PropConnect Application

Create a file called `application-propconnect.yaml` from the example in this folder and update:

- `repoURL`
- `targetRevision`
- `path`

Then apply it:

```bash
kubectl apply -f application-propconnect.yaml
```

## Why This Is Useful

- You get GitOps practice without changing the app code
- Deployment history stays in Git
- Sync and rollback become visible in the Argo CD UI
- It is a good interview topic because it shows CI/CD plus continuous reconciliation

## Learning Notes

For now, keep PropConnect deployment logic in the `k8s/` folder and let Argo CD sync that folder. Later, you can switch the same app to Helm without changing the GitOps workflow.

## Debug Notes

Useful checks while Argo CD is starting:

```bash
kubectl -n argocd get pods -w
kubectl -n argocd get svc
kubectl -n argocd logs deploy/argocd-server --tail=100
```

Use `8080:443` for HTTPS mode and `8080:80` after applying `--insecure`.
