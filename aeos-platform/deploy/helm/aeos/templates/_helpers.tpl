{{/*
Common labels
*/}}
{{- define "aeos.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{/*
Fullname
*/}}
{{- define "aeos.fullname" -}}
{{ .Release.Name }}-{{ .Chart.Name }}
{{- end }}

{{/*
API selector labels
*/}}
{{- define "aeos.api.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/component: api
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Web selector labels
*/}}
{{- define "aeos.web.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/component: web
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
PgBouncer selector labels
*/}}
{{- define "aeos.pgbouncer.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/component: pgbouncer
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Database URL builder
*/}}
{{- define "aeos.databaseHost" -}}
{{- if .Values.pgbouncer.enabled -}}
{{ include "aeos.fullname" . }}-pgbouncer
{{- else -}}
{{ .Values.database.host }}
{{- end -}}
{{- end }}
