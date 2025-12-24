import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  profileUpdateSchema
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        role: 'sugar_baby' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 25,
          location: 'New York, NY'
        }
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
        username: 'testuser',
        role: 'sugar_baby' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 25,
          location: 'New York, NY'
        }
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('email');
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        username: 'testuser',
        role: 'sugar_baby' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 25,
          location: 'New York, NY'
        }
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('password');
    });

    it('should reject age under 18', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        role: 'sugar_baby' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          age: 17,
          location: 'New York, NY'
        }
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('profile.age');
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!'
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const invalidData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak'
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('profileUpdateSchema', () => {
    it('should validate valid profile update data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        location: 'Los Angeles, CA',
        bio: 'Hello, I am a test user.',
        profileImage: 'https://example.com/image.jpg'
      };

      const result = profileUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject bio that is too long', () => {
      const longBio = 'a'.repeat(501);
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        location: 'Los Angeles, CA',
        bio: longBio
      };

      const result = profileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URL', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
        location: 'Los Angeles, CA',
        profileImage: 'not-a-url'
      };

      const result = profileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});