# 🧠 Deep Dive: AEOS Deploy Architecture — Bản Chất & Tư Duy Thiết Kế

> Tài liệu này giải thích **TẠI SAO** mọi thứ được thiết kế như vậy, không chỉ **CÁI GÌ**.
> Dành cho Tech Lead / Senior Ops review kiến trúc và dùng làm cẩm nang phỏng vấn.

---

## Mục Lục

1. [Triết lý tổng thể: Tại sao cần deploy/ phức tạp như vậy?](#1-triết-lý-tổng-thể)
2. [Helm Chart: Bộ não của deployment](#2-helm-chart)
3. [K8s Health Probes: Tại sao 3 loại, không phải 1?](#3-health-probes)
4. [NetworkPolicy: Zero Trust trong thực tế](#4-networkpolicy)
5. [PgBouncer: Tại sao cần connection pooler?](#5-pgbouncer)
6. [Ansible vs Bash: Tại sao phải thay?](#6-ansible-vs-bash)
7. [K3s HA: Topology và Failover](#7-k3s-ha)
8. [Vault + External Secrets: Secret lifecycle](#8-vault-eso)
9. [Longhorn vs local-path: Storage trade-offs](#9-longhorn)
10. [Terraform Modules: Tư duy composition](#10-terraform)
11. [ArgoCD App-of-Apps: GitOps thực tế](#11-argocd)
12. [Kyverno: Policy-as-Code mindset](#12-kyverno)
13. [CI/CD Pipeline: Supply chain security](#13-cicd)
14. [Interview Scenarios: Câu hỏi thực tế](#14-interview)

---

## 1. Triết lý Tổng Thể

### Tại sao `deploy/` phức tạp như vậy?

Câu trả lời ngắn: **Vì production không tha thứ.**

Trong development, app crash → restart. Trong production:
- App crash → mất revenue, mất khách hàng
- Secret leak → data breach, lawsuit
- Downtime → SLA violation, penalty

`deploy/` được thiết kế theo nguyên tắc **"Make the right thing easy, the wrong thing hard"**:

```
deploy/
├── ansible/          # "Cách duy nhất" để setup cluster → không ai tự chế script
├── helm/             # "Cách duy nhất" để deploy app → không ai kubectl apply thủ công
├── terraform/        # "Cách duy nhất" để tạo infra AWS → không ai click Console
├── argocd/           # "Cách duy nhất" để release → phải qua Git
└── onprem/           # Database & security manifests
```

### Nguyên tắc "Same Chart, Different Values"

Đây là quyết định kiến trúc quan trọng nhất. Xem file `helm/aeos/values.yaml`:

```yaml
# Cùng 1 Helm chart, chỉ khác values file:
#
# On-Prem:  helm install aeos . -f values-onprem-ha.yaml
# AWS:      helm install aeos . -f values-aws-prod.yaml
#
# TẠI SAO không tách 2 chart riêng?
#
# Vì nếu tách → drift. Chart A thêm feature, quên Chart B.
# Sau 6 tháng, 2 chart hoàn toàn khác nhau.
# Same chart = same behavior guarantee.
#
# Sự khác biệt duy nhất nằm ở INFRASTRUCTURE LAYER:
#
# On-Prem:                          AWS:
# ┌──────────────┐                  ┌──────────────┐
# │ ingress.className: nginx │      │ ingress.className: alb │
# │ database.external: false │      │ database.external: true │
# │ secrets.provider: vault  │      │ secrets.provider: external-secrets │
# │ storage: longhorn        │      │ storage: gp3 (EBS)     │
# └──────────────┘                  └──────────────┘
#
# Application layer HOÀN TOÀN GIỐNG NHAU.
```

> **Interview insight:** Khi được hỏi "Làm sao deploy cùng app lên nhiều môi trường?", câu trả lời là **"Same artifact, different config"** — không phải build lại, không phải chart riêng.

---

## 2. Helm Chart: Bộ Não Của Deployment

### 2.1 `_helpers.tpl` — Tại sao cần template helpers?

```yaml
# _helpers.tpl KHÔNG phải "tiện lợi" — nó là CONTRACT.
#
# Khi team có 10 người, ai cũng tự đặt label khác nhau:
#   Người A: app: aeos-api
#   Người B: component: api
#   Người C: service: aeos
#
# → Service selector không match → traffic không đến pod → 2 giờ debug
#
# _helpers.tpl giải quyết bằng cách DEFINE 1 LẦN, DÙNG MỌI NƠI:

{{- define "aeos.api.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}    # "aeos"
app.kubernetes.io/component: api             # phân biệt api vs web
app.kubernetes.io/instance: {{ .Release.Name }} # phân biệt staging vs prod
{{- end }}

# Mỗi resource PHẢI dùng helper này:
#   Deployment.spec.selector.matchLabels → aeos.api.selectorLabels
#   Service.spec.selector               → aeos.api.selectorLabels
#   NetworkPolicy.spec.podSelector      → aeos.api.selectorLabels
#   PDB.spec.selector                   → aeos.api.selectorLabels
#
# Nếu 1 chỗ sai → tất cả sai cùng lúc → dễ phát hiện hơn là 1 chỗ đúng 3 chỗ sai.
```

### 2.2 ConfigMap — Tại sao tách config ra khỏi Deployment?

```yaml
# BẢN CHẤT: Separation of concerns ở infrastructure level.
#
# KHÔNG tách:
#   Deployment → env: [{name: DATABASE_HOST, value: "..."}] × 20 biến
#   → Mỗi lần đổi 1 biến → phải redeploy → downtime
#
# CÓ tách:
#   ConfigMap → chứa 20 biến
#   Deployment → envFrom: [{configMapRef: aeos-config}]
#   → Đổi ConfigMap → pod tự restart (nhờ checksum annotation)
#
# TRICK QUAN TRỌNG — ConfigMap Checksum:

metadata:
  annotations:
    # Dòng này SHA256 hash toàn bộ ConfigMap.
    # Khi ConfigMap thay đổi → hash đổi → annotation đổi → K8s thấy pod spec thay đổi
    # → trigger rolling update TỰ ĐỘNG.
    checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}

# VÀ MỘT ĐIỂM RẤT HAY — PgBouncer-aware pool sizing:

DATABASE_POOL_MAX: {{ if .Values.pgbouncer.enabled }}"5"{{ else }}"10"{{ end }}

# TẠI SAO 5 vs 10?
# Không có PgBouncer: 5 pods × pool_max=10 = 50 connections đến PostgreSQL (max 200) → OK
# Có PgBouncer: 5 pods × pool_max=5 = 25 connections → PgBouncer → 20 connections đến DB
# PgBouncer "multiplexing" giúp tiết kiệm connection khi scale lên 20 pods.
```

### 2.3 API Deployment — Giải phẫu chi tiết

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0    # ← QUAN TRỌNG: KHÔNG BAO GIỜ giảm dưới desired count
      maxSurge: 1          # ← Tạo 1 pod mới TRƯỚC KHI xóa pod cũ

      # TẠI SAO maxUnavailable: 0?
      # maxUnavailable: 1 nghĩa là: Desired=2, Available=1 trong lúc update → 50% capacity
      # Nếu đúng lúc đó traffic spike → 1 pod gánh hết → OOM → crash
      # maxUnavailable: 0 → Luôn có ≥ desired pods → không mất capacity

  template:
    spec:
      # ── TOPOLOGY SPREAD ──
      topologySpreadConstraints:
        - maxSkew: 1                           # Chênh lệch tối đa 1 pod giữa các node
          topologyKey: kubernetes.io/hostname   
          whenUnsatisfiable: DoNotSchedule      

          # TẠI SAO không dùng podAntiAffinity?
          # AntiAffinity "hard": 1 pod/node → 2 nodes, 3 replicas → 1 pod Pending
          # Spread: maxSkew=1 → node1 (2 pods), node2 (1 pod) → OK

      # ── INIT CONTAINERS ──
      initContainers:
        - name: wait-for-db
          image: busybox:1.36
          command: ['sh', '-c', 'until nc -z {{ database_host }} 5432; do sleep 2; done']

          # TẠI SAO không để app tự retry?
          # App crash → CrashLoopBackOff → K8s tăng backoff (10s → 5 phút)
          # Init block ở đây → app chỉ start khi DB ready → fast startup

      containers:
        - name: api
          # ── GRACEFUL SHUTDOWN ──
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 15"]

              # TẠI SAO CẦN SLEEP 15S?
              # K8s báo pod dừng = Endpoints Controller remove IP khỏi Service.
              # Việc này mất 5-15s để propagate đến kube-proxy.
              # Nếu app shutdown ngay lập tức → kube-proxy vẫn gửi traffic đến → 502 error.
              # Sleep 15s → chờ kube-proxy update xong → mới gửi SIGTERM cho app → zero dropped requests.

          # ── SECURITY CONTEXT ──
          securityContext:
            allowPrivilegeEscalation: false
            runAsNonRoot: true               
            readOnlyRootFilesystem: true     
            capabilities:
              drop: ["ALL"]                  

            # Nhốt attacker: non-root, read-only FS, không capabilities
            # RCE bug cũng không giúp attacker phá hoại được node.
```

---

## 3. Health Probes: Tại Sao 3 Loại?

```
Q: "Sự khác nhau giữa liveness và readiness probe?"

Sai: "Liveness kiểm tra app sống, readiness kiểm tra app sẵn sàng."
Đúng: Trả lời dựa trên HÀNH ĐỘNG K8s LÀM khi fail.

┌─────────────┬──────────────────────────────────────────────┐
│ Probe       │ Khi FAIL, K8s làm gì?                       │
├─────────────┼──────────────────────────────────────────────┤
│ startup     │ Fail → RESTART pod. Cho app thời gian boot. │
├─────────────┼──────────────────────────────────────────────┤
│ liveness    │ Fail → RESTART pod.                         │
├─────────────┼──────────────────────────────────────────────┤
│ readiness   │ Fail → NGỪNG GỬI TRAFFIC đến pod (remove IP).│
└─────────────┴──────────────────────────────────────────────┘

VÌ VẬY:
- Startup: Check DB. Cho Prisma 15s cold start.
- Liveness: CHỈ check memory. KHÔNG check DB. Nếu DB down, restart app cũng không giải quyết được, chỉ tạo restart loop.
- Readiness: Check DB/Redis. DB down → ngừng traffic đến pod → chờ DB up → nhận traffic lại. Zero downtime.
```

---

## 4. NetworkPolicy: Zero Trust

```yaml
# TRIẾT LÝ: Default Deny → Explicit Allow
# K8s mặc định mọi pod nói chuyện được với nhau. Hacked 1 pod = hacked all.

spec:
  podSelector: {}    # Apply cho ALL pods
  policyTypes:
    - Ingress
    - Egress         # Deny ALL

# Explicit rules:
# Web → API:3000
# API → PgBouncer:5432, Redis:6379, External:443
#
# Web KHÔNG THỂ gọi DB/Redis.

egress:
  - to:
      - ipBlock:
          cidr: 0.0.0.0/0
          except:
            - 10.0.0.0/8           # Block internal network outbound
    ports:
      - port: 443                  # Chỉ cho phép gọi external API
```

---

## 5. PgBouncer: Connection Pooling

```
Q: "Khi nào cần PgBouncer?"

PostgreSQL fork 1 process (~10MB RAM) cho 1 connection.
10 pods × 10 conn = 100 processes = 1GB RAM chỉ cho connections.

PgBouncer (Transaction mode):
50 clients → PgBouncer → 20 server connections.
Query xong → connection trả về pool cho pod khác mượn.
→ RAM tiết kiệm, DB không bị overload.

Q: "Khi nào KHÔNG nên dùng?"
- Dùng LISTEN/NOTIFY (cần persistent connection)
- Advisory locks
- Chạy migrations (DDL cần connect trực tiếp DB)
```

---

## 6. Ansible vs Bash

```
Bash (01-system-prep.sh):
  echo "overlay" >> /etc/modules-load.d/k8s.conf
  Chạy 3 lần → có 3 dòng. Fail giữa chừng → không biết chạy lại từ đâu.

Ansible (system-prep role):
  IDEMPOTENT: Chạy bao nhiêu lần cũng cho cùng 1 kết quả.
  RESUMABLE: Fail ở task 7 → fix → chạy lại → task 1-6 skip → chạy từ 7.
  OBSERVABLE: Output rõ ok/changed/failed.
```

---

## 7. K3s HA: Topology & Failover

```
                    ┌─────────────────┐
                    │   HAProxy VIP   │  192.168.1.200:6443
                    │   (Keepalived)  │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  master-01   │  │  master-02   │  │  master-03   │
  │  etcd leader │  │  etcd follower│ │  etcd follower│
  └──────────────┘  └──────────────┘  └──────────────┘

TẠI SAO 3 master?
etcd dùng Raft consensus → cần MAJORITY (quá bán).
2 nodes → majority 2 → chết 1 là sập.
3 nodes → majority 2 → chịu được 1 node chết.

TẠI SAO cần VIP?
Master-01 chết → VIP (192.168.1.200) tự chuyển sang Master-02 (nhờ Keepalived).
Worker nodes và kubectl không bị mất kết nối API server.
```

---

## 8. Vault + External Secrets

```
K8s Secrets: Base64, không rotate tự động, không audit.
Sealed Secrets: Encrypted in git, nhưng manual rotate.

Vault + ESO:
- Vault: Encrypted at rest, audit trail, auto-rotate, dynamic secrets.
- ESO: Tự fetch secret từ Vault → tạo K8s secret → update mỗi 1h.
→ Secret lifecycle an toàn tuyệt đối.
```

---

## 9. Longhorn Storage

```
local-path (K3s default):
Data lưu trên 1 node. Node chết = MẤT DATA.

Longhorn:
- Data replicate sang N nodes (vd: 2).
- Node 1 chết → K8s reschedule pod sang Node 2.
- Longhorn mount replica từ Node 2 → app có data chạy tiếp. RPO=0.
- Trade-off: write amplification (ghi 1 MB thành 2 MB), network IO.
```

---

## 10. Terraform Modules

```hcl
# TẠI SAO Aurora Serverless v2?
#
# RDS db.t4g.micro: Fixed cost ~$15/month dù không ai dùng. Scale = manual downtime.
# Aurora v2: Auto-scale ACU.
#   min_capacity = 0.5 ACU (lúc rảnh)
#   max_capacity = 4 ACU (lúc peak)
# Scale tức thì, không downtime, pay-per-use.

# Writer + Reader pattern:
# Writer: Nhận INSERT/UPDATE
# Reader: Nhận SELECT (giảm tải writer)
```

---

## 11. ArgoCD App-of-Apps

```
App-of-Apps: 1 Application root tạo ra n Application con (Prometheus, Kyverno, App...).
→ Chỉ cần `kubectl apply -f app-of-apps.yaml` là có toàn bộ cluster stack.
→ RTO (Recovery Time Objective) tính bằng phút.

Image Updater:
Detect new image tag trong GHCR → update git repo → ArgoCD tự deploy.
→ CD process gọn nhẹ, semantic versioning.
```

---

## 12. Kyverno: Policy-as-Code

```yaml
# K8s guardrails:
# 12 policies bảo vệ cluster khỏi human error & attack:
# - Cấm `:latest` tag (nguyên nhân 90% drift bug)
# - Bắt buộc set limits (chống ồn ào OOM)
# - Cấm privileged containers, require seccomp
#
# Audit mode vs Enforce mode:
# Áp dụng Audit trước, khi sạch vi phạm mới bật Enforce.
```

---

## 13. Interview Scenarios (Kinh nghiệm thực chiến)

### Scenario 1: "Database bị chậm, latency tăng"
- **ĐÚNG:** Readiness probe check DB > 5s → fail → K8s rút IP pod khỏi service → traffic ngưng tới pod đó → User thấy 503 thay vì 500 timeout.
- **KHÔNG restart pod:** Liveness chỉ check memory. Chờ DB phục hồi, readiness pass lại, traffic resume.

### Scenario 2: "Node chết đột ngột"
- K8s detect node chết sau 40s. PDB giữ minAvailable.
- Stateful Pod (PostgreSQL) dời qua node mới, Longhorn mount replica.
- Stateless Pod (API) tạo lại tức thì. topologySpreadConstraints phân bổ đều.

### Scenario 3: "Secret bị leak lên Git"
1. Gitleaks trong CI chặn PR merge.
2. NẾU lọt: Đổi ngay trong Vault. ESO tự cập nhật K8s Secret, pod reload. Dọn Git history, rotate token sessions.
