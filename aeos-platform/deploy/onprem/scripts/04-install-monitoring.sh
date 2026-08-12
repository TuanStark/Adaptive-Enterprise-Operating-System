#!/bin/bash
# Install Prometheus + Grafana + Loki monitoring stack
set -euo pipefail

HELM="${HELM_BIN:-helm}"
NAMESPACE="monitoring"

echo "=== Installing Monitoring Stack ==="

${HELM} repo add prometheus-community https://prometheus-community.github.io/helm-charts
${HELM} repo add grafana https://grafana.github.io/helm-charts
${HELM} repo update

# ── kube-prometheus-stack (Prometheus + Grafana + AlertManager) ──
${HELM} upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace ${NAMESPACE} --create-namespace \
  --set grafana.adminPassword=admin \
  --set prometheus.prometheusSpec.retention=15d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=10Gi \
  --set alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage=2Gi \
  --set grafana.persistence.enabled=true \
  --set grafana.persistence.size=5Gi

# ── Loki (Log aggregation) ──
${HELM} upgrade --install loki grafana/loki-stack \
  --namespace ${NAMESPACE} \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=10Gi \
  --set promtail.enabled=true

# ── Tempo (Distributed tracing) ──
${HELM} upgrade --install tempo grafana/tempo \
  --namespace ${NAMESPACE} \
  --set persistence.enabled=true \
  --set persistence.size=5Gi

echo ""
echo "=== Monitoring stack installed ==="
echo "Grafana: kubectl port-forward svc/monitoring-grafana 3000:80 -n ${NAMESPACE}"
echo "Default login: admin / admin"
