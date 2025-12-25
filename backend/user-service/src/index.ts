import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Op } from 'sequelize';
import { initDatabase, sequelize, User, Profile, VerificationDocument, PersonalityProfile, SuperLike, Match } from './models';
import {
  ApplicationError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  createNotFoundError,
  createUnauthorizedError,
  createValidationError,
  createServiceUnavailableError
} from './utils/errorHandler';
import {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  validate,
  validateSecurityHeaders,
  validateCSRF,
  preventSQLInjection,
  preventXSS
} from './validation';
import { hashPassword, verifyPassword } from './utils/encryption';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
// Validate JWT secret is properly configured
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/verification');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Initialize database
initDatabase().catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Validate encryption configuration
import { validateEncryptionKey } from './utils/encryption';

if (!validateEncryptionKey()) {
  console.error('CRITICAL: Encryption configuration is invalid');
  process.exit(1);
}

console.log('Security configuration validated successfully');

// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Sugar Daddy User Service',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Database migration health check
app.get('/health/migrations', async (req, res) => {
  try {
    // Check if database is synchronized
    await sequelize.sync({ alter: false });
    res.json({
      status: 'healthy',
      migrations: 'up_to_date',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Migration health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      migrations: 'pending_or_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// User registration
app.post('/users/register',
  validateSecurityHeaders,
  preventSQLInjection,
  preventXSS,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, username, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      throw createConflictError('User already exists');
    }

    // Hash password with enhanced security
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      username,
      passwordHash: hashedPassword,
      role,
      emailVerified: false,
      twoFactorEnabled: false,
      subscription: {
        tier: 'free',
        status: 'active',
        features: ['basic_profile', 'basic_matching', 'limited_messages']
      },
      preferences: {
        lookingFor: role === 'sugar_daddy' ? 'sugar_baby' : 'sugar_daddy',
        ageRange: [18, 50],
        location: profile?.location || '',
        distance: 50
      },
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        profileVisibility: 'public',
        showOnlineStatus: true,
        showLastSeen: true,
        allowMessages: 'everyone',
        marketingEmails: false,
        language: 'en',
        timezone: 'UTC'
      },
      stats: {
        profileViews: 0,
        likesReceived: 0,
        messagesSent: 0,
        matchesCount: 0,
        responseRate: 0
      },
      security: {
        lastPasswordChange: new Date().toISOString(),
        loginAttempts: 0,
        trustedDevices: []
      }
    });

    // Create profile
    if (profile) {
      await Profile.create({
        userId: user.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        location: profile.location,
        bio: profile.bio,
        verified: false,
        verificationLevel: 'none'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: profile
      },
      token
    });
  })
);

// User login
app.post('/users/login',
  validateSecurityHeaders,
  preventSQLInjection,
  preventXSS,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email: email },
      include: [Profile]
    });

    if (!user) {
      throw createUnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw createUnauthorizedError('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        subscription: user.subscription,
        profile: user.profiles?.[0] || null
      },
      token
    });
  })
);

// Get user profile
app.get('/users/:id', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const currentUser = (req as any).user;

    // Users can only view their own profile or profiles they're matched with
    if (currentUser.id !== userId) {
      // Check if they're matched using ORM relationships
      const match = await Match.findOne({
        where: {
          [Op.or]: [
            { userId: currentUser.id, matchedUserId: userId },
            { userId: userId, matchedUserId: currentUser.id }
          ],
          status: 'accepted'
        }
      });

      if (!match) {
        throw createForbiddenError('Access denied');
      }
    }

    const user = await User.findByPk(userId, {
      include: [Profile]
    });

    if (!user) {
      throw createNotFoundError('User', userId);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        emailVerified: user.emailVerified,
        subscription: user.subscription,
        profile: user.profiles?.[0] || null,
        stats: user.stats,
        lastLoginAt: user.lastLoginAt
      }
    });
  })
);

