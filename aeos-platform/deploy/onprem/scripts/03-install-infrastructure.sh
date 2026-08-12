#!/bin/bash
# AEOS On-Premise — Install core infrastructure components
# Run AFTER K3s is installed.
set -euo pipefail

HELM="${HELM_BIN:-helm}"
NAMESPACE="aeos"

echo "=== Installing On-Premise Infrastructure ==="

# Create namespace
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# ── MetalLB (LoadBalancer for bare metal) ──
echo "Installing MetalLB..."
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14.9/config/manifests/metallb-native.yaml
sleep 30

# Configure MetalLB IP pool (EDIT THIS for your network)
cat <<'EOF' | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: aeos-pool
  namespace: metallb-system
spec:
  addresses:
    - 192.168.1.240-192.168.1.250  # CHANGE: your available IP range
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: aeos-l2
  namespace: metallb-system
spec:
  ipAddressPools:
    - aeos-pool
EOF

# ── Nginx Ingress Controller ──
echo "Installing Nginx Ingress..."
${HELM} repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
${HELM} repo update
${HELM} upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.metrics.enabled=true \
  --set controller.podAnnotations."prometheus\.io/scrape"=true \
  --set controller.podAnnotations."prometheus\.io/port"=10254

# ── cert-manager ──
echo "Installing cert-manager..."
${HELM} repo add jetstack https://charts.jetstack.io
${HELM} upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set crds.enabled=true

# ClusterIssuer for Let's Encrypt
cat <<'EOF' | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@aeos.com  # CHANGE: your email
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
      - http01:
          ingress:
            class: nginx
EOF

# ── Sealed Secrets ──
echo "Installing Sealed Secrets..."
${HELM} repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
${HELM} upgrade --install sealed-secrets sealed-secrets/sealed-secrets \
  --namespace kube-system

# ── CloudNativePG ──
echo "Installing CloudNativePG operator..."
${HELM} repo add cnpg https://cloudnative-pg.github.io/charts
${HELM} upgrade --install cnpg cnpg/cloudnative-pg \
  --namespace cnpg-system --create-namespace

# ── Redis ──
echo "Installing Redis..."
${HELM} repo add bitnami https://charts.bitnami.com/bitnami
${HELM} upgrade --install redis bitnami/redis \
  --namespace ${NAMESPACE} \
  --set auth.enabled=true \
  --set auth.existingSecret=aeos-redis-credentials \
  --set architecture=standalone \
  --set master.persistence.size=2Gi \
  --set metrics.enabled=true

# ── Kyverno (Policy Engine) ──
echo "Installing Kyverno..."
${HELM} repo add kyverno https://kyverno.github.io/kyverno
${HELM} upgrade --install kyverno kyverno/kyverno \
  --namespace kyverno --create-namespace

echo ""
echo "=== Infrastructure installation complete ==="
echo "Next steps:"
echo "1. Create CNPG PostgreSQL cluster: kubectl apply -f deploy/onprem/database/"
echo "2. Create secrets: kubeseal < secret.yaml | kubectl apply -f -"
echo "3. Deploy AEOS: helm upgrade --install aeos deploy/helm/aeos -f deploy/helm/aeos/values-onprem-prod.yaml -n aeos"
