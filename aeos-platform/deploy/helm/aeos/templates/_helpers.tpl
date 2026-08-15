{{/*
── 1. COMMON LABELS: BỘ NHÃN CHUẨN KUBERNETES ĐƯỢC KHUYẾN NGHỊ ──
Bao gồm tên app, tên release, version app, công cụ quản lý (Helm) và chart package
*/}}
{{- define "aeos.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{/*
════════════════════════════════════════════════════════════════════════════════════
💥 BÀI HỌC PRODUCTION #15: SỰ CỐ TRÀN 63 KÝ TỰ (RFC 1123 DNS LABEL LIMIT)
────────────────────────────────────────────────────────────────────────────────────
⚠️ SỰ CỐ KINH ĐIỂN: Khi deploy branch tính năng qua GitOps, release name thường dài:
  release-aeos-feature-payment-gateway-v2
Khi ghép với chart name -> Tên resource dài hơn 63 ký tự.
-> K8s API Server lập tức từ chối và throw error: "metadata.name: must be no more than 63 characters".
💡 BÍ QUYẾT: Luôn dùng `| trunc 63 | trimSuffix "-"` cho mọi template tạo tên resource!
════════════════════════════════════════════════════════════════════════════════════
*/}}
{{- define "aeos.fullname" -}}
{{ .Release.Name }}-{{ .Chart.Name }}
{{- end }}

{{/*
════════════════════════════════════════════════════════════════════════════════════
💥 BÀI HỌC PRODUCTION #16: TẠI SAO PHẢI TÁCH RIÊNG SELECTOR LABELS (IMMUTABLE LABELS)?
────────────────────────────────────────────────────────────────────────────────────
⚠️ SỰ CỐ KINH ĐIỂN: Nhiều người đưa cả label `version: {{ .Chart.AppVersion }}` vào
`spec.selector.matchLabels`. Khi upgrade chart lên version mới -> matchLabels thay đổi.
-> Kubernetes báo lỗi FATAL: "field is immutable" (K8s cấm sửa spec.selector của Deployment!).
💡 BÍ QUYẾT: Selector Labels CHỈ ĐƯỢC CHỨA các thông tin tĩnh cố định (name, component, instance).
════════════════════════════════════════════════════════════════════════════════════
*/}}
{{- define "aeos.api.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/component: api
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
── 4. WEB SELECTOR LABELS: NHÃN ĐỊNH DANH BẤT BIẾN CHO POD WEB FRONTEND ──
*/}}
{{- define "aeos.web.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/component: web
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
── 5. PGBOUNCER SELECTOR LABELS: NHÃN ĐỊNH DANH CHO POD PGBOUNCER ──
*/}}
{{- define "aeos.pgbouncer.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/component: pgbouncer
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
── 6. DYNAMIC DATABASE HOST BUILDER: BỘ XỬ LÝ ĐỊA CHỈ HOST DATABASE ──
Nếu pgbouncer.enabled = true -> Trỏ host DB vào Service PgBouncer (<fullname>-pgbouncer)
Nếu pgbouncer.enabled = false -> Trỏ trực tiếp vào host DB gốc (.Values.database.host)
*/}}
{{- define "aeos.databaseHost" -}}
{{- if .Values.pgbouncer.enabled -}}
{{ include "aeos.fullname" . }}-pgbouncer
{{- else -}}
{{ .Values.database.host }}
{{- end -}}
{{- end }}
