import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  role: z.enum(['sugar_daddy', 'sugar_baby'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    age: z.number()
      .min(18, 'You must be at least 18 years old')
      .max(100, 'Please enter a valid age'),
    location: z.string().min(1, 'Location is required')
  })
});

// User login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

// Password reset validation
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// Change password validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// Profile update validation
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  age: z.number()
    .min(18, 'You must be at least 18 years old')
    .max(100, 'Please enter a valid age'),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profileImage: z.string().url('Invalid image URL').optional(),
  coverImage: z.string().url('Invalid image URL').optional()
});

// Preferences update validation
export const preferencesUpdateSchema = z.object({
  lookingFor: z.enum(['sugar_daddy', 'sugar_baby']),
  ageRange: z.tuple([z.number().min(18), z.number().max(100)]),
  location: z.string().min(1, 'Location is required'),
  distance: z.number().min(1).max(500),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  interests: z.array(z.string()),
  dealBreakers: z.array(z.string())
});

// Settings update validation
export const settingsUpdateSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  profileVisibility: z.enum(['public', 'private', 'verified_only']),
  showOnlineStatus: z.boolean(),
  showLastSeen: z.boolean(),
  allowMessages: z.enum(['everyone', 'verified', 'premium', 'none']),
  marketingEmails: z.boolean(),
  language: z.string().min(1, 'Language is required'),
  timezone: z.string().min(1, 'Timezone is required')
});

// Message validation
export const messageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
  type: z.enum(['text', 'image', 'video', 'gift', 'location']).default('text')
});

// Match action validation
export const matchActionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  action: z.enum(['like', 'pass', 'block'])
});

// Search filters validation
export const searchFiltersSchema = z.object({
  ageRange: z.tuple([z.number().min(18), z.number().max(100)]).optional(),
  location: z.string().optional(),
  distance: z.number().min(1).max(500).optional(),
  role: z.enum(['sugar_daddy', 'sugar_baby']).optional(),
  verificationLevel: z.enum(['none', 'basic', 'premium', 'elite']).optional(),
  hasPhoto: z.boolean().optional(),
  onlineOnly: z.boolean().optional()
});

// Type exports
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type PreferencesUpdateData = z.infer<typeof preferencesUpdateSchema>;
export type SettingsUpdateData = z.infer<typeof settingsUpdateSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type MatchActionData = z.infer<typeof matchActionSchema>;
export type SearchFiltersData = z.infer<typeof searchFiltersSchema>;