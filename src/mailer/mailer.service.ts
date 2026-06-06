import { Injectable } from '@nestjs/common';
import fs from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import Handlebars from 'handlebars';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailerService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.resend = new Resend(
      configService.getOrThrow('mail.resendApiKey', { infer: true }),
    );
  }

  async sendMail({
    templatePath,
    context,
    to,
    subject,
    from,
    html,
  }: {
    to: string;
    subject?: string;
    from?: string;
    html?: string;
    templatePath?: string;
    context?: Record<string, unknown>;
  }): Promise<void> {
    let finalHtml: string | undefined = html;

    if (templatePath && context) {
      const template = await fs.readFile(templatePath, 'utf-8');
      finalHtml = Handlebars.compile(template, {
        strict: true,
      })(context);
    }

    const fromAddress =
      from ||
      `${this.configService.get('mail.defaultName', {
        infer: true,
      })} <${this.configService.get('mail.defaultEmail', {
        infer: true,
      })}>`;

    if (!finalHtml) {
      throw new Error('Email template must have HTML content');
    }

    if (!subject) {
      throw new Error('Email subject is required');
    }

    await this.resend.emails.send({
      to,
      subject,
      from: fromAddress,
      html: finalHtml,
    });
  }
}
