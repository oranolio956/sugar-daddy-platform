'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  SUBSCRIPTION_TIERS,
  FEATURE_DESCRIPTIONS,
  getUpgradeSuggestions,
  calculatePricing,
  type SubscriptionTier
} from '@/lib/subscription';
import {
  Crown,
  Star,
  Zap,
  Check,
  X,
  CreditCard,
  Calendar,
  ArrowUpRight,
  Shield,
  Heart,
  Users,
  MessageCircle,
  Eye,
  Search,
  Camera,
  Link as LinkIcon,
  Ban,
  Headphones,
  Plane,
  Scissors,
  FileCheck,
  DollarSign,
  Gem,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const tierIcons = {
  free: Shield,
  premium: Star,
  elite: Crown,
  vip: Zap
};

const tierColors = {
  free: 'text-gray-500',
  premium: 'text-champagne-500',
  elite: 'text-yellow-500',
  vip: 'text-purple-500'
};

export const SubscriptionManager: React.FC = () => {
  const { user, updateSubscription, isPremium, isElite } = useAuth();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const currentTier = user.subscription.tier as SubscriptionTier;
  const upgradeSuggestion = getUpgradeSuggestions(currentTier);

  const handleSubscriptionChange = async (newTier: SubscriptionTier) => {
    if (newTier === currentTier) return;

    setLoading(true);
    try {
      await updateSubscription(newTier);
      toast.success(`Successfully upgraded to ${SUBSCRIPTION_TIERS[newTier].name}!`);
    } catch (error) {
      toast.error('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    const Icon = tierIcons[tier];
    return <Icon className={`w-6 h-6 ${tierColors[tier]}`} />;
  };

  const getFeatureIcon = (feature: string) => {
    const iconMap: Record<string, any> = {
      basic_profile: Users,
      basic_matching: Heart,
      unlimited_messages: MessageCircle,
      view_profiles: Eye,
      advanced_search: Search,
      cover_photo: Camera,
      social_links: LinkIcon,
      verified_badge: Check,
      concierge_matching: Headphones,
      travel_arrangements: Plane,
      personal_stylist: Scissors,
      background_check: FileCheck,
      wealth_verification: DollarSign,
      private_jet: Plane,
      celebrity_matching: Sparkles,
      black_card: Gem,
      personal_assistant: Headphones
    };

    const Icon = iconMap[feature] || Check;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {getTierIcon(currentTier)}
              Current Subscription
            </CardTitle>
            <Badge className={`${tierColors[currentTier]} border-current`}>
              {SUBSCRIPTION_TIERS[currentTier].name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Status</p>
              <p className="font-semibold capitalize">{user.subscription.status}</p>
            </div>
            {user.subscription.expiresAt && (
              <div>
                <p className="text-sm text-neutral-500 mb-1">Renews</p>
                <p className="font-semibold">
                  {new Date(user.subscription.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-neutral-500 mb-1">Price</p>
              <p className="font-semibold">
                {currentTier === 'free' ? 'Free' : formatPrice(SUBSCRIPTION_TIERS[currentTier].price)}
                {currentTier !== 'free' && <span className="text-sm text-neutral-500">/month</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Suggestion */}
      {upgradeSuggestion && (
        <Card className="border-champagne-500/20 bg-gradient-to-r from-champagne-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-champagne-500 mb-2">
                  Upgrade to {upgradeSuggestion.name}
                </h3>
                <p className="text-neutral-600 mb-3">
                  Unlock {upgradeSuggestion.newFeatures.length} new premium features
                </p>
                <div className="flex flex-wrap gap-2">
                  {upgradeSuggestion.newFeatures.map(feature => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {FEATURE_DESCRIPTIONS[feature]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-champagne-500 mb-2">
                  {formatPrice(upgradeSuggestion.price)}
                  <span className="text-sm font-normal">/month</span>
                </p>
                <Button
                  onClick={() => handleSubscriptionChange(upgradeSuggestion.tier as SubscriptionTier)}
                  disabled={loading}
                  className="bg-champagne-500 hover:bg-champagne-600 text-charcoal-900"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Tiers Comparison */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => {
          const tierInfo = SUBSCRIPTION_TIERS[tier];
          const isCurrentTier = tier === currentTier;
          const pricing = calculatePricing(tier, billingInterval);

          return (
            <Card
              key={tier}
              className={`relative ${isCurrentTier ? 'ring-2 ring-champagne-500' : ''} ${
                tier === 'elite' ? 'border-yellow-500/20' :
                tier === 'vip' ? 'border-purple-500/20' :
                tier === 'premium' ? 'border-champagne-500/20' : ''
              }`}
            >
              {isCurrentTier && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-champagne-500 text-charcoal-900">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {getTierIcon(tier)}
                </div>
                <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {tier === 'free' ? 'Free' : (
                    <>
                      {formatPrice(billingInterval === 'year' ? pricing.yearly / 12 : pricing.monthly)}
                      <span className="text-sm font-normal text-neutral-500">
                        /{billingInterval === 'year' ? 'mo' : 'month'}
                      </span>
                    </>
                  )}
                </div>
                {billingInterval === 'year' && tier !== 'free' && (
                  <p className="text-sm text-green-600">
                    Save {formatPrice(pricing.savings)} yearly
                  </p>
                )}
                <p className="text-sm text-neutral-600 mt-2">{tierInfo.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {tierInfo.features.slice(0, 5).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{FEATURE_DESCRIPTIONS[feature]}</span>
                    </div>
                  ))}
                  {tierInfo.features.length > 5 && (
                    <p className="text-xs text-neutral-500">
                      +{tierInfo.features.length - 5} more features
                    </p>
                  )}
                </div>

                <Button
                  className={`w-full ${
                    isCurrentTier
                      ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                      : tier === 'free'
                      ? 'bg-neutral-600 hover:bg-neutral-700'
                      : 'bg-gradient-gold text-charcoal-900 hover:shadow-lg'
                  }`}
                  disabled={isCurrentTier || loading}
                  onClick={() => handleSubscriptionChange(tier)}
                >
                  {isCurrentTier ? 'Current Plan' : `Choose ${tierInfo.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="bg-charcoal-800 p-1 rounded-lg flex">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'month'
                ? 'bg-champagne-500 text-charcoal-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === 'year'
                ? 'bg-champagne-500 text-charcoal-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Yearly
            <Badge className="ml-2 bg-green-600 text-white text-xs">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => (
                    <th key={tier} className="text-center py-3 px-4 font-semibold">
                      {SUBSCRIPTION_TIERS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(FEATURE_DESCRIPTIONS).map(([feature, description]) => (
                  <tr key={feature} className="border-b border-neutral-800">
                    <td className="py-3 px-4 flex items-center gap-2">
                      {getFeatureIcon(feature)}
                      <span className="text-sm">{description}</span>
                    </td>
                    {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tier) => (
                      <td key={tier} className="text-center py-3 px-4">
                        {SUBSCRIPTION_TIERS[tier].features.includes(feature) ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};