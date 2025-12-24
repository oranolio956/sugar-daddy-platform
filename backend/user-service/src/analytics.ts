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

// User analytics
app.get('/users/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    // Verify user access
    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await getUserAnalytics(userId, period);

    res.json(analytics);
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

// Profile insights
app.get('/users/:userId/insights', async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const insights = await generateProfileInsights(userId);

    res.json(insights);
  } catch (error) {
    console.error('Get profile insights error:', error);
    res.status(500).json({ error: 'Failed to get profile insights' });
  }
});

// Match analytics
app.get('/matches/analytics', async (req, res) => {
  try {
    const { userId, period = '30d' } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await getMatchAnalytics(userId, period);

    res.json(analytics);
  } catch (error) {
    console.error('Get match analytics error:', error);
    res.status(500).json({ error: 'Failed to get match analytics' });
  }
});

// Messaging analytics
app.get('/messages/analytics', async (req, res) => {
  try {
    const { userId, period = '30d' } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await getMessagingAnalytics(userId, period);

    res.json(analytics);
  } catch (error) {
    console.error('Get messaging analytics error:', error);
    res.status(500).json({ error: 'Failed to get messaging analytics' });
  }
});

// Profile performance
app.get('/profiles/:userId/performance', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const performance = await getProfilePerformance(userId, period);

    res.json(performance);
  } catch (error) {
    console.error('Get profile performance error:', error);
    res.status(500).json({ error: 'Failed to get profile performance' });
  }
});

// Compatibility trends
app.get('/compatibility/trends', async (req, res) => {
  try {
    const { userId, period = '30d' } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const trends = await getCompatibilityTrends(userId, period);

    res.json(trends);
  } catch (error) {
    console.error('Get compatibility trends error:', error);
    res.status(500).json({ error: 'Failed to get compatibility trends' });
  }
});

// Activity heatmap
app.get('/activity/heatmap', async (req, res) => {
  try {
    const { userId, year = new Date().getFullYear() } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const heatmap = await generateActivityHeatmap(userId, parseInt(year));

    res.json(heatmap);
  } catch (error) {
    console.error('Get activity heatmap error:', error);
    res.status(500).json({ error: 'Failed to get activity heatmap' });
  }
});

// Success predictions
app.get('/predictions/success', async (req, res) => {
  try {
    const { userId } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const predictions = await generateSuccessPredictions(userId);

    res.json(predictions);
  } catch (error) {
    console.error('Get success predictions error:', error);
    res.status(500).json({ error: 'Failed to get success predictions' });
  }
});

// Behavioral insights
app.get('/behavior/insights', async (req, res) => {
  try {
    const { userId, period = '30d' } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const insights = await analyzeUserBehavior(userId, period);

    res.json(insights);
  } catch (error) {
    console.error('Get behavioral insights error:', error);
    res.status(500).json({ error: 'Failed to get behavioral insights' });
  }
});

// Optimization recommendations
app.get('/recommendations/optimization', async (req, res) => {
  try {
    const { userId } = req.query;

    const currentUser = (req as any).user;
    if (currentUser.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const recommendations = await generateOptimizationRecommendations(userId);

    res.json(recommendations);
  } catch (error) {
    console.error('Get optimization recommendations error:', error);
    res.status(500).json({ error: 'Failed to get optimization recommendations' });
  }
});

// Helper functions

async function getUserAnalytics(userId: string, period: string) {
  // Mock analytics data
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

  return {
    period,
    overview: {
      profileViews: Math.floor(Math.random() * 500) + 100,
      likesReceived: Math.floor(Math.random() * 50) + 10,
      messagesSent: Math.floor(Math.random() * 100) + 20,
      matches: Math.floor(Math.random() * 20) + 5,
      responseRate: Math.floor(Math.random() * 30) + 40
    },
    trends: {
      dailyActivity: Array.from({ length: days }, () => ({
        date: new Date().toISOString().split('T')[0],
        views: Math.floor(Math.random() * 20) + 1,
        likes: Math.floor(Math.random() * 5),
        messages: Math.floor(Math.random() * 10)
      }))
    },
    demographics: {
      ageGroups: { '25-34': 45, '35-44': 30, '45-54': 15, '55+': 10 },
      locations: { 'New York': 25, 'Los Angeles': 20, 'Miami': 15, 'Chicago': 10 },
      subscriptionTiers: { premium: 60, elite: 30, vip: 10 }
    }
  };
}

async function generateProfileInsights(userId: string) {
  return {
    strengths: [
      'High response rate (78%)',
      'Verified profile increases trust',
      'Premium subscription attracts quality matches'
    ],
    improvements: [
      'Add more lifestyle photos',
      'Complete personality questionnaire for better matches',
      'Update bio to be more engaging'
    ],
    opportunities: [
      'Users in your area view profiles 3x more',
      'Elite members respond 40% more frequently',
      'Adding travel mode could increase matches by 25%'
    ],
    risks: [
      'Profile completeness is only 65%',
      'Photo quality could be improved',
      'Limited social verification'
    ]
  };
}

async function getMatchAnalytics(userId: string, period: string) {
  return {
    period,
    metrics: {
      totalMatches: 23,
      successfulMatches: 8,
      matchRate: 34.8,
      averageResponseTime: '4.2 hours',
      compatibilityScore: 76
    },
    quality: {
      verificationRate: 68,
      premiumRate: 42,
      averageAge: 34,
      locationMatch: 85
    },
    trends: {
      dailyMatches: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3)),
      compatibilityTrend: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 70)
    }
  };
}

