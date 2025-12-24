import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment
const getEncryptionKey = (): Buffer => {
  const key = process.env.FIELD_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('FIELD_ENCRYPTION_KEY environment variable is required');
  }

  // Ensure the key is the correct length
  const hash = crypto.createHash('sha256').update(key).digest();
  return hash.slice(0, KEY_LENGTH);
};

// Encrypt data
export const encrypt = (text: string): string => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV, tag, and encrypted data
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
export const decrypt = (encryptedText: string): string => {
  try {
    const key = getEncryptionKey();
    const [ivHex, tagHex, encryptedData] = encryptedText.split(':');
    
    if (!ivHex || !tagHex || !encryptedData) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Encrypt sensitive user fields
export const encryptUserFields = (userData: any): any => {
  const sensitiveFields = ['passwordHash', 'phone', 'email'];
  const encryptedData = { ...userData };

  for (const field of sensitiveFields) {
    if (userData[field] && typeof userData[field] === 'string') {
      try {
        encryptedData[field] = encrypt(userData[field]);
      } catch (error) {
        console.error(`Failed to encrypt field ${field}:`, error);
        // Continue with original value if encryption fails
      }
    }
  }

  return encryptedData;
};

// Decrypt sensitive user fields
export const decryptUserFields = (userData: any): any => {
  const sensitiveFields = ['passwordHash', 'phone', 'email'];
  const decryptedData = { ...userData };

  for (const field of sensitiveFields) {
    if (userData[field] && typeof userData[field] === 'string') {
      try {
        decryptedData[field] = decrypt(userData[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Continue with encrypted value if decryption fails
      }
    }
  }

  return decryptedData;
};

// Generate secure random string for tokens
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash sensitive data that doesn't need to be decrypted
export const hashSensitiveData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Validate encryption key strength
export const validateEncryptionKey = (): boolean => {
  const key = process.env.FIELD_ENCRYPTION_KEY;
  
  if (!key) {
    console.error('CRITICAL: FIELD_ENCRYPTION_KEY environment variable is not set');
    return false;
  }

  if (key.length < 32) {
    console.error('CRITICAL: FIELD_ENCRYPTION_KEY must be at least 32 characters long');
    return false;
  }

  // Check for common weak keys
  const weakKeys = [
    'your-secret-key',
    'password123',
    '12345678901234567890123456789012',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  ];

  if (weakKeys.includes(key.toLowerCase())) {
    console.error('CRITICAL: FIELD_ENCRYPTION_KEY is too weak. Use a strong, unique key.');
    return false;
  }

  return true;
};

// Field-level encryption middleware for database operations
export const encryptSensitiveFields = (model: any, options: any) => {
  const sensitiveFields = ['passwordHash', 'phone', 'email'];
  
  if (options.fields) {
    options.fields = options.fields.filter((field: string) => !sensitiveFields.includes(field));
  }
  
  return model;
};

// Database field encryption plugin for Sequelize
export const createEncryptionPlugin = () => {
  return {
    beforeCreate: (instance: any, options: any) => {
      const sensitiveFields = ['passwordHash', 'phone', 'email'];
      
      for (const field of sensitiveFields) {
        if (instance[field]) {
          try {
            instance[field] = encrypt(instance[field]);
          } catch (error) {
            console.error(`Failed to encrypt field ${field}:`, error);
            throw new Error(`Failed to encrypt sensitive field: ${field}`);
          }
        }
      }
    },
    
    beforeUpdate: (instance: any, options: any) => {
      const sensitiveFields = ['passwordHash', 'phone', 'email'];
      
      for (const field of sensitiveFields) {
        if (instance.changed(field) && instance[field]) {
          try {
            instance[field] = encrypt(instance[field]);
          } catch (error) {
            console.error(`Failed to encrypt field ${field}:`, error);
            throw new Error(`Failed to encrypt sensitive field: ${field}`);
          }
        }
      }
    },
    
    afterFind: (instances: any, options: any) => {
      if (!Array.isArray(instances)) {
        instances = [instances];
      }
      
      const sensitiveFields = ['passwordHash', 'phone', 'email'];
      
      for (const instance of instances) {
        if (instance) {
          for (const field of sensitiveFields) {
            if (instance[field]) {
              try {
                instance[field] = decrypt(instance[field]);
              } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
                // Continue with encrypted value
              }
            }
          }
        }
      }
    }
  };
};

// Password hashing with additional security
export const hashPassword = async (password: string): Promise<string> => {
  // Validate password strength before hashing
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  
  if (!passwordRegex.test(password)) {
    throw new Error('Password does not meet security requirements');
  }

  // Add pepper (application-wide secret)
  const pepper = process.env.PASSWORD_PEPPER;
  if (!pepper) {
    throw new Error('PASSWORD_PEPPER environment variable is required');
  }

  // Hash with pepper
  const pepperedPassword = password + pepper;
  
  // Use bcrypt with high salt rounds
  const saltRounds = 14; // Increased from 12 for better security
  return await bcrypt.hash(pepperedPassword, saltRounds);
};

// Password verification with timing attack protection
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const pepper = process.env.PASSWORD_PEPPER;
  if (!pepper) {
    throw new Error('PASSWORD_PEPPER environment variable is required');
  }

  const pepperedPassword = password + pepper;
  return await bcrypt.compare(pepperedPassword, hash);
};