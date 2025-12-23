'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { hasFeature, getUpgradeSuggestions, type SubscriptionFeature } from '@/lib/subscription';
import { Lock, Crown, Star, Zap, ArrowUpRight } from 'lucide-react';

interface FeatureGateProps {
  feature: SubscriptionFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  upgradeMessage?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true,
  upgradeMessage
}) => {
  const { user, isPremium, isElite } = useAuth();

  if (!user) return null;

  const userTier = user.subscription.tier as any;
  const hasAccess = hasFeature(userTier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const upgradeSuggestion = getUpgradeSuggestions(userTier);

  return (
    <Card className="border-neutral-700 bg-charcoal-800/50">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-neutral-400" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
            <p className="text-neutral-400 text-sm">
              {upgradeMessage || `Upgrade to access this ${feature.replace('_', ' ')} feature`}
            </p>
          </div>

          {upgradeSuggestion && (
            <div className="bg-gradient-to-r from-champagne-500/10 to-champagne-600/10 rounded-lg p-4 border border-champagne-500/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                {upgradeSuggestion.tier === 'premium' && <Star className="w-5 h-5 text-champagne-500" />}
                {upgradeSuggestion.tier === 'elite' && <Crown className="w-5 h-5 text-yellow-500" />}
                {upgradeSuggestion.tier === 'vip' && <Zap className="w-5 h-5 text-purple-500" />}
                <span className="font-semibold text-white">Upgrade to {upgradeSuggestion.name}</span>
              </div>

              <p className="text-2xl font-bold text-champagne-500 mb-2">
                ${upgradeSuggestion.price}
                <span className="text-sm font-normal text-neutral-400">/month</span>
              </p>

              <p className="text-sm text-neutral-400 mb-4">
                Unlock {upgradeSuggestion.newFeatures.length} premium features
              </p>

              <Button
                asChild
                className="w-full bg-champagne-500 hover:bg-champagne-600 text-charcoal-900"
              >
                <a href="/subscription" className="flex items-center gap-2">
                  Upgrade Now
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              Current: {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for checking feature access
export const useFeatureAccess = (feature: SubscriptionFeature) => {
  const { user } = useAuth();

  if (!user) return false;

  const userTier = user.subscription.tier as any;
  return hasFeature(userTier, feature);
};

// Component for conditional rendering based on subscription
export const SubscriptionRequired: React.FC<{
  tier: 'premium' | 'elite' | 'vip';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ tier, children, fallback }) => {
  const { user } = useAuth();

  if (!user) return fallback || null;

  const userTier = user.subscription.tier;
  const hasRequiredTier =
    (tier === 'premium' && (userTier === 'premium' || userTier === 'elite' || userTier === 'vip')) ||
    (tier === 'elite' && (userTier === 'elite' || userTier === 'vip')) ||
    (tier === 'vip' && userTier === 'vip');

  return hasRequiredTier ? <>{children}</> : <>{fallback}</>;
};