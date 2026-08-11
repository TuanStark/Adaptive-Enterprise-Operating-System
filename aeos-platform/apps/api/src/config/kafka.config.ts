import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  enabled: process.env.KAFKA_ENABLED === 'true',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID || 'aeos-api',
  groupId: process.env.KAFKA_GROUP_ID || 'aeos-api-group',

  sasl: process.env.KAFKA_SASL_MECHANISM
    ? {
      mechanism: process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512',
      username: process.env.KAFKA_SASL_USERNAME || '',
      password: process.env.KAFKA_SASL_PASSWORD || '',
    }
    : undefined,

  ssl: process.env.KAFKA_SSL_ENABLED === 'true',
}));

export type KafkaConfig = ReturnType<typeof kafkaConfig>;
