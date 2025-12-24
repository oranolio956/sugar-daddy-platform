import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GDPR Compliance Endpoints

// Data Subject Access Request (DSAR) - Right to Access
app.post('/gdpr/access-request', async (req, res) => {
  try {
    const { email, requestId } = req.body;

    // Verify user identity (in production, use stronger verification)
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Collect all user data
    const userData = await collectUserData(user.id);

    // Create audit log
    await logGDPRRequest(user.id, 'access_request', requestId);

    // Send data export via email (in production)
    await sendDataExportEmail(user.email, userData, requestId);

    res.json({
      success: true,
      message: 'Data export request submitted. You will receive an email with your data within 30 days.',
      requestId,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('GDPR access request error:', error);
    res.status(500).json({ error: 'Failed to process access request' });
  }
});

// Right to Rectification
app.put('/gdpr/rectify/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { corrections } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Apply corrections
    await applyDataCorrections(userId, corrections);

    // Log the rectification
    await logGDPRRequest(userId, 'rectification', null, corrections);

    res.json({
      success: true,
      message: 'Data corrections applied successfully'
    });
  } catch (error) {
    console.error('GDPR rectification error:', error);
    res.status(500).json({ error: 'Failed to apply corrections' });
  }
});

// Right to Erasure (Right to be Forgotten)
app.delete('/gdpr/erasure/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, consent } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if erasure is legally required or user consented
    if (!consent && currentUser.role !== 'admin') {
      return res.status(400).json({ error: 'Explicit consent required for data erasure' });
    }

    // Check for legal holds or ongoing disputes
    const hasLegalHold = await checkLegalHold(userId);
    if (hasLegalHold) {
      return res.status(409).json({
        error: 'Data erasure cannot be completed due to legal obligations',
        contactSupport: true
      });
    }

    // Anonymize user data instead of complete deletion (GDPR compliance)
    await anonymizeUserData(userId, reason);

    // Log the erasure
    await logGDPRRequest(userId, 'erasure', null, { reason, anonymized: true });

    res.json({
      success: true,
      message: 'Your data has been anonymized as per GDPR requirements'
    });
  } catch (error) {
    console.error('GDPR erasure error:', error);
    res.status(500).json({ error: 'Failed to process erasure request' });
  }
});

// Right to Data Portability
app.post('/gdpr/portability/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json' } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Collect user data in portable format
    const portableData = await collectPortableData(userId, format);

    // Log the portability request
    await logGDPRRequest(userId, 'portability', null, { format });

    res.json({
      success: true,
      data: portableData,
      format,
      exportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('GDPR portability error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Right to Restriction of Processing
app.put('/gdpr/restrict/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { restrict, reason } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Apply processing restrictions
    await setProcessingRestrictions(userId, restrict, reason);

    // Log the restriction
    await logGDPRRequest(userId, 'restriction', null, { restrict, reason });

    res.json({
      success: true,
      restricted: restrict,
      message: restrict
        ? 'Data processing has been restricted'
        : 'Data processing restrictions have been lifted'
    });
  } catch (error) {
    console.error('GDPR restriction error:', error);
    res.status(500).json({ error: 'Failed to update processing restrictions' });
  }
});

// Cookie Consent Management
app.post('/gdpr/cookies/consent', async (req, res) => {
  try {
    const { userId, consent, preferences } = req.body;

    // Store cookie consent
    await storeCookieConsent(userId, consent, preferences);

    res.json({
      success: true,
      consent: {
        necessary: true, // Always required
        analytics: consent.analytics || false,
        marketing: consent.marketing || false,
        preferences: consent.preferences || false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cookie consent error:', error);
    res.status(500).json({ error: 'Failed to store cookie consent' });
  }
});

// Privacy Settings
app.get('/gdpr/privacy-settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const settings = await getPrivacySettings(userId);

    res.json(settings);
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ error: 'Failed to get privacy settings' });
  }
});

