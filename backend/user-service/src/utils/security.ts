import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import validator from 'validator';
import xss from 'xss';

export class SecurityUtils {
  /**
   * Generate a secure password hash
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate 2FA secret and QR code
   */
  static generateTwoFactorSecret(userEmail: string, appName: string = 'Sugar Daddy Platform'): {
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
  } {
    const secret = speakeasy.generateSecret({
      name: `${appName} (${userEmail})`,
      issuer: appName,
      length: 32
    });

    return {
      secret: secret.base32!,
      qrCodeUrl: secret.otpauth_url!,
      otpauthUrl: secret.otpauth_url!
    };
  }

  /**
   * Verify 2FA token
   */
  static verifyTwoFactorToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });
  }

  /**
   * Generate backup codes for 2FA
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string, storedCodes: string[]): boolean {
    const normalizedCode = code.toUpperCase().replace(/\s/g, '');
    const index = storedCodes.indexOf(normalizedCode);
    
    if (index !== -1) {
      // Remove used backup code
      storedCodes.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /letmein/i,
      /welcome/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns and is not secure');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(token: string, secret: string): boolean {
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const data = `${userAgent}:${ipAddress}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Check if password has been breached (HaveIBeenPwned API)
   */
  static async checkPasswordBreach(password: string): Promise<boolean> {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    try {
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();
      
      return data.includes(suffix);
    } catch (error) {
      console.warn('Could not check password breach status:', error);
      return false; // Fail open for availability
    }
  }

  /**
   * Generate secure session token
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Calculate password age in days
   */
  static getPasswordAge(lastChanged: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastChanged.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if IP is from a known VPN/Proxy (basic check)
   */
  static async isSuspiciousIP(ipAddress: string): Promise<boolean> {
    // This is a basic implementation
    // In production, you'd want to use a service like MaxMind or similar
    const suspiciousRanges = [
      '10.', // Private networks
      '192.168.', // Private networks
      '172.16.', '172.17.', '172.18.', '172.19.',
      '172.20.', '172.21.', '172.22.', '172.23.',
      '172.24.', '172.25.', '172.26.', '172.27.',
      '172.28.', '172.29.', '172.30.', '172.31.'
    ];

    return suspiciousRanges.some(range => ipAddress.startsWith(range));
  }
}