// Update user profile
app.put('/users/:id',
  authenticateToken,
  validateSecurityHeaders,
  preventSQLInjection,
  preventXSS,
  validate(profileUpdateSchema),
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      throw createForbiddenError('Access denied');
    }

    const { profile, preferences, settings } = req.body;

    const user = await User.findByPk(userId, {
      include: [Profile]
    });

    if (!user) {
      throw createNotFoundError('User', userId);
    }

    // Update user preferences and settings
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    if (settings) {
      user.settings = { ...user.settings, ...settings };
    }
    await user.save();

    // Update profile
    if (profile) {
      let userProfile = user.profiles?.[0];
      if (userProfile) {
        await userProfile.update(profile);
      } else {
        userProfile = await Profile.create({
          userId: user.id,
          ...profile
        });
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profiles?.[0] || null,
        preferences: user.preferences,
        settings: user.settings
      }
    });
  })
);

// Get user matches
app.get('/users/:id/matches', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get matches using ORM relationships
    const userMatches = await Match.findAll({
      where: {
        [Op.or]: [
          { userId: userId },
          { matchedUserId: userId }
        ],
        status: 'accepted'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role'],
          include: [
            {
              model: Profile,
              as: 'profiles',
              attributes: ['firstName', 'lastName', 'age', 'location', 'profileImage']
            }
          ]
        },
        {
          model: User,
          as: 'matchedUser',
          attributes: ['id', 'username', 'role'],
          include: [
            {
              model: Profile,
              as: 'profiles',
              attributes: ['firstName', 'lastName', 'age', 'location', 'profileImage']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the response to match the expected structure
    const matches = userMatches.map(match => {
      const otherUser = match.userId === userId ? match.matchedUser : match.user;
      const otherProfile = otherUser.profiles?.[0];
      
      return {
        id: otherUser.id,
        username: otherUser.username,
        role: otherUser.role,
        first_name: otherProfile?.firstName,
        last_name: otherProfile?.lastName,
        age: otherProfile?.age,
        location: otherProfile?.location,
        profile_image: otherProfile?.profileImage,
        status: match.status,
        matched_at: match.createdAt
      };
    });

    res.json(matches?.[0] || []);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verification endpoints

// Submit verification document
app.post('/users/:userId/verification', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    const documentUrl = `/uploads/verification/${req.file.filename}`;

    const verificationDoc = await VerificationDocument.create({
      userId,
      type,
      documentUrl,
      status: 'pending',
      submittedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
    });

    // Trigger AI analysis for photo verification
    if (type === 'photo_selfie' || type === 'photo_id') {
      // Call AI service for facial recognition/analysis
      try {
        const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-face`, {
          imageUrl: documentUrl,
          userId,
          type
        });

        await verificationDoc.update({
          status: 'under_review',
          metadata: {
            ...verificationDoc.metadata,
            faceMatchScore: aiResponse.data.faceMatchScore,
            livenessScore: aiResponse.data.livenessScore
          }
        });
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
      }
    }

    res.status(201).json({
      id: verificationDoc.id,
      type: verificationDoc.type,
      status: verificationDoc.status,
      submittedAt: verificationDoc.submittedAt
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Get user's verification documents
app.get('/users/:userId/verification', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const documents = await VerificationDocument.findAll({
      where: { userId },
      order: [['submittedAt', 'DESC']]
    });

    res.json(documents.map(doc => ({
      id: doc.id,
      type: doc.type,
      status: doc.status,
      submittedAt: doc.submittedAt,
      reviewedAt: doc.reviewedAt,
      notes: doc.notes
    })));
  } catch (error) {
    console.error('Get verification documents error:', error);
    res.status(500).json({ error: 'Failed to get verification documents' });
  }
});

// Admin: Review verification document
app.put('/admin/verification/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, notes } = req.body;
    const currentUser = (req as any).user;

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const document = await VerificationDocument.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Verification document not found' });
    }

    await document.update({
      status,
      notes,
      reviewedAt: new Date(),
      reviewedBy: currentUser.id
    });

    // Update user's verification level if approved
    if (status === 'approved') {
      const user = await User.findByPk(document.userId, { include: [Profile] });
      if (user && user.profiles?.[0]) {
        let newLevel: 'none' | 'basic' | 'premium' | 'elite' = 'none';

        if (document.type === 'photo_selfie') newLevel = 'basic';
        else if (document.type.startsWith('income_')) newLevel = 'premium';
        else if (document.type === 'background_check') newLevel = 'elite';

        if (newLevel !== 'none') {
          await user.profiles[0].update({ verificationLevel: newLevel });
        }
      }
    }

    res.json({ success: true, status, reviewedAt: document.reviewedAt });
  } catch (error) {
    console.error('Review verification error:', error);
    res.status(500).json({ error: 'Failed to review verification' });
  }
});

// Get verification requirements for user
app.get('/verification/requirements/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId, { include: [Profile] });
    if (!user || !user.profiles?.[0]) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = user.profiles[0];
    const requirements = [];

    // Basic photo verification
    if (!profile.verified || profile.verificationLevel === 'none') {
      requirements.push({
        type: 'photo_selfie',
        name: 'Photo Verification',
        description: 'Upload a selfie to verify your identity',
        required: true,
        completed: false
      });
    }

    // Income verification for sugar daddies
    if (user.role === 'sugar_daddy' && profile.verificationLevel !== 'premium' && profile.verificationLevel !== 'elite') {
      requirements.push({
        type: 'income_paystub',
        name: 'Income Verification',
        description: 'Upload recent pay stub or tax document',
        required: true,
        completed: false
      });
    }

    // Background check for elite verification
    if (profile.verificationLevel !== 'elite') {
      requirements.push({
        type: 'background_check',
        name: 'Background Check',
        description: 'Complete comprehensive background verification',
        required: false,
        completed: false
      });
    }

    res.json({ requirements });
  } catch (error) {
    console.error('Get verification requirements error:', error);
    res.status(500).json({ error: 'Failed to get verification requirements' });
  }
});

// Premium Features Endpoints

// Super Like a user
app.post('/users/:userId/super-like/:targetUserId', authenticateToken, async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user has super likes available
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check subscription tier for super likes
    const hasSuperLikes = ['premium', 'elite', 'vip'].includes(user.subscription?.tier || 'free');
    if (!hasSuperLikes) {
      return res.status(403).json({ error: 'Super likes require premium subscription' });
    }

    // Check if already super liked
    const existingSuperLike = await SuperLike.findOne({
      where: { senderId: userId, receiverId: targetUserId, isActive: true }
    });

    if (existingSuperLike) {
      return res.status(409).json({ error: 'Already super liked this user' });
    }

    // Create super like
    const superLike = await SuperLike.create({
      senderId: userId,
      receiverId: targetUserId,
      usedAt: new Date()
    });

    // Check if mutual super like
    const mutualSuperLike = await SuperLike.findOne({
      where: { senderId: targetUserId, receiverId: userId, isActive: true }
    });

    if (mutualSuperLike) {
      superLike.isMutual = true;
      mutualSuperLike.isMutual = true;
      await superLike.save();
      await mutualSuperLike.save();

      // Create instant match
      await axios.post(`${process.env.USER_SERVICE_URL}/matches`, {
        userId,
        targetUserId,
        type: 'super_like_mutual'
      });
    }

    // Notify receiver
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
      userId: targetUserId,
      type: 'super_like',
      title: 'Super Like!',
      body: 'Someone super liked you!',
      data: { senderId: userId, isMutual: superLike.isMutual }
    });

    res.json({
      success: true,
      superLike: {
        id: superLike.id,
        isMutual: superLike.isMutual
      }
    });
  } catch (error) {
    console.error('Super like error:', error);
    res.status(500).json({ error: 'Failed to super like user' });
  }
});

// Toggle incognito mode
app.put('/users/:userId/incognito', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { enabled } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has incognito feature
    const hasIncognito = ['elite', 'vip'].includes(user.subscription?.tier || 'free');
    if (!hasIncognito) {
      return res.status(403).json({ error: 'Incognito mode requires elite subscription' });
    }

    // Update user settings
    user.settings = {
      ...user.settings,
      incognitoMode: enabled
    };
    await user.save();

    res.json({
      success: true,
      incognitoMode: enabled
    });
  } catch (error) {
    console.error('Incognito mode error:', error);
    res.status(500).json({ error: 'Failed to update incognito mode' });
  }
});

// Boost profile
app.post('/users/:userId/boost', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has boost credits
    const hasBoost = ['premium', 'elite', 'vip'].includes(user.subscription?.tier || 'free');
    if (!hasBoost) {
      return res.status(403).json({ error: 'Profile boost requires premium subscription' });
    }

    // Boost expires in 30 minutes
    const boostExpiry = new Date(Date.now() + 30 * 60 * 1000);

    // Update user with boost
    user.settings = {
      ...user.settings,
      profileBoosted: true,
      boostExpiry
    };
    await user.save();

    // Notify matching service to prioritize this user
    await axios.post(`${process.env.MATCHING_SERVICE_URL}/boost`, {
      userId,
      boostExpiry
    });

    res.json({
      success: true,
      boostExpiry,
      message: 'Profile boosted for 30 minutes'
    });
  } catch (error) {
    console.error('Profile boost error:', error);
    res.status(500).json({ error: 'Failed to boost profile' });
  }
});

// Get user's credits/balance
app.get('/users/:userId/credits', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mock credits based on subscription
    const credits = {
      free: { messaging: 5, superLikes: 0, boosts: 0 },
      premium: { messaging: 50, superLikes: 5, boosts: 2 },
      elite: { messaging: 200, superLikes: 20, boosts: 10 },
      vip: { messaging: -1, superLikes: -1, boosts: -1 } // unlimited
    };

    const userCredits = credits[user.subscription?.tier as keyof typeof credits] || credits.free;

    res.json({
      credits: userCredits,
      subscription: user.subscription?.tier || 'free'
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
});

// Travel mode - update location preferences
app.put('/users/:userId/travel-mode', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { location, enabled } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has travel mode
    const hasTravelMode = ['elite', 'vip'].includes(user.subscription?.tier || 'free');
    if (!hasTravelMode) {
      return res.status(403).json({ error: 'Travel mode requires elite subscription' });
    }

    // Update preferences
    user.preferences = {
      ...user.preferences,
      travelMode: enabled,
      travelLocation: enabled ? location : null
    };
    await user.save();

    res.json({
      success: true,
      travelMode: enabled,
      location: enabled ? location : null
    });
  } catch (error) {
    console.error('Travel mode error:', error);
    res.status(500).json({ error: 'Failed to update travel mode' });
  }
});

// Personality questionnaire submission
app.post('/users/:userId/personality', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { responses } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Analyze personality with AI service
    const aiAnalysis = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-personality`, {
      responses,
      userId
    });

    const personalityData = aiAnalysis.data;

    // Save or update personality profile
    let personalityProfile = await PersonalityProfile.findOne({
      where: { userId }
    });

    if (personalityProfile) {
      await personalityProfile.update({
        personalityTraits: personalityData.personalityTraits,
        lifestylePreferences: personalityData.lifestylePreferences,
        dealBreakers: personalityData.dealBreakers,
        interests: personalityData.interests,
        completedAt: new Date()
      });
    } else {
      personalityProfile = await PersonalityProfile.create({
        userId,
        personalityTraits: personalityData.personalityTraits,
        lifestylePreferences: personalityData.lifestylePreferences,
        dealBreakers: personalityData.dealBreakers,
        interests: personalityData.interests,
        completedAt: new Date()
      });
    }

    // Calculate completeness
    const completeness = personalityProfile.calculateProfileCompleteness();
    await personalityProfile.update({ profileCompleteness: completeness });

    res.json({
      success: true,
      personalityProfile: {
        id: personalityProfile.id,
        traits: personalityProfile.personalityTraits,
        preferences: personalityProfile.lifestylePreferences,
        completeness,
        completedAt: personalityProfile.completedAt
      }
    });
  } catch (error) {
    console.error('Personality submission error:', error);
    res.status(500).json({ error: 'Failed to save personality profile' });
  }
});

// Get personality profile
app.get('/users/:userId/personality', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const personalityProfile = await PersonalityProfile.findOne({
      where: { userId }
    });

    if (!personalityProfile) {
      return res.json({ completed: false });
    }

    res.json({
      completed: true,
      traits: personalityProfile.personalityTraits,
      preferences: personalityProfile.lifestylePreferences,
      dealBreakers: personalityProfile.dealBreakers,
      interests: personalityProfile.interests,
      completeness: personalityProfile.profileCompleteness,
      completedAt: personalityProfile.completedAt
    });
  } catch (error) {
    console.error('Get personality error:', error);
    res.status(500).json({ error: 'Failed to get personality profile' });
  }
});

// Global error handler
app.use(globalErrorHandler);

// 404 handler
app.use(notFoundHandler);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User Service is running on port ${PORT}`);
});