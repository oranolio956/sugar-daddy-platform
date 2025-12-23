import React from 'react';
import { Shield, CheckCircle, Star, Crown, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileBadgeProps {
  type: 'verified' | 'premium' | 'elite' | 'vip' | 'identity' | 'wealth' | 'background';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const badgeConfig = {
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  premium: {
    icon: Star,
    label: 'Premium',
    color: 'text-champagne-500',
    bgColor: 'bg-champagne-500/10',
    borderColor: 'border-champagne-500/20',
  },
  elite: {
    icon: Crown,
    label: 'Elite',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  vip: {
    icon: Zap,
    label: 'VIP',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  identity: {
    icon: Shield,
    label: 'ID Verified',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  wealth: {
    icon: Award,
    label: 'Wealth Verified',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  background: {
    icon: CheckCircle,
    label: 'Background Check',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  type,
  size = 'md',
  className,
  showLabel = true,
}) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm',
        config.bgColor,
        config.borderColor,
        sizeConfig[size],
        className
      )}
    >
      <Icon className={cn('flex-shrink-0', config.color, size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />
      {showLabel && (
        <span className={cn('font-medium', config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
};

interface VerificationBadgesProps {
  verificationLevel: 'none' | 'basic' | 'premium' | 'elite';
  isPremium: boolean;
  isElite: boolean;
  className?: string;
}

export const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  verificationLevel,
  isPremium,
  isElite,
  className,
}) => {
  const badges = [];

  // Verification level badges
  if (verificationLevel === 'basic') {
    badges.push(<ProfileBadge key="identity" type="identity" size="sm" />);
  } else if (verificationLevel === 'premium') {
    badges.push(
      <ProfileBadge key="identity" type="identity" size="sm" />,
      <ProfileBadge key="wealth" type="wealth" size="sm" />
    );
  } else if (verificationLevel === 'elite') {
    badges.push(
      <ProfileBadge key="identity" type="identity" size="sm" />,
      <ProfileBadge key="wealth" type="wealth" size="sm" />,
      <ProfileBadge key="background" type="background" size="sm" />
    );
  }

  // Subscription badges
  if (isElite) {
    badges.push(<ProfileBadge key="vip" type="vip" size="sm" />);
  } else if (isPremium) {
    badges.push(<ProfileBadge key="premium" type="premium" size="sm" />);
  }

  if (badges.length === 0) {
    return (
      <ProfileBadge
        type="verified"
        size="sm"
        className={className}
      />
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges}
    </div>
  );
};