import { 
  validateEmail, 
  validatePassword, 
  sanitizeInput, 
  generateCSRFToken, 
  validateCSRFToken,
  encryptData,
  decryptData,
  validatePhoneNumber,
  validateUsername,
  rateLimitCheck,
  validateInputLength,
  sanitizeHTML,
  validateURL,
  generateSecureRandomString,
  hashPassword,
  verifyPassword
} from './security';

describe('Security Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPassword123!')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
      expect(validatePassword('Complex123!@#')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('123')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('PASSWORD')).toBe(false);
      expect(validatePassword('password123')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>');
      expect(sanitizeInput('Hello <b>world</b>')).toBe('Hello <b>world</b>');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });

  describe('CSRF Token Functions', () => {
    it('should generate and validate CSRF tokens', () => {
      const token = generateCSRFToken();
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
      expect(validateCSRFToken(token)).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      expect(validateCSRFToken('invalid-token')).toBe(false);
      expect(validateCSRFToken('')).toBe(false);
      expect(validateCSRFToken(null)).toBe(false);
    });
  });

  describe('Encryption Functions', () => {
    const testData = 'sensitive data';
    const password = 'test-password';

    it('should encrypt and decrypt data', () => {
      const encrypted = encryptData(testData, password);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData);

      const decrypted = decryptData(encrypted, password);
      expect(decrypted).toBe(testData);
    });

    it('should fail to decrypt with wrong password', () => {
      const encrypted = encryptData(testData, password);
      expect(() => decryptData(encrypted, 'wrong-password')).toThrow();
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate US phone numbers', () => {
      expect(validatePhoneNumber('+1-555-123-4567')).toBe(true);
      expect(validatePhoneNumber('(555) 123-4567')).toBe(true);
      expect(validatePhoneNumber('555-123-4567')).toBe(true);
      expect(validatePhoneNumber('1234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate usernames', () => {
      expect(validateUsername('validuser')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('user_name')).toBe(true);
      expect(validateUsername('user-name')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('us')).toBe(false); // too short
      expect(validateUsername('user@name')).toBe(false); // contains special chars
      expect(validateUsername('user name')).toBe(false); // contains space
    });
  });

  describe('rateLimitCheck', () => {
    it('should allow requests within limit', () => {
      const key = 'test-key';
      expect(rateLimitCheck(key, 5, 60000)).toBe(true);
      expect(rateLimitCheck(key, 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-key-2';
      // Make 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        rateLimitCheck(key, 5, 60000);
      }
      expect(rateLimitCheck(key, 5, 60000)).toBe(false);
    });
  });

  describe('validateInputLength', () => {
    it('should validate input length within range', () => {
      expect(validateInputLength('test', 1, 10)).toBe(true);
      expect(validateInputLength('hello world', 5, 15)).toBe(true);
    });

    it('should reject input outside range', () => {
      expect(validateInputLength('test', 5, 10)).toBe(false);
      expect(validateInputLength('hello world', 1, 5)).toBe(false);
      expect(validateInputLength('', 1, 10)).toBe(false);
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove dangerous HTML tags', () => {
      const dangerousHTML = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHTML(dangerousHTML);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should allow safe HTML tags', () => {
      const safeHTML = '<p>Paragraph</p><strong>bold</strong><em>italic</em>';
      const sanitized = sanitizeHTML(safeHTML);
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
      expect(sanitized).toContain('<em>');
    });
  });

  describe('validateURL', () => {
    it('should validate secure URLs', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('https://subdomain.example.com/path')).toBe(true);
      expect(validateURL('http://localhost:3000')).toBe(true);
    });

    it('should reject insecure or invalid URLs', () => {
      expect(validateURL('http://example.com')).toBe(false); // not https
      expect(validateURL('javascript:alert("xss")')).toBe(false);
      expect(validateURL('invalid-url')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });

  describe('generateSecureRandomString', () => {
    it('should generate random strings', () => {
      const str1 = generateSecureRandomString(32);
      const str2 = generateSecureRandomString(32);
      
      expect(str1).toBeDefined();
      expect(str2).toBeDefined();
      expect(str1.length).toBe(32);
      expect(str2.length).toBe(32);
      expect(str1).not.toBe(str2); // Should be different
    });
  });

  describe('Password Hashing', () => {
    const password = 'test-password-123';

    it('should hash and verify passwords', async () => {
      const hashed = await hashPassword(password);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);

      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject wrong passwords', async () => {
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword('wrong-password', hashed);
      expect(isValid).toBe(false);
    });
  });
});