import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type VerificationEmailParams = {
  to: string;
  fullName?: string;
  confirmationUrl: string;
};

type BookingEmailParams = {
  to?: string;
  customerName: string;
  bookingId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status?: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter?: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(params: VerificationEmailParams) {
    const name = params.fullName?.trim() || 'there';
    const safeName = this.escapeHtml(name);
    const safeEmail = this.escapeHtml(params.to);
    const safeConfirmationUrl = this.escapeHtml(params.confirmationUrl);

    const html = `
      <div style="margin:0;padding:24px;background:#f2f4f7;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" style="max-width:600px;width:100%;margin:0 auto;border-collapse:collapse;">
          <tr>
            <td style="background:#1a1a1a;padding:28px 24px;text-align:center;border-top-left-radius:14px;border-top-right-radius:14px;">
              <div style="font-size:44px;line-height:1;font-weight:800;letter-spacing:2px;color:#ffffff;">
                WASH <span style="color:#ee4923;">&amp;</span> GO
              </div>
              <div style="margin-top:8px;color:#c8c8c8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
                Auto Salon Â· Baliwag Branch
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:30px 24px;">
              <p style="margin:0 0 12px;font-size:16px;color:#1f2937;">Hi ${safeName},</p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4b5563;">
                Thanks for signing up at Wash &amp; Go. Confirm your email to activate your account and start booking services.
              </p>
              <p style="margin:0 0 18px;text-align:center;">
                <a href="${safeConfirmationUrl}" style="display:inline-block;background:#ee4923;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;">
                  CONFIRM EMAIL
                </a>
              </p>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">If the button does not work, open this link:</p>
              <p style="margin:0 0 14px;word-break:break-all;font-size:12px;line-height:1.6;color:#374151;">
                <a href="${safeConfirmationUrl}" style="color:#ee4923;text-decoration:none;">${safeConfirmationUrl}</a>
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;">This email was sent to ${safeEmail}.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#1a1a1a;padding:16px 24px;text-align:center;border-bottom-left-radius:14px;border-bottom-right-radius:14px;color:#9ca3af;font-size:11px;">
              Â© ${new Date().getFullYear()} Wash &amp; Go Auto Salon Â· Baliwag Branch
            </td>
          </tr>
        </table>
      </div>
    `;

    await this.sendMail({
      to: params.to,
      subject: 'Confirm your Wash & Go account',
      html,
      text: `Hi ${name}, confirm your account here: ${params.confirmationUrl}`,
    });
  }

  async sendBookingCreatedCustomerEmail(params: BookingEmailParams) {
    if (!params.to) return;

    const html = `
      <p>Hi ${this.escapeHtml(params.customerName)},</p>
      <p>Your booking <strong>${this.escapeHtml(params.bookingId)}</strong> was submitted successfully.</p>
      <ul>
        <li>Service: ${this.escapeHtml(params.serviceName)}</li>
        <li>Date: ${this.escapeHtml(params.date)}</li>
        <li>Time: ${this.escapeHtml(params.timeSlot)}</li>
      </ul>
      <p>We will notify you once your booking is reviewed.</p>
    `;

    await this.sendMail({
      to: params.to,
      subject: `Booking Received - ${params.bookingId}`,
      html,
      text: `Booking ${params.bookingId} was submitted.`,
    });
  }

  async sendBookingCreatedAdminEmail(params: BookingEmailParams) {
    const adminEmails = this.getAdminNotificationEmails();
    if (!adminEmails.length) return;

    const html = `
      <p>New booking submitted.</p>
      <ul>
        <li>Booking ID: ${this.escapeHtml(params.bookingId)}</li>
        <li>Customer: ${this.escapeHtml(params.customerName)}</li>
        <li>Service: ${this.escapeHtml(params.serviceName)}</li>
        <li>Date: ${this.escapeHtml(params.date)}</li>
        <li>Time: ${this.escapeHtml(params.timeSlot)}</li>
      </ul>
    `;

    await this.sendMail({
      to: adminEmails.join(','),
      subject: `New Booking - ${params.bookingId}`,
      html,
      text: `New booking ${params.bookingId} by ${params.customerName}.`,
    });
  }

  async sendBookingStatusEmail(params: BookingEmailParams) {
    if (!params.to) return;

    const safeStatus = this.escapeHtml(params.status || 'UPDATED');
    const html = `
      <p>Hi ${this.escapeHtml(params.customerName)},</p>
      <p>Your booking <strong>${this.escapeHtml(params.bookingId)}</strong> is now <strong>${safeStatus}</strong>.</p>
      <ul>
        <li>Service: ${this.escapeHtml(params.serviceName)}</li>
        <li>Date: ${this.escapeHtml(params.date)}</li>
        <li>Time: ${this.escapeHtml(params.timeSlot)}</li>
      </ul>
      <p>Thank you for choosing Wash &amp; Go.</p>
    `;

    await this.sendMail({
      to: params.to,
      subject: `Booking ${params.bookingId} - ${safeStatus}`,
      html,
      text: `Booking ${params.bookingId} is now ${params.status}.`,
    });
  }

  private async sendMail(input: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: this.getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>('SMTP_HOST');
    const portRaw = this.config.get<string>('SMTP_PORT') || '587';
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const secure = this.config.get<string>('SMTP_SECURE') === 'true';

    if (!host || !user || !pass) {
      throw new InternalServerErrorException(
        'Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.',
      );
    }

    const port = Number(portRaw);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    this.logger.log(`SMTP transporter initialized on ${host}:${port}`);
    return this.transporter;
  }

  private getFromAddress(): string {
    const fromAddress = this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER');
    const fromName = this.config.get<string>('SMTP_FROM_NAME') || 'Wash & Go Auto Salon';
    return `"${fromName}" <${fromAddress}>`;
  }

  private getAdminNotificationEmails(): string[] {
    const raw = this.config.get<string>('ADMIN_NOTIFICATION_EMAILS') || '';
    return raw
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
