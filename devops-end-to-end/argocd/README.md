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

## Files In This Folder

- `install-argocd.sh` - installs Argo CD into the cluster
- `project-propconnect.yaml` - defines the Argo CD project and limits it to this repo and namespace
- `application-propconnect.yaml` - tells Argo CD what to deploy
- `bootstrap-argocd.sh` - installs Argo CD, then applies the project and application in one run

## Install Argo CD In Killercoda

Use the helper script from the repo root:

```bash
bash devops-end-to-end/argocd/install-argocd.sh
```

If you want the full reset-friendly flow, use the bootstrap script instead:

```bash
bash devops-end-to-end/argocd/bootstrap-argocd.sh
```

The bootstrap script installs Argo CD, creates the `propconnect` AppProject, and creates the `propconnect` Application that points to the `k8s/` folder.

Wait until the pods are ready:

```bash
kubectl -n argocd get pods
```

## Access The UI

Start with the normal HTTPS port-forward:

```bash
kubectl -n argocd port-forward --address 0.0.0.0 svc/argocd-server 8080:443
```

If Killercoda shows a redirect loop or `ERR_TOO_MANY_REDIRECTS`, switch Argo CD to insecure mode for local learning.

Patch the server:

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

## Get The Initial Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Login with:

- username: `admin`
- password: output from the command above

## Application Details

The application file in this folder points at:

- repoURL: `https://github.com/pavansai-pashikanti07/propconnect.git`
- targetRevision: `feature`
- path: `k8s`
- namespace: `propconnect`

The `propconnect` AppProject allows only that repo and that namespace, which is a good habit even in a lab.

## What To Do After A Cluster Reset

Because the playground refreshes, you should expect Argo CD and the app resources to disappear.

After a reset, rerun:

```bash
bash devops-end-to-end/argocd/bootstrap-argocd.sh
```

That is the repeatable path:

1. reinstall Argo CD
2. recreate the project
3. recreate the application
4. let Argo CD sync the app from Git

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
kubectl -n argocd get app propconnect
```

Use `8080:443` for HTTPS mode and `8080:80` after applying `--insecure`.
