# Monitoring

This folder documents the next observability steps for PropConnect.

The goal is to understand the full flow:

- Metrics Server powers Kubernetes HPA
- Prometheus collects metrics from the cluster
- Grafana visualizes those metrics
- later, the application can expose its own metrics too

## 1. Make Sure Metrics Server Works

### What to do
Run:

```bash
kubectl top nodes
kubectl top pods -n propconnect
```

### Why this matters
Metrics Server is what Kubernetes uses for live CPU and memory metrics.
Your Horizontal Pod Autoscalers in `k8s/backend-hpa.yaml` and `k8s/frontend-hpa.yaml` depend on it.

### What to expect
If it works, you will see CPU and memory numbers for nodes and pods.

### If it fails
HPA will not scale correctly.
In Killercoda, the fix is usually to run Metrics Server with:

```text
--kubelet-insecure-tls
--kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS
```

## 2. Install kube-prometheus-stack

### What to do
From the repo root, run the helper script:

```bash
bash devops-end-to-end/monitoring/install-monitoring.sh
```

If you want the manual Helm commands, the script is doing the same thing behind the scenes:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  -f ./devops-end-to-end/monitoring/kube-prometheus-stack-values.yaml
```

### Why this matters
This installs the standard Kubernetes monitoring stack in one go:

- Prometheus for collecting metrics
- Grafana for dashboards
- kube-state-metrics for Kubernetes object state
- node-exporter for node-level metrics

### What to expect
A new `monitoring` namespace with several running pods.

### If it fails
Check whether Helm is installed and whether the cluster can pull the chart.

## 3. Check the Monitoring Pods

### What to do
Run:

```bash
kubectl -n monitoring get pods
```

### Why this matters
This confirms the stack actually came up.

### What to expect
You should see pods for:

- Prometheus
- Grafana
- kube-state-metrics
- node-exporter

### If it fails
Describe the failing pod and check its events:

```bash
kubectl -n monitoring describe pod <pod-name>
```

## 4. Open Grafana

### What to do
Run:

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80
```

Then open:

```text
http://localhost:3000
```

### Why this matters
Grafana is the visual layer. It turns raw metrics into dashboards you can understand quickly.

### What to expect
A login screen.

Default credentials from the values file:

- username: `admin`
- password: `prom-operator`

### If it fails
Check the service name:

```bash
kubectl -n monitoring get svc
```

## 5. Look at Cluster Metrics

### What to do
After logging into Grafana, explore dashboards for:

- cluster summary
- node CPU and memory
- pod CPU and memory
- namespace resource usage

### Why this matters
This is how you see whether the cluster is healthy and where resources are going.

### What to expect
You should be able to inspect nodes, pods, and workloads visually.

## 6. Understand the Connection to PropConnect

### What to do
Use the dashboards to watch the `propconnect` namespace while the app is running.

### Why this matters
You can see whether the backend or frontend is using too much CPU or memory, or whether replicas need scaling.

### What to expect
The app pods should appear in namespace and pod dashboards once monitoring is working.

### If it fails
The app may still be running fine, but monitoring is not picking it up yet.
That usually means the stack is installed, but the right dashboards or selectors are not being used.

## 7. Add App-Level Metrics Later

### What to do
After cluster monitoring works, expose app metrics from the backend and frontend.

Typical next steps are:

- add a `/metrics` endpoint in the backend
- expose metrics in the frontend if needed
- create `ServiceMonitor` or `PodMonitor` resources

### Why this matters
Cluster monitoring tells you about the Kubernetes layer.
App metrics tell you about the application itself.

### What to expect
You will eventually be able to graph things like:

- request count
- response latency
- error rate
- active sessions
- business events

## 8. Debugging Checklist

If monitoring does not work, check these in order:

1. `kubectl top nodes`
2. `kubectl top pods -n propconnect`
3. `kubectl -n monitoring get pods`
4. `kubectl -n monitoring get svc`
5. `kubectl -n monitoring logs <failing-pod>`
6. `kubectl -n monitoring describe pod <failing-pod>`

## 9. Files In This Folder

- `kube-prometheus-stack-values.yaml`: keeps the monitoring stack light enough for Killercoda
- this README: explains the order of operations and why each step exists

## 10. The Mental Model

Think of monitoring as three layers:

- Metrics Server = keeps HPA working
- Prometheus = stores and queries metrics
- Grafana = displays the metrics

That is the clean path from raw cluster data to useful dashboards.

