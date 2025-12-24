import Joi from 'joi';

// Common validation patterns
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const PHONE_PATTERN = /^\+?[\d\s\-\(\)]{10,}$/;

// User registration validation
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(EMAIL_PATTERN)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .pattern(PASSWORD_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 12 characters long and contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
  
  username: Joi.string()
    .pattern(USERNAME_PATTERN)
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.pattern.base': 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 20 characters',
      'any.required': 'Username is required'
    }),
  
  role: Joi.string()
    .valid('sugar_daddy', 'sugar_baby')
    .required()
    .messages({
      'any.only': 'Role must be either sugar_daddy or sugar_baby',
      'any.required': 'Role is required'
    }),
  
  profile: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters and spaces',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'any.required': 'Last name is required'
      }),
    
    age: Joi.number()
      .integer()
      .min(18)
      .max(100)
      .required()
      .messages({
        'number.min': 'You must be at least 18 years old',
        'number.max': 'Age cannot exceed 100',
        'number.integer': 'Age must be a whole number',
        'any.required': 'Age is required'
      }),
    
    location: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Location must be at least 2 characters long',
        'string.max': 'Location cannot exceed 100 characters',
        'any.required': 'Location is required'
      }),
    
    bio: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    
    phone: Joi.string()
      .pattern(PHONE_PATTERN)
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }).required()
});

// User login validation
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(EMAIL_PATTERN)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Profile update validation
export const profileUpdateSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters and spaces'
      }),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters and spaces'
      }),
    
    age: Joi.number()
      .integer()
      .min(18)
      .max(100)
      .messages({
        'number.min': 'You must be at least 18 years old',
        'number.max': 'Age cannot exceed 100',
        'number.integer': 'Age must be a whole number'
      }),
    
    location: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Location must be at least 2 characters long',
        'string.max': 'Location cannot exceed 100 characters'
      }),
    
    bio: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    
    phone: Joi.string()
      .pattern(PHONE_PATTERN)
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      })
  }),
  
  preferences: Joi.object({
    lookingFor: Joi.string()
      .valid('sugar_daddy', 'sugar_baby')
      .messages({
        'any.only': 'Looking for must be either sugar_daddy or sugar_baby'
      }),
    
    ageRange: Joi.array()
      .items(Joi.number().integer().min(18).max(100))
      .length(2)
      .messages({
        'array.length': 'Age range must contain exactly 2 numbers',
        'array.includes': 'Age range values must be between 18 and 100'
      }),
    
    location: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Location must be at least 2 characters long',
        'string.max': 'Location cannot exceed 100 characters'
      }),
    
    distance: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .messages({
        'number.min': 'Distance must be at least 1 mile',
        'number.max': 'Distance cannot exceed 1000 miles',
        'number.integer': 'Distance must be a whole number'
      }),
    
    budget: Joi.object({
      min: Joi.number().min(0).max(100000),
      max: Joi.number().min(0).max(100000).greater(Joi.ref('min'))
    }).optional(),
    
    interests: Joi.array().items(Joi.string().max(50)).max(10),
    dealBreakers: Joi.array().items(Joi.string().max(100)).max(5)
  }),
  
  settings: Joi.object({
    emailNotifications: Joi.boolean(),
    pushNotifications: Joi.boolean(),
    profileVisibility: Joi.string().valid('public', 'private', 'verified_only'),
    showOnlineStatus: Joi.boolean(),
    showLastSeen: Joi.boolean(),
    allowMessages: Joi.string().valid('everyone', 'verified', 'premium', 'none'),
    marketingEmails: Joi.boolean(),
    language: Joi.string().pattern(/^[a-z]{2}$/),
    timezone: Joi.string().max(50)
  })
});

// Password change validation
export const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  
  newPassword: Joi.string()
    .pattern(PASSWORD_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'New password must be at least 12 characters long and contain uppercase, lowercase, number, and special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Email verification validation
export const emailVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(EMAIL_PATTERN)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Password reset validation
export const passwordResetSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(EMAIL_PATTERN)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Password reset confirmation validation
export const passwordResetConfirmSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  
  newPassword: Joi.string()
    .pattern(PASSWORD_PATTERN)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 12 characters long and contain uppercase, lowercase, number, and special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// 2FA setup validation
export const twoFactorSetupSchema = Joi.object({
  token: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'TOTP token must be exactly 6 digits',
    'string.pattern.base': 'TOTP token must contain only digits',
    'any.required': 'TOTP token is required'
  })
});

// 2FA verification validation
export const twoFactorVerifySchema = Joi.object({
  token: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'TOTP token must be exactly 6 digits',
    'string.pattern.base': 'TOTP token must contain only digits',
    'any.required': 'TOTP token is required'
  }),
  
  rememberDevice: Joi.boolean().default(false)
});

// Device session validation
export const deviceSessionSchema = Joi.object({
  deviceInfo: Joi.object({
    userAgent: Joi.string().max(500).required(),
    ipAddress: Joi.string().ip().required(),
    deviceType: Joi.string().valid('desktop', 'mobile', 'tablet').required(),
    browser: Joi.string().max(100),
    os: Joi.string().max(100)
  }).required(),
  
  location: Joi.object({
    country: Joi.string().max(100),
    city: Joi.string().max(100),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }).optional()
});

// Verification document validation
export const verificationDocumentSchema = Joi.object({
  type: Joi.string()
    .valid('photo_selfie', 'photo_id', 'income_paystub', 'income_tax', 'background_check')
    .required()
    .messages({
      'any.only': 'Invalid document type',
      'any.required': 'Document type is required'
    }),
  
  notes: Joi.string().max(500).allow('')
});

// Super like validation
export const superLikeSchema = Joi.object({
  targetUserId: Joi.string().uuid().required().messages({
    'string.uuid': 'Target user ID must be a valid UUID',
    'any.required': 'Target user ID is required'
  })
});

// Profile boost validation
export const profileBoostSchema = Joi.object({
  duration: Joi.number().valid(30, 60, 120).default(30).messages({
    'any.only': 'Boost duration must be 30, 60, or 120 minutes'
  })
});

// Travel mode validation
export const travelModeSchema = Joi.object({
  enabled: Joi.boolean().required().messages({
    'any.required': 'Travel mode enabled status is required'
  }),
  
  location: Joi.when('enabled', {
    is: true,
    then: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 100 characters',
      'any.required': 'Location is required when travel mode is enabled'
    }),
    otherwise: Joi.string().allow('')
  })
});

// Incognito mode validation
export const incognitoModeSchema = Joi.object({
  enabled: Joi.boolean().required().messages({
    'any.required': 'Incognito mode enabled status is required'
  })
});

// Personality profile validation
export const personalityProfileSchema = Joi.object({
  responses: Joi.object().required().messages({
    'any.required': 'Personality responses are required'
  })
});

// Input sanitization function
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};