async function getMessagingAnalytics(userId: string, period: string) {
  return {
    period,
    metrics: {
      messagesSent: 156,
      messagesReceived: 89,
      conversationsStarted: 12,
      averageResponseTime: '2.3 hours',
      conversationLength: '8.5 messages'
    },
    quality: {
      responseRate: 72,
      ghostingRate: 18,
      positiveSentiment: 68,
      negativeSentiment: 12
    },
    patterns: {
      bestTimes: ['evening', 'weekend'],
      responsePatterns: ['quick_replier', 'thoughtful'],
      conversationTopics: ['travel', 'dining', 'lifestyle']
    }
  };
}

async function getProfilePerformance(userId: string, period: string) {
  return {
    period,
    performance: {
      visibilityScore: 82,
      attractivenessScore: 75,
      engagementScore: 68,
      conversionScore: 45
    },
    rankings: {
      localRanking: 234,
      globalRanking: 15432,
      ageGroupRanking: 89,
      subscriptionRanking: 156
    },
    comparisons: {
      vsSimilarProfiles: {
        views: '+15%',
        likes: '+8%',
        matches: '-5%'
      },
      vsPremiumUsers: {
        views: '-25%',
        likes: '-30%',
        matches: '-40%'
      }
    },
    recommendations: [
      'Upgrade to premium for 3x more visibility',
      'Add professional headshot',
      'Complete all profile sections',
      'Use more specific interests'
    ]
  };
}

async function getCompatibilityTrends(userId: string, period: string) {
  return {
    period,
    trends: {
      averageCompatibility: 74,
      compatibilityDistribution: {
        excellent: 15, // 90-100
        good: 35,      // 75-89
        fair: 30,      // 60-74
        poor: 20       // <60
      },
      factorBreakdown: {
        personality: 78,
        lifestyle: 72,
        values: 76,
        interests: 68
      }
    },
    insights: [
      'Your personality matches well with creative types',
      'Lifestyle compatibility strongest with urban professionals',
      'Consider expanding your interest keywords',
      'Age preferences may be limiting your match pool'
    ]
  };
}

async function generateActivityHeatmap(userId: string, year: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    year,
    data: months.map(month => ({
      month,
      days: Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        activity: Math.floor(Math.random() * 5) // 0-4 activity level
      }))
    }))
  };
}

async function generateSuccessPredictions(userId: string) {
  return {
    successProbability: {
      shortTerm: 65, // Next 30 days
      mediumTerm: 78, // Next 3 months
      longTerm: 82   // Next 6 months
    },
    factors: {
      positive: [
        'High profile quality score',
        'Active engagement pattern',
        'Good response rate history'
      ],
      negative: [
        'Limited premium features usage',
        'Small local match pool',
        'Inconsistent activity'
      ]
    },
    recommendations: [
      'Increase activity during peak hours (8-10 PM)',
      'Complete personality questionnaire',
      'Consider premium upgrade for better visibility',
      'Expand location preferences'
    ],
    timeline: {
      '30_days': 'Focus on profile optimization',
      '90_days': 'Build consistent engagement',
      '180_days': 'Leverage premium features for quality matches'
    }
  };
}

async function analyzeUserBehavior(userId: string, period: string) {
  return {
    period,
    behavior: {
      activityPattern: 'evening_active',
      engagementStyle: 'selective_responder',
      matchingStrategy: 'quality_over_quantity',
      communicationStyle: 'thoughtful_conversationalist'
    },
    patterns: {
      loginFrequency: 'daily',
      sessionLength: '45_minutes',
      featureUsage: {
        search: 15,
        messages: 25,
        profile_views: 10,
        matches: 5
      },
      timePreferences: {
        bestDays: ['Friday', 'Saturday'],
        bestHours: ['20:00', '21:00', '22:00']
      }
    },
    insights: [
      'Most active during evenings and weekends',
      'Prefers quality interactions over quantity',
      'Strong preference for verified profiles',
      'Communication style is engaging and responsive'
    ]
  };
}

async function generateOptimizationRecommendations(userId: string) {
  return {
    immediate: [
      {
        action: 'complete_profile',
        priority: 'high',
        impact: '25% more matches',
        effort: 'medium',
        description: 'Add missing profile information and photos'
      },
      {
        action: 'optimize_photos',
        priority: 'high',
        impact: '20% more profile views',
        effort: 'low',
        description: 'Ensure high-quality, diverse photos'
      }
    ],
    shortTerm: [
      {
        action: 'personality_questionnaire',
        priority: 'medium',
        impact: '15% better matches',
        effort: 'high',
        description: 'Complete detailed personality assessment'
      },
      {
        action: 'premium_upgrade',
        priority: 'medium',
        impact: '40% more visibility',
        effort: 'low',
        description: 'Upgrade to premium for advanced features'
      }
    ],
    longTerm: [
      {
        action: 'network_expansion',
        priority: 'low',
        impact: '30% larger match pool',
        effort: 'medium',
        description: 'Expand location and interest preferences'
      },
      {
        action: 'engagement_optimization',
        priority: 'low',
        impact: '50% better response rates',
        effort: 'high',
        description: 'Optimize messaging and engagement patterns'
      }
    ]
  };
}

const PORT = process.env.ANALYTICS_PORT || 3008;
app.listen(PORT, () => {
  console.log(`Analytics Service is running on port ${PORT}`);
});