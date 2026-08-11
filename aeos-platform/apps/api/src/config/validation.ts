import { validateEnv } from '@aeos/config';

export function validate(config: Record<string, unknown>): Record<string, unknown> {
  validateEnv();
  return config;
}
