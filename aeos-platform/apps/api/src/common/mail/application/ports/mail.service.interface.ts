export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface SendTemplateEmailOptions {
  to: string;
  subject: string;
  template: string; // The name of the template file (e.g. 'invite-member')
  context: Record<string, any>; // Data to inject into the template
}

export const MAIL_SERVICE = Symbol('MAIL_SERVICE');

export interface IMailService {
  sendEmail(options: SendEmailOptions): Promise<void>;
  sendTemplateEmail(options: SendTemplateEmailOptions): Promise<void>;
}
