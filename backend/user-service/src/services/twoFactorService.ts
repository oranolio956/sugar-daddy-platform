import { User } from '../models/User';
import { TwoFactorAuth } from '../models/TwoFactorAuth';
import { DeviceSession } from '../models/DeviceSession';
import { SecurityUtils } from '../utils/security';
import { EmailService } from './emailService';

export class TwoFactorService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Setup 2FA for a user
   */
  async setupTwoFactor(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate 2FA secret and QR code
    const { secret, qrCodeUrl } = SecurityUtils.generateTwoFactorSecret(user.email);

    // Generate backup codes
    const backupCodes = SecurityUtils.generateBackupCodes(10);

    // Create or update 2FA record
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    
    if (twoFactorAuth) {
      await twoFactorAuth.update({
        secret,
        backupCodes,
        enabled: false,
        setupRequired: true,
      });
    } else {
      await TwoFactorAuth.create({
        userId,
        secret,
        backupCodes,
        enabled: false,
        setupRequired: true,
      });
    }

    // Send email notification
    await this.emailService.sendTwoFactorSetupEmail(user);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Enable 2FA for a user
   */
  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth) {
      throw new Error('2FA not set up');
    }

    // Verify the token
    const isValid = SecurityUtils.verifyTwoFactorToken(token, twoFactorAuth.secret);
    
    if (!isValid) {
      throw new Error('Invalid 2FA token');
    }

    // Enable 2FA
    await twoFactorAuth.update({
      enabled: true,
      enabledAt: new Date(),
      setupRequired: false,
      lastUsedAt: new Date(),
    });

    return true;
  }

  /**
   * Verify 2FA token
   */
  async verifyTwoFactor(userId: string, token: string, deviceId?: string): Promise<boolean> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth || !twoFactorAuth.enabled) {
      throw new Error('2FA not enabled');
    }

    // Check if device is trusted
    if (deviceId && twoFactorAuth.trustedDevices) {
      const trustedDevice = twoFactorAuth.trustedDevices.find(
        (device: any) => device.deviceId === deviceId && new Date() < device.expiresAt
      );

      if (trustedDevice) {
        // Update last used time
        trustedDevice.lastUsed = new Date();
        await twoFactorAuth.update({ trustedDevices: twoFactorAuth.trustedDevices });
        return true;
      }
    }

    // Verify the token
    const isValid = SecurityUtils.verifyTwoFactorToken(token, twoFactorAuth.secret);
    
    if (isValid) {
      await twoFactorAuth.update({ lastUsedAt: new Date() });
    }

    return isValid;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth || !twoFactorAuth.enabled) {
      throw new Error('2FA not enabled');
    }

    const isValid = SecurityUtils.verifyBackupCode(code, twoFactorAuth.backupCodes);
    
    if (isValid) {
      await twoFactorAuth.update({ backupCodes: twoFactorAuth.backupCodes });
    }

    return isValid;
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactor(userId: string, password: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await SecurityUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (twoFactorAuth) {
      await twoFactorAuth.update({
        enabled: false,
        setupRequired: false,
      });
    }

    return true;
  }

  /**
   * Add trusted device
   */
  async addTrustedDevice(userId: string, deviceId: string, deviceName: string, expiresHours: number = 168): Promise<void> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth || !twoFactorAuth.enabled) {
      throw new Error('2FA not enabled');
    }

    const trustedDevice = {
      deviceId,
      deviceName,
      lastUsed: new Date(),
      expiresAt: new Date(Date.now() + expiresHours * 60 * 60 * 1000),
    };

    // Remove old trusted devices (keep max 5)
    const trustedDevices = twoFactorAuth.trustedDevices || [];
    trustedDevices.push(trustedDevice);
    
    if (trustedDevices.length > 5) {
      trustedDevices.shift();
    }

    await twoFactorAuth.update({ trustedDevices });
  }

  /**
   * Remove trusted device
   */
  async removeTrustedDevice(userId: string, deviceId: string): Promise<void> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth) {
      return;
    }

    const trustedDevices = twoFactorAuth.trustedDevices || [];
    const updatedDevices = trustedDevices.filter((device: any) => device.deviceId !== deviceId);
    
    await twoFactorAuth.update({ trustedDevices: updatedDevices });
  }

  /**
   * Get 2FA status for user
   */
  async getTwoFactorStatus(userId: string): Promise<{
    enabled: boolean;
    setupRequired: boolean;
    backupCodesRemaining: number;
    trustedDevices: any[];
  }> {
    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    
    if (!twoFactorAuth) {
      return {
        enabled: false,
        setupRequired: false,
        backupCodesRemaining: 0,
        trustedDevices: [],
      };
    }

    return {
      enabled: twoFactorAuth.enabled,
      setupRequired: twoFactorAuth.setupRequired,
      backupCodesRemaining: twoFactorAuth.backupCodes.length,
      trustedDevices: twoFactorAuth.trustedDevices || [],
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, password: string): Promise<string[]> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await SecurityUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth || !twoFactorAuth.enabled) {
      throw new Error('2FA not enabled');
    }

    const newBackupCodes = SecurityUtils.generateBackupCodes(10);
    await twoFactorAuth.update({ backupCodes: newBackupCodes });

    return newBackupCodes;
  }

  /**
   * Cleanup expired trusted devices
   */
  async cleanupExpiredTrustedDevices(): Promise<void> {
    const twoFactorAuths = await TwoFactorAuth.findAll({
      where: {
        enabled: true,
        trustedDevices: { $ne: [] }
      }
    });

    for (const twoFactorAuth of twoFactorAuths) {
      const trustedDevices = twoFactorAuth.trustedDevices || [];
      const now = new Date();
      
      const validDevices = trustedDevices.filter((device: any) => now < device.expiresAt);
      
      if (validDevices.length !== trustedDevices.length) {
        await twoFactorAuth.update({ trustedDevices: validDevices });
      }
    }
  }

  /**
   * Send backup codes via email (for recovery)
   */
  async sendBackupCodesEmail(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const twoFactorAuth = await TwoFactorAuth.findOne({ where: { userId } });
    if (!twoFactorAuth || !twoFactorAuth.enabled) {
      throw new Error('2FA not enabled');
    }

    // Send email with backup codes (in production, you might want to send them securely)
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: 'Your 2FA Backup Codes',
      html: `
        <p>Hi ${user.username},</p>
        <p>Your 2FA backup codes (use these if you lose access to your authenticator app):</p>
        <ul>
          ${twoFactorAuth.backupCodes.map(code => `<li><strong>${code}</strong></li>`).join('')}
        </ul>
        <p><strong>Important:</strong> Store these codes in a safe place. Each code can only be used once.</p>
      `,
    };

    // Note: In production, you'd want to send this more securely
    // This is just a basic implementation
  }
}