import React from 'react';
import { Mail, Camera, DollarSign, Phone, UserCheck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VerificationBadgeProps {
  type: 'email' | 'photo' | 'income' | 'phone' | 'social' | 'id';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  type, 
  size = 'md', 
  showLabel = false,
  className 
}) => {
  const badgeConfig = {
    email: { icon: <Mail className="w-3 h-3" />, color: 'success', label: 'Email Verified' },
    photo: { icon: <Camera className="w-3 h-3" />, color: 'primary', label: 'Photo Verified' },
    income: { icon: <DollarSign className="w-3 h-3" />, color: 'gold', label: 'Income Verified' },
    phone: { icon: <Phone className="w-3 h-3" />, color: 'info', label: 'Phone Verified' },
    social: { icon: <UserCheck className="w-3 h-3" />, color: 'secondary', label: 'Social Verified' },
    id: { icon: <CheckCircle className="w-3 h-3" />, color: 'gold', label: 'ID Verified' }
  };
  
  const config = badgeConfig[type];
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const colorClasses = {
    success: "bg-success-100 text-success-700 border border-success-200",
    primary: "bg-primary-100 text-primary-700 border border-primary-200",
    gold: "bg-gradient-gold text-luxury-black border border-gold-300",
    info: "bg-blue-100 text-blue-700 border border-blue-200",
    secondary: "bg-secondary-100 text-secondary-700 border border-secondary-200"
  };
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium shadow-sm",
      sizeClasses[size],
      colorClasses[config.color as keyof typeof colorClasses],
      className
    )} title={config.label}>
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};
