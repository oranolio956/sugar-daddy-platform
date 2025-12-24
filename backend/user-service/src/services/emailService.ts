import nodemailer from 'nodemailer';
import { EmailVerification } from '../models/EmailVerification';
import { User } from '../models/User';
import { SecurityUtils } from '../utils/security';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private appName: string;
  private baseUrl: string;

  constructor() {
    this.appName = process.env.APP_NAME || 'Sugar Daddy Platform';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user: User): Promise<void> {
    const token = SecurityUtils.generateToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create verification record
    await EmailVerification.create({
      userId: user.id,
      email: user.email,
      token,
      expiresAt,
    });

    const verificationUrl = `${this.baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: this.getEmailVerificationTemplate(user.username, verificationUrl),
      text: this.getEmailVerificationText(user.username, verificationUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send email verification reminder
   */
  async sendEmailVerificationReminder(user: User): Promise<void> {
    const verificationUrl = `${this.baseUrl}/verify-email?token=${SecurityUtils.generateToken(32)}`;

    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Complete Your Email Verification',
      html: this.getEmailVerificationReminderTemplate(user.username, verificationUrl),
      text: this.getEmailVerificationReminderText(user.username, verificationUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send verification success notification
   */
  async sendVerificationSuccessNotification(user: User): Promise<void> {
    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Email Verified Successfully',
      html: this.getVerificationSuccessTemplate(user.username),
      text: this.getVerificationSuccessText(user.username),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user: User): Promise<void> {
    const token = SecurityUtils.generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create password reset record
    await user.createPasswordReset({
      token,
      expiresAt,
    });

    const resetUrl = `${this.baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset Your Password',
      html: this.getPasswordResetTemplate(user.username, resetUrl),
      text: this.getPasswordResetText(user.username, resetUrl),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send 2FA setup email
   */
  async sendTwoFactorSetupEmail(user: User): Promise<void> {
    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Two-Factor Authentication Setup Required',
      html: this.getTwoFactorSetupTemplate(user.username),
      text: this.getTwoFactorSetupText(user.username),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlertEmail(user: User, alertType: string, details: any): Promise<void> {
    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Security Alert',
      html: this.getSecurityAlertTemplate(user.username, alertType, details),
      text: this.getSecurityAlertText(user.username, alertType, details),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send device login notification
   */
  async sendDeviceLoginNotification(user: User, deviceInfo: any): Promise<void> {
    const mailOptions = {
      from: `"${this.appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'New Device Login',
      html: this.getDeviceLoginTemplate(user.username, deviceInfo),
      text: this.getDeviceLoginText(user.username, deviceInfo),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Email verification HTML template
   */
  private getEmailVerificationTemplate(username: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${this.appName}!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${username},</p>
            <p>Thank you for joining ${this.appName}. To complete your registration and start connecting with amazing people, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p><strong>Or copy and paste this link into your browser:</strong></p>
            <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email verification text template
   */
  private getEmailVerificationText(username: string, verificationUrl: string): string {
    return `
Welcome to ${this.appName}!

Hi ${username},

Thank you for joining ${this.appName}. To complete your registration and start connecting with amazing people, please verify your email address by visiting the following link:

${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with us, please ignore this email.

Best regards,
The ${this.appName} Team

This is an automated message, please do not reply to this email.
    `;
  }

  /**
   * Password reset HTML template
   */
  private getPasswordResetTemplate(username: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hi ${username},</p>
            <p>We received a request to reset the password for your account. If you made this request, click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and your account will remain secure.
            </div>
            <p><strong>Or copy and paste this link into your browser:</strong></p>
            <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p>If you didn't request a password reset, please:</p>
            <ul>
              <li>Ignore this email - your password will not be changed</li>
              <li>Check your account for any unauthorized activity</li>
              <li>Consider changing your password if you suspect your account has been compromised</li>
            </ul>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password reset text template
   */
  private getPasswordResetText(username: string, resetUrl: string): string {
    return `
Password Reset Request

Hi ${username},

We received a request to reset the password for your account. If you made this request, visit the following link to reset your password:

${resetUrl}

SECURITY NOTICE: This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and your account will remain secure.

If you didn't request a password reset, please:
- Ignore this email - your password will not be changed
- Check your account for any unauthorized activity
- Consider changing your password if you suspect your account has been compromised

Best regards,
The ${this.appName} Team

This is an automated message, please do not reply to this email.
    `;
  }

  /**
   * 2FA setup HTML template
   */
  private getTwoFactorSetupTemplate(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Enable Two-Factor Authentication</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .security-badge { background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Security Enhancement</h1>
          </div>
          <div class="content">
            <h2>Enable Two-Factor Authentication</h2>
            <p>Hi ${username},</p>
            <p>Your account security is important to us. We recommend enabling Two-Factor Authentication (2FA) to add an extra layer of protection to your account.</p>
            
            <div class="security-badge">
              <strong>Benefits of 2FA:</strong>
              <ul>
                <li>Protects your account even if your password is compromised</li>
                <li>Prevents unauthorized access from unknown devices</li>
                <li>Keeps your personal information and conversations secure</li>
              </ul>
            </div>

            <p>To set up 2FA, please log in to your account and navigate to:</p>
            <p><strong>Settings → Security → Two-Factor Authentication</strong></p>
            
            <p>You'll be guided through a simple setup process that takes just a few minutes.</p>
            
            <p>For questions about 2FA or account security, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Security Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 2FA setup text template
   */
  private getTwoFactorSetupText(username: string): string {
    return `
Security Enhancement - Enable Two-Factor Authentication

Hi ${username},

Your account security is important to us. We recommend enabling Two-Factor Authentication (2FA) to add an extra layer of protection to your account.

Benefits of 2FA:
- Protects your account even if your password is compromised
- Prevents unauthorized access from unknown devices
- Keeps your personal information and conversations secure

To set up 2FA, please log in to your account and navigate to:
Settings → Security → Two-Factor Authentication

You'll be guided through a simple setup process that takes just a few minutes.

For questions about 2FA or account security, please contact our support team.

Best regards,
The ${this.appName} Security Team

This is an automated message, please do not reply to this email.
    `;
  }

  /**
   * Security alert HTML template
   */
  private getSecurityAlertTemplate(username: string, alertType: string, details: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .alert-box { background: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Security Alert</h1>
          </div>
          <div class="content">
            <h2>Unusual Activity Detected</h2>
            <p>Hi ${username},</p>
            <p>We've detected unusual activity on your account that requires your attention.</p>
            
            <div class="alert-box">
              <strong>Alert Type:</strong> ${alertType}<br>
              <strong>Details:</strong> ${JSON.stringify(details, null, 2)}<br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </div>

            <p><strong>What should you do?</strong></p>
            <ul>
              <li>Review the activity details above</li>
              <li>If this was you, no action is needed</li>
              <li>If this wasn't you, please secure your account immediately</li>
              <li>Change your password if you suspect unauthorized access</li>
              <li>Enable Two-Factor Authentication if not already enabled</li>
            </ul>

            <p><strong>Need help?</strong> Contact our security team at security@${this.appName.toLowerCase().replace(/\s+/g, '')}.com</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Security Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Security alert text template
   */
  private getSecurityAlertText(username: string, alertType: string, details: any): string {
    return `
Security Alert - Unusual Activity Detected

Hi ${username},

We've detected unusual activity on your account that requires your attention.

ALERT TYPE: ${alertType}
DETAILS: ${JSON.stringify(details, null, 2)}
TIME: ${new Date().toLocaleString()}

What should you do?
- Review the activity details above
- If this was you, no action is needed
- If this wasn't you, please secure your account immediately
- Change your password if you suspect unauthorized access
- Enable Two-Factor Authentication if not already enabled

Need help? Contact our security team at security@${this.appName.toLowerCase().replace(/\s+/g, '')}.com

Best regards,
The ${this.appName} Security Team

This is an automated message, please do not reply to this email.
    `;
  }

  /**
   * Device login notification HTML template
   */
  private getDeviceLoginTemplate(username: string, deviceInfo: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Device Login</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .device-info { background: #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📱 New Device Login</h1>
          </div>
          <div class="content">
            <h2>Login from New Device</h2>
            <p>Hi ${username},</p>
            <p>We noticed a login to your account from a new device. Here are the details:</p>
            
            <div class="device-info">
              <strong>Device Information:</strong><br>
              User Agent: ${deviceInfo.userAgent || 'Unknown'}<br>
              IP Address: ${deviceInfo.ipAddress || 'Unknown'}<br>
              Location: ${deviceInfo.location || 'Unknown'}<br>
              Time: ${new Date().toLocaleString()}
            </div>

            <p><strong>Was this you?</strong></p>
            <p>If this was you, no action is needed. You can trust this device in your account settings.</p>
            
            <p><strong>If this wasn't you:</strong></p>
            <ul>
              <li>Change your password immediately</li>
              <li>Review your account activity</li>
              <li>Contact our support team</li>
              <li>Consider enabling Two-Factor Authentication</li>
            </ul>

            <p>For your security, we recommend reviewing all active sessions and logging out of any devices you don't recognize.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Security Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Device login notification text template
   */
  private getDeviceLoginText(username: string, deviceInfo: any): string {
    return `
New Device Login Notification

Hi ${username},

We noticed a login to your account from a new device. Here are the details:

DEVICE INFORMATION:
User Agent: ${deviceInfo.userAgent || 'Unknown'}
IP Address: ${deviceInfo.ipAddress || 'Unknown'}
Location: ${deviceInfo.location || 'Unknown'}
Time: ${new Date().toLocaleString()}

Was this you?
If this was you, no action is needed. You can trust this device in your account settings.

If this wasn't you:
- Change your password immediately
- Review your account activity
- Contact our support team
- Consider enabling Two-Factor Authentication

For your security, we recommend reviewing all active sessions and logging out of any devices you don't recognize.

Best regards,
The ${this.appName} Security Team

This is an automated message, please do not reply to this email.
    `;
  }

  /**
   * Email verification reminder HTML template
   */
  private getEmailVerificationReminderTemplate(username: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Complete Your Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .highlight { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Complete Your Registration</h1>
          </div>
          <div class="content">
            <h2>Almost There, ${username}!</h2>
            <p>We noticed you haven't verified your email address yet. To unlock all features and start connecting with amazing people, please verify your email.</p>
            
            <div class="highlight">
              <strong>What happens after verification?</strong>
              <ul>
                <li>Access to premium features</li>
                <li>Ability to send and receive messages</li>
                <li>Verified profile badge</li>
                <li>Enhanced security</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Now</a>
            </div>
            
            <p><strong>Or copy and paste this link into your browser:</strong></p>
            <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            
            <p>Need help? Contact our support team at support@${this.appName.toLowerCase().replace(/\s+/g, '')}.com</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email verification reminder text template
   */
  private getEmailVerificationReminderText(username: string, verificationUrl: string): string {
    return `
Complete Your Registration

Hi ${username},

We noticed you haven't verified your email address yet. To unlock all features and start connecting with amazing people, please verify your email.

What happens after verification?
- Access to premium features
- Ability to send and receive messages
- Verified profile badge
- Enhanced security

Verify your email now:
${verificationUrl}

Need help? Contact our support team at support@${this.appName.toLowerCase().replace(/\s+/g, '')}.com

Best regards,
The ${this.appName} Team

This is an automated message, please do not reply to this email.
    `;
  }

  /**
   * Verification success HTML template
   */
  private getVerificationSuccessTemplate(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Verified Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8fafc; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .success-badge { background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Email Verified!</h1>
          </div>
          <div class="content">
            <h2>Welcome to ${this.appName}, ${username}!</h2>
            
            <div class="success-badge">
              <strong>Your email has been successfully verified!</strong>
            </div>

            <p>Your account is now fully activated and you can:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Start browsing matches</li>
              <li>Send and receive messages</li>
              <li>Access premium features</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/dashboard" class="button">Get Started</a>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Complete your profile with photos and details</li>
              <li>Set your preferences and interests</li>
              <li>Start connecting with compatible matches</li>
            </ol>

            <p>If you have any questions, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Team</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verification success text template
   */
  private getVerificationSuccessText(username: string): string {
    return `
Email Verified Successfully

Welcome to ${this.appName}, ${username}!

Your email has been successfully verified!

Your account is now fully activated and you can:
- Complete your profile
- Start browsing matches
- Send and receive messages
- Access premium features

Next Steps:
1. Complete your profile with photos and details
2. Set your preferences and interests
3. Start connecting with compatible matches

Get started: ${this.baseUrl}/dashboard

If you have any questions, our support team is here to help!

Best regards,
The ${this.appName} Team

This is an automated message, please do not reply to this email.
    `;
  }
}