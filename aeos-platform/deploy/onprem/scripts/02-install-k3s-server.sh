#!/bin/bash
# AEOS On-Premise — Install K3s Server (Control Plane)
# Run on the PRIMARY server node only.
set -euo pipefail

echo "=== Installing K3s Server ==="

# K3s with specific flags for production
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC=" \
  server \
  --disable traefik \
  --disable servicelb \
  --write-kubeconfig-mode 644 \
  --tls-san $(hostname -I | awk '{print $1}') \
  --kube-apiserver-arg=audit-log-path=/var/log/k3s-audit.log \
  --kube-apiserver-arg=audit-log-maxage=30 \
  --kube-apiserver-arg=audit-log-maxbackup=10 \
  --kube-apiserver-arg=audit-log-maxsize=100 \
  --kubelet-arg=max-pods=110 \
  " sh -

echo "Waiting for K3s to be ready..."
sleep 10
sudo k3s kubectl get nodes

# Display join token for agent nodes
echo ""
echo "=== K3s Server installed ==="
echo "Node token (for adding agent nodes):"
sudo cat /var/lib/rancher/k3s/server/node-token
echo ""
echo "KUBECONFIG: /etc/rancher/k3s/k3s.yaml"
echo "Copy to local: scp $(hostname -I | awk '{print $1}'):/etc/rancher/k3s/k3s.yaml ~/.kube/config"