// Update Privacy Settings
app.put('/gdpr/privacy-settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { settings } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await updatePrivacySettings(userId, settings);

    res.json({
      success: true,
      settings,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Data Processing Records (for transparency)
app.get('/gdpr/processing-record/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const record = await getDataProcessingRecord(userId);

    res.json(record);
  } catch (error) {
    console.error('Get processing record error:', error);
    res.status(500).json({ error: 'Failed to get processing record' });
  }
});

// Consent Withdrawal
app.post('/gdpr/consent/withdraw', async (req, res) => {
  try {
    const { userId, consentType, reason } = req.body;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await withdrawConsent(userId, consentType, reason);

    // Log consent withdrawal
    await logGDPRRequest(userId, 'consent_withdrawal', null, { consentType, reason });

    res.json({
      success: true,
      message: `${consentType} consent has been withdrawn`,
      effectiveDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Consent withdrawal error:', error);
    res.status(500).json({ error: 'Failed to withdraw consent' });
  }
});

// Automated Decision Making Explanation
app.get('/gdpr/automated-decisions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const decisions = await getAutomatedDecisions(userId);

    res.json({
      decisions,
      explanation: {
        logic: 'Our matching algorithm uses personality traits, lifestyle preferences, and behavioral data to suggest compatible partners',
        factors: [
          'Big Five personality traits compatibility',
          'Lifestyle and relationship goals alignment',
          'Geographic proximity',
          'Verification status',
          'Activity patterns'
        ],
        rightToObject: 'You can object to automated decision making by contacting support'
      }
    });
  } catch (error) {
    console.error('Get automated decisions error:', error);
    res.status(500).json({ error: 'Failed to get automated decisions' });
  }
});

// Data Breach Notification (Admin Only)
app.post('/gdpr/breach-notification', async (req, res) => {
  try {
    const currentUser = (req as any).user;

    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { affectedUsers, breachDetails, riskLevel } = req.body;

    // Notify affected users
    await notifyDataBreach(affectedUsers, breachDetails);

    // Report to supervisory authority (mock)
    await reportToAuthority(breachDetails);

    // Log the breach
    await logDataBreach(affectedUsers.length, breachDetails, riskLevel);

    res.json({
      success: true,
      notifiedUsers: affectedUsers.length,
      notificationSent: new Date().toISOString()
    });
  } catch (error) {
    console.error('Breach notification error:', error);
    res.status(500).json({ error: 'Failed to send breach notifications' });
  }
});

// Helper functions

async function findUserByEmail(email: string) {
  // Mock user lookup
  return { id: 'user_1', email };
}

async function collectUserData(userId: string) {
  return {
    personal: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    profile: {
      bio: 'Sample bio',
      interests: ['travel', 'dining'],
      photos: ['photo1.jpg']
    },
    activity: {
      matches: 15,
      messages: 234,
      lastLogin: new Date().toISOString()
    },
    subscriptions: {
      tier: 'premium',
      status: 'active'
    }
  };
}

async function sendDataExportEmail(email: string, data: any, requestId: string) {
  // Mock email sending
  console.log(`Sending data export to ${email} for request ${requestId}`);
}

async function applyDataCorrections(userId: string, corrections: any) {
  // Mock data corrections
  console.log(`Applying corrections for user ${userId}:`, corrections);
}

async function checkLegalHold(userId: string) {
  // Mock legal hold check
  return false;
}

async function anonymizeUserData(userId: string, reason: string) {
  // Mock data anonymization
  console.log(`Anonymizing data for user ${userId}, reason: ${reason}`);
}

async function collectPortableData(userId: string, format: string) {
  const data = await collectUserData(userId);
  return format === 'json' ? data : JSON.stringify(data, null, 2);
}

async function setProcessingRestrictions(userId: string, restrict: boolean, reason: string) {
  // Mock processing restrictions
  console.log(`Setting processing restrictions for ${userId}: ${restrict}, reason: ${reason}`);
}

async function storeCookieConsent(userId: string, consent: any, preferences: any) {
  // Mock cookie consent storage
  console.log(`Storing cookie consent for ${userId}:`, consent);
}

async function getPrivacySettings(userId: string) {
  return {
    dataSharing: false,
    analytics: true,
    marketing: false,
    thirdParty: false,
    locationTracking: true,
    lastUpdated: new Date().toISOString()
  };
}

async function updatePrivacySettings(userId: string, settings: any) {
  // Mock privacy settings update
  console.log(`Updating privacy settings for ${userId}:`, settings);
}

async function getDataProcessingRecord(userId: string) {
  return {
    purposes: [
      {
        purpose: 'Account Management',
        legalBasis: 'Contract',
        dataCategories: ['Personal', 'Contact'],
        retention: 'Account active + 3 years'
      },
      {
        purpose: 'Matching',
        legalBasis: 'Consent',
        dataCategories: ['Profile', 'Preferences'],
        retention: 'Account active'
      }
    ],
    recipients: ['Payment processors', 'Email service providers'],
    transfers: ['EU countries only']
  };
}

async function withdrawConsent(userId: string, consentType: string, reason: string) {
  // Mock consent withdrawal
  console.log(`Withdrawing ${consentType} consent for ${userId}, reason: ${reason}`);
}

async function getAutomatedDecisions(userId: string) {
  return [
    {
      type: 'matching',
      decision: 'Profile shown to 15 users',
      date: new Date().toISOString(),
      factors: ['High compatibility score', 'Geographic proximity']
    }
  ];
}

async function notifyDataBreach(affectedUsers: string[], breachDetails: any) {
  // Mock breach notification
  console.log(`Notifying ${affectedUsers.length} users about data breach`);
}

async function reportToAuthority(breachDetails: any) {
  // Mock authority reporting
  console.log('Reporting breach to supervisory authority');
}

async function logDataBreach(affectedUsers: number, details: any, riskLevel: string) {
  // Mock breach logging
  console.log(`Logged data breach affecting ${affectedUsers} users, risk level: ${riskLevel}`);
}

async function logGDPRRequest(userId: string, type: string, requestId?: string, details?: any) {
  // Mock GDPR logging
  console.log(`Logged GDPR ${type} for user ${userId}:`, { requestId, details });
}

const PORT = process.env.GDPR_PORT || 3009;
app.listen(PORT, () => {
  console.log(`GDPR Compliance Service is running on port ${PORT}`);
});