import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  user: process.env.SMTP_USER || undefined,
  pass: process.env.SMTP_PASS || undefined,
  secure: process.env.SMTP_SECURE === 'true',
  from: process.env.MAIL_FROM || 'AEOS Platform <noreply@aeos.com>',

  maxPerMinute: parseInt(process.env.MAIL_RATE_LIMIT || '30', 10),
}));

export type MailConfig = ReturnType<typeof mailConfig>;
