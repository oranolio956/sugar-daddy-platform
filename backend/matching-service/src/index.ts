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
    service: 'Matching Service',
    status: 'running',
    version: '1.0.0',
    capabilities: [
      'advanced_search',
      'compatibility_matching',
      'ai_recommendations',
      'mutual_matching',
      'location_based_matching'
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

// Advanced search with AI ranking
app.post('/search', async (req, res) => {
  try {
    const {
      userId,
      filters,
      preferences,
      limit = 20,
      offset = 0,
      sortBy = 'compatibility'
    } = req.body;

    // Get user's profile and preferences
    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    const user = userResponse.data;

    // Build search query based on filters
    const searchQuery = buildSearchQuery(filters, user);

    // Execute search (mock implementation - would query database)
    const searchResults = await executeAdvancedSearch(searchQuery, limit, offset);

    // Apply AI ranking and compatibility scoring
    const rankedResults = await rankSearchResults(searchResults, user, sortBy);

    // Apply mutual matching logic
    const mutualMatches = await checkMutualMatches(rankedResults, userId);

    res.json({
      results: rankedResults,
      mutualMatches,
      total: rankedResults.length,
      filters: searchQuery,
      searchId: generateSearchId(),
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Failed to execute search' });
  }
});

// Get matches for user
app.get('/matches/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get user's existing matches
    const matches = await getUserMatches(userId, parseInt(limit), parseInt(offset));

    // Get compatibility scores for each match
    const matchesWithScores = await Promise.all(
      matches.map(async (match) => {
        const compatibility = await calculateCompatibility(userId, match.id);
        return {
          ...match,
          compatibilityScore: compatibility.compatibilityScore,
          matchReasons: compatibility.factors
        };
      })
    );

    res.json({
      matches: matchesWithScores,
      total: matches.length
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Create a match between users
app.post('/matches', async (req, res) => {
  try {
    const { userId, targetUserId, type = 'like' } = req.body;

    // Check if match already exists
    const existingMatch = await checkExistingMatch(userId, targetUserId);

    if (existingMatch) {
      return res.status(409).json({ error: 'Match already exists' });
    }

    // Create match record
    const match = await createMatch(userId, targetUserId, type);

    // Check for mutual match
    const mutualMatch = await checkMutualMatch(userId, targetUserId);

    if (mutualMatch) {
      // Create conversation
      await createConversation(userId, targetUserId);

      // Send match notification
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/match`, {
        userId: targetUserId,
        matchedUserId: userId,
        matchId: match.id
      });
    }

    res.json({
      match,
      isMutual: !!mutualMatch,
      conversationCreated: !!mutualMatch
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Get AI-powered recommendations
app.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, type = 'compatibility' } = req.query;

    // Get AI recommendations from matching engine
    const recommendations = await axios.get(`${process.env.AI_SERVICE_URL}/match-suggestions/${userId}`, {
      params: { limit, type }
    });

    res.json(recommendations.data);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get AI-powered discovery feed
app.get('/discovery/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get user profile and preferences
    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    const user = userResponse.data;

    // Get AI-powered discovery feed
    const discoveryFeed = await getDiscoveryFeed(user, parseInt(limit), parseInt(offset));

    res.json({
      feed: discoveryFeed,
      total: discoveryFeed.length,
      filters: user.preferences,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get discovery feed error:', error);
    res.status(500).json({ error: 'Failed to get discovery feed' });
  }
});

// Get compatibility analysis
app.get('/compatibility/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const compatibility = await calculateCompatibility(userId1, userId2);

    res.json({
      compatibility,
      detailedAnalysis: await getDetailedCompatibilityAnalysis(userId1, userId2),
      suggestions: await getCompatibilitySuggestions(userId1, userId2)
    });
  } catch (error) {
    console.error('Get compatibility analysis error:', error);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

// Get match insights
app.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const insights = await getMatchInsights(userId);

    res.json({
      insights,
      recommendations: insights.recommendations,
      patterns: insights.patterns,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get match insights error:', error);
    res.status(500).json({ error: 'Failed to get match insights' });
  }
});

// Smart search with AI filters
app.post('/search/smart', async (req, res) => {
  try {
    const { userId, query, filters } = req.body;

    // Get user profile
    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    const user = userResponse.data;

    // AI-powered search with smart filtering
    const results = await smartSearch(user, query, filters);

    res.json({
      results,
      searchId: generateSearchId(),
      filtersApplied: results.filtersApplied,
      aiScore: results.aiScore,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({ error: 'Failed to execute smart search' });
  }
});

// Location-based search
app.post('/search/nearby', async (req, res) => {
  try {
    const { userId, latitude, longitude, radiusKm = 50 } = req.body;

    // Calculate bounding box for location search
    const boundingBox = calculateBoundingBox(latitude, longitude, radiusKm);

    // Search users within radius
    const nearbyUsers = await searchNearbyUsers(boundingBox, userId);

    // Calculate distances and sort
    const usersWithDistance = nearbyUsers.map(user => ({
      ...user,
      distance: calculateDistance(latitude, longitude, user.latitude, user.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.json({
      users: usersWithDistance,
      center: { latitude, longitude },
      radius: radiusKm
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({ error: 'Failed to search nearby users' });
  }
});

// Pass on a user (remove from potential matches)
app.post('/pass/:userId/:targetUserId', async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;

    // Record the pass
    await recordPass(userId, targetUserId);

    // Remove from recommendations
    await removeFromRecommendations(userId, targetUserId);

    res.json({ success: true });
  } catch (error) {
    console.error('Pass user error:', error);
    res.status(500).json({ error: 'Failed to pass on user' });
  }
});

// Get user's activity (likes, passes, matches)
app.get('/activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 20, offset = 0 } = req.query;

    const activity = await getUserActivity(userId, type, parseInt(limit), parseInt(offset));

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

// Helper functions

function buildSearchQuery(filters: any, user: any) {
  const query = {
    // Basic filters
    ageRange: filters.ageRange || [18, 99],
    location: filters.location || user.preferences?.location,
    distance: filters.distance || user.preferences?.distance || 50,
    gender: filters.gender || user.preferences?.lookingFor,

    // Advanced filters
    verificationLevel: filters.verificationLevel || 'none',
    subscriptionTier: filters.subscriptionTier || 'any',
    hasPhoto: filters.hasPhoto !== false, // Default true

    // Lifestyle filters
    relationshipType: filters.relationshipType,
    budget: filters.budget,
    education: filters.education,
    occupation: filters.occupation,

    // Physical preferences
    height: filters.height,
    bodyType: filters.bodyType,
    ethnicity: filters.ethnicity,

    // Interests and lifestyle
    interests: filters.interests,
    smoking: filters.smoking,
    drinking: filters.drinking,
    religion: filters.religion,
    politics: filters.politics,

    // Deal breakers (must not match)
    dealBreakers: user.preferences?.dealBreakers || []
  };

  return query;
}

async function executeAdvancedSearch(query: any, limit: number, offset: number) {
  // Mock search implementation - would query database with complex filters
  // In production, this would use Elasticsearch or similar for complex queries

  const mockResults = [
    {
      id: '2',
      name: 'Sarah',
      age: 28,
      location: 'New York, NY',
      distance: 5,
      verificationLevel: 'premium',
      subscriptionTier: 'elite',
      photos: ['photo1.jpg', 'photo2.jpg'],
      bio: 'Successful entrepreneur seeking meaningful connection',
      compatibilityScore: 85,
      lastActive: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Michael',
      age: 35,
      location: 'Los Angeles, CA',
      distance: 12,
      verificationLevel: 'elite',
      subscriptionTier: 'vip',
      photos: ['photo3.jpg'],
      bio: 'Executive looking for sophisticated companion',
      compatibilityScore: 78,
      lastActive: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    }
  ];

  return mockResults.slice(offset, offset + limit);
}

async function rankSearchResults(results: any[], user: any, sortBy: string) {
  // Apply AI ranking based on multiple factors
  return results.map(result => ({
    ...result,
    aiScore: Math.floor(Math.random() * 30) + 70, // Mock AI scoring
    matchReasons: [
      'High personality compatibility',
      'Shared lifestyle preferences',
      'Verified profile'
    ]
  })).sort((a, b) => {
    switch (sortBy) {
      case 'compatibility':
        return b.compatibilityScore - a.compatibilityScore;
      case 'distance':
        return a.distance - b.distance;
      case 'recent':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      default:
        return b.aiScore - a.aiScore;
    }
  });
}

async function checkMutualMatches(results: any[], userId: string) {
  // Check which results have mutual interest
  const mutualMatches = [];

  for (const result of results) {
    const hasMutualInterest = await checkMutualMatch(userId, result.id);
    if (hasMutualInterest) {
      mutualMatches.push(result.id);
    }
  }

  return mutualMatches;
}

async function calculateCompatibility(userId1: string, userId2: string) {
  try {
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/calculate-compatibility`, {
      userId1,
      userId2,
      profile1: {}, // Would fetch actual profiles
      profile2: {}
    });

    return response.data;
  } catch (error) {
    // Fallback compatibility calculation
    return {
      compatibilityScore: Math.floor(Math.random() * 40) + 60,
      factors: [
        { factor: 'personality', score: 75, weight: 40 },
        { factor: 'lifestyle', score: 80, weight: 35 },
        { factor: 'deal_breakers', score: 100, weight: 25 }
      ]
    };
  }
}

// Mock implementations for database operations
async function getUserMatches(userId: string, limit: number, offset: number) {
  // Mock implementation
  return [];
}

async function checkExistingMatch(userId: string, targetUserId: string) {
  return false;
}

async function createMatch(userId: string, targetUserId: string, type: string) {
  return { id: Date.now().toString(), userId, targetUserId, type, createdAt: new Date() };
}

async function checkMutualMatch(userId: string, targetUserId: string) {
  return Math.random() > 0.7; // Mock mutual match check
}

async function createConversation(userId: string, targetUserId: string) {
  // Create conversation in messaging service
  await axios.post(`${process.env.MESSAGING_SERVICE_URL}/conversations`, {
    participants: [userId, targetUserId],
    type: 'match'
  });
}

async function searchNearbyUsers(boundingBox: any, excludeUserId: string) {
  // Mock nearby search
  return [
    {
      id: '4',
      name: 'Emma',
      latitude: 40.7128,
      longitude: -74.0060,
      distance: 2
    }
  ];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateBoundingBox(lat: number, lon: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32; // 1 degree ≈ 111.32 km
  const lonDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta
  };
}

async function recordPass(userId: string, targetUserId: string) {
  // Record pass in database
  console.log(`User ${userId} passed on ${targetUserId}`);
}

async function removeFromRecommendations(userId: string, targetUserId: string) {
  // Remove from recommendation pool
  console.log(`Removed ${targetUserId} from ${userId}'s recommendations`);
}

async function getUserActivity(userId: string, type: any, limit: number, offset: number) {
  // Mock activity data
  return {
    likes: [],
    passes: [],
    matches: [],
    total: 0
  };
}

function generateSearchId() {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// AI-powered discovery feed
async function getDiscoveryFeed(user: any, limit: number, offset: number) {
  // Mock implementation - would use AI algorithms to find best matches
  const baseUsers = [
    {
      id: 'user1',
      name: 'Sarah',
      age: 28,
      location: 'New York, NY',
      distance: 5,
      verificationLevel: 'premium',
      subscriptionTier: 'elite',
      photos: ['photo1.jpg', 'photo2.jpg'],
      bio: 'Successful entrepreneur seeking meaningful connection',
      compatibilityScore: 92,
      aiScore: 88,
      matchReasons: ['Shared interests in travel', 'Similar career goals', 'Complementary personalities'],
      lastActive: new Date().toISOString(),
      isOnline: true
    },
    {
      id: 'user2',
      name: 'Michael',
      age: 35,
      location: 'Los Angeles, CA',
      distance: 12,
      verificationLevel: 'elite',
      subscriptionTier: 'vip',
      photos: ['photo3.jpg'],
      bio: 'Executive looking for sophisticated companion',
      compatibilityScore: 87,
      aiScore: 91,
      matchReasons: ['High compatibility score', 'Similar lifestyle preferences', 'Verified profile'],
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      isOnline: false
    },
    {
      id: 'user3',
      name: 'Emma',
      age: 26,
      location: 'Chicago, IL',
      distance: 8,
      verificationLevel: 'verified',
      subscriptionTier: 'premium',
      photos: ['photo4.jpg', 'photo5.jpg', 'photo6.jpg'],
      bio: 'Creative professional with a passion for art and culture',
      compatibilityScore: 85,
      aiScore: 83,
      matchReasons: ['Shared creative interests', 'Similar values', 'Good communication style'],
      lastActive: new Date(Date.now() - 1800000).toISOString(),
      isOnline: true
    }
  ];

  // Apply AI filtering and ranking
  const rankedUsers = baseUsers.map(user => ({
    ...user,
    discoveryScore: Math.floor(Math.random() * 20) + 80, // AI discovery score
    personalityMatch: Math.floor(Math.random() * 20) + 70,
    lifestyleMatch: Math.floor(Math.random() * 20) + 75,
    interestMatch: Math.floor(Math.random() * 20) + 80
  })).sort((a, b) => b.aiScore - a.aiScore);

  return rankedUsers.slice(offset, offset + limit);
}

// Detailed compatibility analysis
async function getDetailedCompatibilityAnalysis(userId1: string, userId2: string) {
  // Mock detailed analysis
  return {
    personality: {
      score: 85,
      factors: [
        { factor: 'introversion_extroversion', score: 80, description: 'Balanced energy levels' },
        { factor: 'openness', score: 90, description: 'Similar curiosity and creativity' },
        { factor: 'conscientiousness', score: 75, description: 'Complementary work styles' },
        { factor: 'agreeableness', score: 85, description: 'High empathy and cooperation' },
        { factor: 'neuroticism', score: 70, description: 'Similar emotional stability' }
      ]
    },
    lifestyle: {
      score: 78,
      factors: [
        { factor: 'activity_level', score: 85, description: 'Similar energy and interests' },
        { factor: 'social_preferences', score: 70, description: 'Complementary social needs' },
        { factor: 'health_consciousness', score: 80, description: 'Similar health priorities' },
        { factor: 'financial_habits', score: 75, description: 'Compatible financial values' }
      ]
    },
    values: {
      score: 92,
      factors: [
        { factor: 'family_values', score: 95, description: 'Strong alignment on family' },
        { factor: 'career_ambition', score: 85, description: 'Similar professional drive' },
        { factor: 'life_goals', score: 90, description: 'Aligned long-term vision' },
        { factor: 'personal_growth', score: 88, description: 'Shared growth mindset' }
      ]
    },
    communication: {
      score: 83,
      factors: [
        { factor: 'communication_style', score: 80, description: 'Complementary communication' },
        { factor: 'conflict_resolution', score: 85, description: 'Healthy conflict approach' },
        { factor: 'emotional_intelligence', score: 85, description: 'High emotional awareness' }
      ]
    }
  };
}

// Compatibility suggestions
async function getCompatibilitySuggestions(userId1: string, userId2: string) {
  return [
    {
      category: 'conversation_starters',
      suggestions: [
        'Ask about their favorite travel destination and why they love it',
        'Discuss shared interests in [common interest]',
        'Share a funny story about [relevant topic]'
      ]
    },
    {
      category: 'date_ideas',
      suggestions: [
        'Try a cooking class together - great for bonding and learning',
        'Visit a local art gallery or museum',
        'Plan a weekend getaway to a nearby city'
      ]
    },
    {
      category: 'relationship_tips',
      suggestions: [
        'Schedule regular check-ins to discuss feelings and expectations',
        'Find activities that allow both of you to shine',
        'Respect each other\'s need for alone time and social time'
      ]
    }
  ];
}

// Match insights
async function getMatchInsights(userId: string) {
  // Mock insights based on user behavior and preferences
  return {
    recommendations: [
      {
        type: 'profile_optimization',
        title: 'Update Your Profile Photos',
        description: 'Users with 3+ photos get 40% more matches',
        priority: 'high'
      },
      {
        type: 'activity_timing',
        title: 'Best Time to Be Active',
        description: 'Your matches are most active between 7-9 PM on weekdays',
        priority: 'medium'
      },
      {
        type: 'conversation_tips',
        title: 'Improve Response Rate',
        description: 'Personalized messages get 3x more responses than generic ones',
        priority: 'medium'
      }
    ],
    patterns: {
      swipingBehavior: {
        likesPerDay: 15,
        passRate: 65,
        peakActivity: 'Evening'
      },
      messagingBehavior: {
        responseTime: '2 hours',
        messageLength: 'Medium',
        responseRate: 45
      },
      matchPatterns: {
        averageCompatibility: 78,
        mostCommonInterests: ['Travel', 'Food', 'Music'],
        preferredAgeRange: '25-35'
      }
    },
    suggestions: [
      'Try expanding your age range by 5 years in both directions',
      'Add more photos showing your hobbies and interests',
      'Be more specific in your bio about what you\'re looking for'
    ]
  };
}

// Smart search with AI filters
async function smartSearch(user: any, query: string, filters: any) {
  // Mock smart search implementation
  const baseResults = [
    {
      id: 'result1',
      name: 'Sophia',
      age: 30,
      location: 'Miami, FL',
      distance: 3,
      verificationLevel: 'premium',
      subscriptionTier: 'elite',
      photos: ['photo1.jpg'],
      bio: 'Fashion designer with a love for adventure',
      compatibilityScore: 88,
      aiScore: 92,
      matchReasons: ['High AI compatibility', 'Shared creative interests', 'Similar lifestyle'],
      lastActive: new Date().toISOString()
    },
    {
      id: 'result2',
      name: 'David',
      age: 32,
      location: 'Miami, FL',
      distance: 5,
      verificationLevel: 'verified',
      subscriptionTier: 'premium',
      photos: ['photo2.jpg', 'photo3.jpg'],
      bio: 'Tech entrepreneur with a passion for fitness',
      compatibilityScore: 85,
      aiScore: 87,
      matchReasons: ['Strong personality match', 'Complementary interests', 'Verified profile'],
      lastActive: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  // Apply AI filtering based on query and user preferences
  const filteredResults = baseResults.map(result => ({
    ...result,
    smartScore: Math.floor(Math.random() * 15) + 85, // AI smart matching score
    relevanceScore: Math.floor(Math.random() * 10) + 90,
    personalityFit: Math.floor(Math.random() * 20) + 70
  })).sort((a, b) => b.smartScore - a.smartScore);

  return {
    results: filteredResults,
    filtersApplied: {
      query: query || 'All',
      location: filters?.location || 'Current area',
      ageRange: filters?.ageRange || 'Default',
      interests: filters?.interests || 'All'
    },
    aiScore: {
      averageCompatibility: 86,
      confidenceLevel: 'High',
      recommendations: filteredResults.length
    }
  };
}

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Matching Service is running on port ${PORT}`);
});