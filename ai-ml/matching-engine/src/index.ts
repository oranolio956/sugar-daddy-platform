import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'AI Matching Engine',
    status: 'running',
    version: '1.0.0',
    capabilities: [
      'personality_analysis',
      'compatibility_scoring',
      'fraud_detection',
      'content_moderation',
      'face_recognition',
      'behavioral_analysis'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Analyze personality from questionnaire responses
app.post('/analyze-personality', async (req, res) => {
  try {
    const { responses, userId } = req.body;

    // Big Five personality traits analysis
    const personalityTraits = analyzeBigFiveTraits(responses);

    // Lifestyle preferences analysis
    const lifestylePreferences = analyzeLifestylePreferences(responses);

    // Deal breakers identification
    const dealBreakers = identifyDealBreakers(responses);

    // Interests extraction
    const interests = extractInterests(responses);

    res.json({
      personalityTraits,
      lifestylePreferences,
      dealBreakers,
      interests,
      confidence: 0.85, // Mock confidence score
      analysisTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Personality analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze personality' });
  }
});

// Calculate compatibility between two users
app.post('/calculate-compatibility', async (req, res) => {
  try {
    const { userId1, userId2, profile1, profile2 } = req.body;

    // Get personality profiles from user service
    const [profile1Data, profile2Data] = await Promise.all([
      axios.get(`${process.env.USER_SERVICE_URL}/users/${userId1}/personality`, {
        headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      }).catch(() => null),
      axios.get(`${process.env.USER_SERVICE_URL}/users/${userId2}/personality`, {
        headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      }).catch(() => null)
    ]);

    let compatibilityScore = 50; // Base score
    const factors = [];

    // Personality compatibility (40% weight)
    if (profile1Data?.data && profile2Data?.data) {
      const personalityScore = calculatePersonalityCompatibility(
        profile1Data.data.personalityTraits,
        profile2Data.data.personalityTraits
      );
      compatibilityScore += personalityScore * 0.4;
      factors.push({
        factor: 'personality',
        score: personalityScore,
        weight: 40,
        description: 'Big Five personality trait alignment'
      });
    }

    // Lifestyle compatibility (30% weight)
    if (profile1Data?.data && profile2Data?.data) {
      const lifestyleScore = calculateLifestyleCompatibility(
        profile1Data.data.lifestylePreferences,
        profile2Data.data.lifestylePreferences
      );
      compatibilityScore += lifestyleScore * 0.3;
      factors.push({
        factor: 'lifestyle',
        score: lifestyleScore,
        weight: 30,
        description: 'Lifestyle and relationship preferences'
      });
    }

    // Deal breakers check (20% weight)
    if (profile1Data?.data && profile2Data?.data) {
      const dealBreakerScore = checkDealBreakers(
        profile1Data.data.dealBreakers,
        profile2Data.data.dealBreakers
      ) ? 100 : 0;
      compatibilityScore += dealBreakerScore * 0.2;
      factors.push({
        factor: 'deal_breakers',
        score: dealBreakerScore,
        weight: 20,
        description: 'Critical compatibility requirements'
      });
    }

    // Age compatibility (5% weight)
    const ageScore = calculateAgeCompatibility(profile1.age, profile2.age);
    compatibilityScore += ageScore * 0.05;
    factors.push({
      factor: 'age',
      score: ageScore,
      weight: 5,
      description: 'Age difference compatibility'
    });

    // Verification bonus (5% weight)
    const verificationScore = (profile1.verified && profile2.verified) ? 100 : 50;
    compatibilityScore += verificationScore * 0.05;
    factors.push({
      factor: 'verification',
      score: verificationScore,
      weight: 5,
      description: 'Profile verification status'
    });

    res.json({
      compatibilityScore: Math.round(Math.max(0, Math.min(100, compatibilityScore))),
      factors,
      recommendation: getCompatibilityRecommendation(compatibilityScore),
      analysisTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compatibility calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

// Analyze face for verification
app.post('/analyze-face', async (req, res) => {
  try {
    const { imageUrl, userId, type } = req.body;

    // Mock facial recognition analysis
    // In production, this would use AWS Rekognition, Google Vision AI, or similar
    const analysis = {
      faceMatchScore: Math.random() * 40 + 60, // 60-100% match score
      livenessScore: Math.random() * 20 + 80, // 80-100% liveness score
      faceDetected: true,
      multipleFaces: false,
      imageQuality: 'good',
      landmarks: {
        eyes: true,
        nose: true,
        mouth: true
      }
    };

    // Additional checks for ID verification
    if (type === 'photo_id') {
      analysis.idMatchScore = Math.random() * 30 + 70;
      analysis.documentType = 'drivers_license';
      analysis.expirationCheck = true;
    }

    res.json({
      ...analysis,
      analysisTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Face analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze face' });
  }
});

// Fraud detection analysis
app.post('/detect-fraud', async (req, res) => {
  try {
    const { userData, activityData, deviceInfo } = req.body;

    const fraudScore = analyzeFraudRisk(userData, activityData, deviceInfo);
    const riskLevel = getRiskLevel(fraudScore);

    res.json({
      fraudScore,
      riskLevel,
      flags: identifyFraudFlags(userData, activityData, deviceInfo),
      recommendations: getFraudRecommendations(riskLevel),
      analysisTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({ error: 'Failed to analyze fraud risk' });
  }
});

// Content moderation
app.post('/moderate-content', async (req, res) => {
  try {
    const { content, contentType, userId } = req.body;

    const moderation = analyzeContent(content, contentType);

    res.json({
      ...moderation,
      analysisTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
});

// Generate smart match suggestions
app.get('/match-suggestions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    // Get user's profile and preferences
    const userProfile = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    // Get potential matches from matching service
    const potentialMatches = await axios.get(`${process.env.MATCHING_SERVICE_URL}/matches/${userId}`, {
      params: { limit: 100 },
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    // Apply AI ranking and filtering
    const suggestions = await rankAndFilterMatches(
      userProfile.data,
      potentialMatches.data.matches,
      parseInt(limit)
    );

    res.json({
      suggestions,
      totalAvailable: potentialMatches.data.total,
      algorithm: 'ai_powered_compatibility',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Match suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Helper functions

function analyzeBigFiveTraits(responses: any) {
  // Mock Big Five analysis based on questionnaire responses
  return {
    openness: Math.floor(Math.random() * 40) + 30, // 30-70
    conscientiousness: Math.floor(Math.random() * 40) + 40, // 40-80
    extraversion: Math.floor(Math.random() * 50) + 25, // 25-75
    agreeableness: Math.floor(Math.random() * 35) + 45, // 45-80
    neuroticism: Math.floor(Math.random() * 30) + 20 // 20-50 (lower is better)
  };
}

function analyzeLifestylePreferences(responses: any) {
  // Mock lifestyle analysis
  const relationshipTypes = ['casual', 'serious', 'marriage', 'friendship'];
  const frequencies = ['daily', 'weekly', 'monthly', 'occasional'];
  const budgets = ['low', 'medium', 'high', 'luxury'];

  return {
    relationshipType: relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)],
    frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
    budget: budgets[Math.floor(Math.random() * budgets.length)],
    travel: 'domestic',
    socialLife: 'balanced',
    workLife: 'balanced'
  };
}

function identifyDealBreakers(responses: any) {
  return {
    smoking: Math.random() > 0.7,
    drinking: Math.random() > 0.8,
    drugs: Math.random() > 0.9,
    religion: 'not_important',
    politics: 'not_important',
    children: 'not_important',
    marriage: 'not_important'
  };
}

function extractInterests(responses: any) {
  const possibleInterests = [
    'travel', 'dining', 'arts', 'sports', 'music', 'technology',
    'fitness', 'cooking', 'reading', 'movies', 'gaming', 'nature'
  ];

  const numInterests = Math.floor(Math.random() * 5) + 3; // 3-8 interests
  const shuffled = possibleInterests.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numInterests);
}

function calculatePersonalityCompatibility(traits1: any, traits2: any) {
  const differences = [
    Math.abs(traits1.openness - traits2.openness),
    Math.abs(traits1.conscientiousness - traits2.conscientiousness),
    Math.abs(traits1.extraversion - traits2.extraversion),
    Math.abs(traits1.agreeableness - traits2.agreeableness),
    Math.abs(traits1.neuroticism - traits2.neuroticism)
  ];

  const averageDifference = differences.reduce((a, b) => a + b) / differences.length;
  return Math.max(0, 100 - averageDifference);
}

function calculateLifestyleCompatibility(prefs1: any, prefs2: any) {
  let score = 100;

  if (prefs1.relationshipType !== prefs2.relationshipType) score -= 40;
  if (prefs1.budget !== prefs2.budget) score -= 20;
  if (prefs1.socialLife !== prefs2.socialLife) score -= 15;

  return Math.max(0, score);
}

function checkDealBreakers(breakers1: any, breakers2: any) {
  // Simplified deal breaker check
  return !(
    (breakers1.smoking && breakers2.smoking) ||
    (breakers1.drugs && breakers2.drugs)
  );
}

function calculateAgeCompatibility(age1: number, age2: number) {
  const difference = Math.abs(age1 - age2);
  if (difference <= 5) return 100;
  if (difference <= 10) return 80;
  if (difference <= 15) return 60;
  return 40;
}

function getCompatibilityRecommendation(score: number) {
  if (score >= 85) return 'excellent_match';
  if (score >= 70) return 'good_match';
  if (score >= 55) return 'fair_match';
  return 'poor_match';
}

function analyzeFraudRisk(userData: any, activityData: any, deviceInfo: any) {
  let riskScore = 0;

  // Check for suspicious patterns
  if (activityData.suspiciousLogins > 0) riskScore += 30;
  if (deviceInfo.isNewDevice) riskScore += 20;
  if (userData.incompleteProfile) riskScore += 15;
  if (activityData.unusualActivity) riskScore += 25;

  return Math.min(100, riskScore);
}

function getRiskLevel(score: number) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function identifyFraudFlags(userData: any, activityData: any, deviceInfo: any) {
  const flags = [];

  if (activityData.suspiciousLogins > 0) flags.push('multiple_failed_logins');
  if (deviceInfo.isNewDevice) flags.push('new_device');
  if (userData.incompleteProfile) flags.push('incomplete_profile');

  return flags;
}

function getFraudRecommendations(riskLevel: string) {
  switch (riskLevel) {
    case 'high':
      return ['require_additional_verification', 'limit_account_access', 'monitor_activity'];
    case 'medium':
      return ['send_security_alert', 'require_email_verification'];
    default:
      return ['monitor_account_activity'];
  }
}

function analyzeContent(content: string, contentType: string) {
  // Mock content analysis
  const hasInappropriateContent = content.toLowerCase().includes('inappropriate');
  const hasSpam = content.length > 1000 && content.split(' ').length < 50;

  return {
    approved: !hasInappropriateContent && !hasSpam,
    flags: hasInappropriateContent ? ['inappropriate_content'] : [],
    spamScore: hasSpam ? 80 : 10,
    contentType,
    moderatedAt: new Date().toISOString()
  };
}

async function rankAndFilterMatches(userProfile: any, potentialMatches: any[], limit: number) {
  // Apply AI ranking based on multiple factors
  const ranked = potentialMatches
    .map(match => ({
      ...match,
      aiScore: Math.floor(Math.random() * 40) + 60 // Mock AI scoring
    }))
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, limit);

  return ranked;
}

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`AI Matching Engine is running on port ${PORT}`);
});