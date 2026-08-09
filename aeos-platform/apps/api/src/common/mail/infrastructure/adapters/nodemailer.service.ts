import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IMailService,
  SendEmailOptions,
  SendTemplateEmailOptions,
} from '../../application/ports/mail.service.interface';

@Injectable()
export class NodemailerService implements IMailService {
  private readonly logger = new Logger(NodemailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // In a real application, these should come from ConfigService
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"AEOS Platform" <noreply@aeos.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendTemplateEmail(options: SendTemplateEmailOptions): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'infrastructure',
        'templates',
        `${options.template}.hbs`,
      );

      // Wait, let's make the template path robust.
      // Dist folder structure might change. So we should probably put templates in a well known folder or load them reliably.
      // For now, let's use process.cwd() to find the src folder
      const srcPath = path.join(
        process.cwd(),
        'src',
        'common',
        'mail',
        'infrastructure',
        'templates',
        `${options.template}.hbs`,
      );

      const templateFile = await fs.readFile(srcPath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateFile);
      const html = compiledTemplate(options.context);

      await this.sendEmail({
        to: options.to,
        subject: options.subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send template email to ${options.to}`, error);
      throw error;
    }
  }
}
