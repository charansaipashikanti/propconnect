# DevOps End To End

This workspace is the learning layer for the PropConnect project. The goal is to practice the full DevOps cycle with one app as the case study.

## What Lives Here

- `helm/propconnect/` for packaging the Kubernetes app as a Helm chart
- `monitoring/` for Prometheus and Grafana install notes and values

## Learning Flow

1. Build and publish container images
2. Package the app with Helm
3. Deploy with GitOps later using Argo CD
4. Add monitoring and dashboards
5. Extend with Terraform and Ansible later

## Current Practice Goal

For now we are using Killercoda as the runtime cluster and learning how Helm changes the deployment workflow compared with raw YAML.

## Quick Links

- [Helm chart](./helm/propconnect/README.md)
- [Monitoring setup](./monitoring/README.md)