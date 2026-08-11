
import { registerAs } from '@nestjs/config';

export const observabilityConfig = registerAs('observability', () => ({
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',

  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    port: parseInt(process.env.METRICS_PORT || '9090', 10),
    path: process.env.METRICS_PATH || '/metrics',
  },
  tracing: {
    enabled: process.env.TRACING_ENABLED === 'true',
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://tempo:4318',
    serviceName: process.env.OTEL_SERVICE_NAME || 'aeos-api',
    sampleRate: parseFloat(process.env.OTEL_SAMPLE_RATE || '0.1'),
  },
}));

export type ObservabilityConfig = ReturnType<typeof observabilityConfig>;
