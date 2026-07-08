# Monitoring

This folder is the observability layer for the learning track.

## First Step: Metrics Server

Metrics Server is already required by the app HPAs.

Verify it works:

```bash
kubectl top nodes
kubectl top pods -n propconnect
```

If Metrics Server does not work in Killercoda, add:

```bash
--kubelet-insecure-tls
--kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS
```

to the metrics-server deployment.

## Next Step: Prometheus And Grafana

Use `kube-prometheus-stack` for a full cluster monitoring setup.

Install:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  --create-namespace \
  -f ./kube-prometheus-stack-values.yaml
```

Access Grafana:

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80
```

Open:

```text
http://localhost:3000
```

Default login is usually `admin` / `prom-operator` unless you change the values file.