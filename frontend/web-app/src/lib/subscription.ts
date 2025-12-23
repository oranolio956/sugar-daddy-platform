// Subscription tiers and feature definitions
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'forever',
    description: 'Basic access to find connections',
    features: [
      'basic_profile',
      'basic_matching',
      'limited_messages', // 5 messages per day
      'view_profiles',
      'basic_search'
    ],
    limits: {
      messagesPerDay: 5,
      profileViewsPerDay: 10,
      matchesPerMonth: 3
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    description: 'Enhanced features for serious daters',
    features: [
      'basic_profile',
      'basic_matching',
      'unlimited_messages',
      'view_profiles',
      'advanced_search',
      'read_receipts',
      'profile_highlights',
      'priority_matching',
      'cover_photo',
      'social_links',
      'hide_ads'
    ],
    limits: {
      messagesPerDay: -1, // unlimited
      profileViewsPerDay: -1,
      matchesPerMonth: -1
    }
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 59.99,
    currency: 'USD',
    interval: 'month',
    description: 'VIP treatment with concierge service',
    features: [
      'basic_profile',
      'basic_matching',
      'unlimited_messages',
      'view_profiles',
      'advanced_search',
      'read_receipts',
      'profile_highlights',
      'priority_matching',
      'cover_photo',
      'social_links',
      'hide_ads',
      'verified_badge',
      'concierge_matching',
      'exclusive_events',
      'travel_arrangements',
      'personal_stylist',
      'background_check',
      'wealth_verification'
    ],
    limits: {
      messagesPerDay: -1,
      profileViewsPerDay: -1,
      matchesPerMonth: -1
    }
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    price: 149.99,
    currency: 'USD',
    interval: 'month',
    description: 'Ultimate luxury experience',
    features: [
      'basic_profile',
      'basic_matching',
      'unlimited_messages',
      'view_profiles',
      'advanced_search',
      'read_receipts',
      'profile_highlights',
      'priority_matching',
      'cover_photo',
      'social_links',
      'hide_ads',
      'verified_badge',
      'concierge_matching',
      'exclusive_events',
      'travel_arrangements',
      'personal_stylist',
      'background_check',
      'wealth_verification',
      'private_jet',
      'celebrity_matching',
      'black_card',
      'personal_assistant'
    ],
    limits: {
      messagesPerDay: -1,
      profileViewsPerDay: -1,
      matchesPerMonth: -1
    }
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type SubscriptionFeature = string;

// Feature descriptions for UI display
export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  basic_profile: 'Create and customize your profile',
  basic_matching: 'Access to basic matching algorithm',
  limited_messages: 'Limited daily messages',
  unlimited_messages: 'Unlimited messaging',
  view_profiles: 'View other member profiles',
  basic_search: 'Basic search and filtering',
  advanced_search: 'Advanced search with filters',
  read_receipts: 'See when messages are read',
  profile_highlights: 'Featured profile placement',
  priority_matching: 'Priority in matching algorithm',
  cover_photo: 'Cover photo on profile',
  social_links: 'Social media profile links',
  hide_ads: 'Ad-free experience',
  verified_badge: 'Verified member badge',
  concierge_matching: 'Personal matchmaking service',
  exclusive_events: 'Access to exclusive events',
  travel_arrangements: 'Travel planning assistance',
  personal_stylist: 'Personal styling consultation',
  background_check: 'Comprehensive background verification',
  wealth_verification: 'Wealth verification badge',
  private_jet: 'Private jet charter service',
  celebrity_matching: 'Access to celebrity network',
  black_card: 'Black card concierge services',
  personal_assistant: 'Dedicated personal assistant'
};

// Check if user has a specific feature
export const hasFeature = (userTier: SubscriptionTier, feature: SubscriptionFeature): boolean => {
  return SUBSCRIPTION_TIERS[userTier].features.includes(feature);
};

// Check if user can perform an action based on limits
export const checkLimit = (
  userTier: SubscriptionTier,
  action: 'messages' | 'profileViews' | 'matches',
  currentCount: number
): boolean => {
  const limits = SUBSCRIPTION_TIERS[userTier].limits;
  const limitKey = action === 'messages' ? 'messagesPerDay' :
                  action === 'profileViews' ? 'profileViewsPerDay' : 'matchesPerMonth';

  const limit = limits[limitKey as keyof typeof limits];
  return limit === -1 || currentCount < limit;
};

// Get upgrade suggestions based on current tier
export const getUpgradeSuggestions = (currentTier: SubscriptionTier) => {
  const tiers = Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return [];
  }

  const nextTier = tiers[currentIndex + 1];
  const tierInfo = SUBSCRIPTION_TIERS[nextTier];

  // Get features that would be unlocked
  const currentFeatures = SUBSCRIPTION_TIERS[currentTier].features;
  const newFeatures = tierInfo.features.filter(f => !currentFeatures.includes(f));

  return {
    tier: nextTier,
    name: tierInfo.name,
    price: tierInfo.price,
    newFeatures: newFeatures.slice(0, 3), // Show top 3 new features
    savings: currentIndex === 0 ? 'Most Popular' : 'Best Value'
  };
};

// Calculate pricing for different intervals
export const calculatePricing = (tier: SubscriptionTier, interval: 'month' | 'year') => {
  const basePrice = SUBSCRIPTION_TIERS[tier].price;
  const yearlyPrice = basePrice * 12 * 0.8; // 20% discount for yearly

  return {
    monthly: basePrice,
    yearly: yearlyPrice,
    savings: interval === 'year' ? (basePrice * 12 - yearlyPrice) : 0
  };
};