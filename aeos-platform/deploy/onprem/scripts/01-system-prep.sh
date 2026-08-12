#!/bin/bash
# AEOS On-Premise — System Prerequisites
# Run on ALL nodes (server + agent) BEFORE installing K3s.
set -euo pipefail

echo "=== AEOS System Preparation ==="

# Disable swap (K8s requirement)
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Required kernel modules
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay
sudo modprobe br_netfilter

# Kernel parameters
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
net.ipv4.conf.all.forwarding        = 1
# Performance tuning
net.core.somaxconn = 32768
net.ipv4.tcp_max_syn_backlog = 32768
vm.max_map_count = 262144
EOF
sudo sysctl --system

# Open firewall ports (if UFW is active)
if command -v ufw &>/dev/null && sudo ufw status | grep -q "active"; then
  echo "Configuring UFW..."
  sudo ufw allow 6443/tcp    # K8s API server
  sudo ufw allow 10250/tcp   # kubelet
  sudo ufw allow 8472/udp    # VXLAN (Flannel)
  sudo ufw allow 51820/udp   # WireGuard (optional)
  sudo ufw allow 80/tcp      # HTTP
  sudo ufw allow 443/tcp     # HTTPS
  echo "UFW configured."
fi

echo "=== System preparation complete ==="
