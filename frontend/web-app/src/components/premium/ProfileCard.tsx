import React, { useState } from 'react';
import { Heart, MessageCircle, MapPin, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from './VerificationBadge';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: number;
  bio: string;
  profilePhoto: string;
  isVerified: boolean;
  isPremium: boolean;
  isOnline: boolean;
  tags: string[];
  hasLiked: boolean;
}

interface ProfileCardProps {
  user: UserProfile;
  variant?: 'standard' | 'premium' | 'featured';
  showActions?: boolean;
  onLike?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

const LikeButton = ({ isActive, onClick }: { isActive?: boolean; onClick?: () => void }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    onClick?.();
  };
  
  return (
    <button 
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-all duration-300 hover:bg-pink-50",
        isActive ? "text-primary-500" : "text-neutral-400 hover:text-primary-500"
      )}
      aria-label="Like profile"
    >
      <Heart 
        className={cn(
          "w-6 h-6",
          isActive && "fill-current",
          isAnimating && "animate-bounce"
        )}
      />
    </button>
  );
};

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  variant = 'standard', 
  showActions = true,
  onLike,
  onMessage,
  onViewProfile,
  className
}) => {
  return (
    <div 
      className={cn(
        "group bg-white dark:bg-luxury-slate rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300",
        variant === 'premium' && "border-2 border-gold-200 dark:border-gold-800",
        variant === 'featured' && "relative bg-gradient-champagne",
        className
      )}
      onClick={onViewProfile}
    >
      {/* Profile Image */}
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        <img 
          src={user.profilePhoto} 
          alt={user.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* Verification Badge */}
        {user.isVerified && (
          <div className="absolute top-3 left-3">
            <VerificationBadge type="photo" size="sm" />
          </div>
        )}
        
        {/* Premium Badge */}
        {user.isPremium && (
          <div className="absolute top-3 right-3 bg-gradient-gold p-1.5 rounded-full shadow-lg">
            <Crown className="w-4 h-4 text-luxury-black" />
          </div>
        )}

        {/* Online Status */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className={cn(
            "w-2 h-2 rounded-full",
            user.isOnline ? "bg-success-500" : "bg-gray-400"
          )} />
          <span className="text-xs text-white font-medium">
            {user.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-xl font-bold text-luxury-charcoal dark:text-ivory-pearl">
            {user.name}, {user.age}
          </h3>
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">
              {user.distance} mi
            </span>
          </div>
        </div>
        
        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4 line-clamp-2">
          {user.bio}
        </p>
        
        {/* Lifestyle Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {user.tags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className="px-2 py-1 bg-ivory-linen dark:bg-luxury-graphite text-luxury-charcoal dark:text-ivory-pearl text-xs rounded-md border border-gold-100 dark:border-luxury-graphite"
            >
              {tag}
            </span>
          ))}
          {user.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-neutral-400">
              +{user.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-luxury-graphite">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-gold-200 hover:bg-gold-50 hover:text-gold-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.();
                }}
              >
                View Profile
              </Button>
              <Button 
                size="sm" 
                className="text-xs bg-gradient-gold text-luxury-black hover:shadow-md border-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Message
              </Button>
            </div>
            <LikeButton isActive={user.hasLiked} onClick={onLike} />
          </div>
        )}
      </div>
    </div>
  );
};
