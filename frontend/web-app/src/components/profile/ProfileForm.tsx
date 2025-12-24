'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProfileBadge } from './ProfileBadge';
import { FeatureGate } from '../subscription/FeatureGate';
import {
  User,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Camera,
  Upload,
  X,
  Save,
  Eye,
  EyeOff,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  bio: string;
  occupation: string;
  company: string;
  education: string;
  netWorth: string;
  monthlyBudget: string;
  interests: string[];
  dealBreakers: string[];
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  preferences: {
    lookingFor: 'sugar_daddy' | 'sugar_baby';
    ageRange: [number, number];
    distance: number;
    budget?: {
      min: number;
      max: number;
    };
  };
  settings: {
    profileVisibility: 'public' | 'private' | 'verified_only';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowMessages: 'everyone' | 'verified' | 'premium' | 'none';
  };
}

const interestOptions = [
  'Travel', 'Fine Dining', 'Luxury Shopping', 'Spa & Wellness', 'Art & Culture',
  'Sports & Fitness', 'Nightlife', 'Beach & Ocean', 'Mountains', 'City Life',
  'Wine & Spirits', 'Cooking', 'Reading', 'Music', 'Theater', 'Fashion',
  'Technology', 'Business', 'Philanthropy', 'Adventure Sports'
];

const dealBreakerOptions = [
  'Smoking', 'Drugs', 'Heavy Drinking', 'No Ambition', 'Poor Hygiene',
  'Bad Manners', 'Dishonesty', 'Controlling Behavior', 'No Goals',
  'Financial Irresponsibility', 'Poor Communication', 'Disrespectful'
];

export const ProfileForm: React.FC = () => {
  const { user, updateUser, isPremium, isElite } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    age: user?.profile.age || 18,
    location: user?.profile.location || '',
    bio: user?.profile.bio || '',
    occupation: user?.profile.portfolio?.occupation || '',
    company: user?.profile.portfolio?.company || '',
    education: user?.profile.portfolio?.education || '',
    netWorth: user?.profile.portfolio?.netWorth || '',
    monthlyBudget: user?.profile.portfolio?.monthlyBudget || '',
    interests: user?.preferences.interests || [],
    dealBreakers: user?.preferences.dealBreakers || [],
    socialLinks: user?.profile.socialLinks || {},
    preferences: user?.preferences || {
      lookingFor: user?.role === 'sugar_daddy' ? 'sugar_baby' : 'sugar_daddy',
      ageRange: [18, 99],
      distance: 50,
    },
    settings: user?.settings || {
      profileVisibility: 'public',
      showOnlineStatus: true,
      showLastSeen: true,
      allowMessages: 'everyone',
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDealBreakerToggle = (dealBreaker: string) => {
    setFormData(prev => ({
      ...prev,
      dealBreakers: prev.dealBreakers.includes(dealBreaker)
        ? prev.dealBreakers.filter(d => d !== dealBreaker)
        : [...prev.dealBreakers, dealBreaker]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (type === 'profile') {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setCoverImage(file);
      setPreviewCover(URL.createObjectURL(file));
    }
  };

  const removeImage = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      setProfileImage(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setCoverImage(null);
      setPreviewCover(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });

      // Add images
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }
      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    const total = 10;

    if (formData.firstName) score++;
    if (formData.lastName) score++;
    if (formData.age) score++;
    if (formData.location) score++;
    if (formData.bio && formData.bio.length > 50) score++;
    if (formData.interests.length > 0) score++;
    if (previewImage || user?.profile.profileImage) score++;
    if (user?.role === 'sugar_daddy' && (formData.occupation || formData.netWorth)) score++;
    if (Object.values(formData.socialLinks).some(link => link)) score++;
    if (formData.preferences.ageRange[1] > formData.preferences.ageRange[0]) score++;

    return Math.round((score / total) * 100);
  };

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6 lg:space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-champagne-500" />
              <CardTitle className="text-lg lg:text-xl">Profile Settings</CardTitle>
            </div>
            <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
              <div className="text-right">
                <div className="text-xs lg:text-sm text-neutral-500">Profile Completeness</div>
                <div className="text-xl lg:text-2xl font-bold text-champagne-500">{calculateCompleteness()}%</div>
              </div>
              <ProfileBadge
                type={user?.subscription.tier === 'elite' ? 'elite' : user?.subscription.tier === 'premium' ? 'premium' : 'verified'}
                size="lg"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        {/* Profile Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Profile Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Profile Picture</Label>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 lg:w-32 h-24 lg:h-32 rounded-full border-4 border-champagne-500/20 overflow-hidden bg-charcoal-800">
                    {previewImage || user?.profile.profileImage ? (
                      <img
                        src={previewImage || user?.profile.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Camera className="w-6 lg:w-8 h-6 lg:h-8" />
                      </div>
                    )}
                  </div>
                  {(previewImage || user?.profile.profileImage) && (
                    <button
                      type="button"
                      onClick={() => removeImage('profile')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors touch-target"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 touch-target"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <p className="text-xs lg:text-sm text-neutral-500 mt-2">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {(isPremium || isElite) && (
              <div>
                <Label className="text-base font-semibold mb-4 block">Cover Image</Label>
                <div className="space-y-4">
                  <div className="relative h-32 lg:h-48 rounded-xl border-2 border-dashed border-champagne-500/20 overflow-hidden bg-charcoal-800/50">
                    {previewCover || user?.profile.coverImage ? (
                      <img
                        src={previewCover || user?.profile.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                        <Camera className="w-10 lg:w-12 h-10 lg:h-12 mb-2" />
                        <p className="text-sm lg:text-base">Upload cover image</p>
                      </div>
                    )}
                    {(previewCover || user?.profile.coverImage) && (
                      <button
                        type="button"
                        onClick={() => removeImage('cover')}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors touch-target"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-2 touch-target"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Cover
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 lg:gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <Label htmlFor="firstName" className="text-sm lg:text-base">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm lg:text-base">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <Label htmlFor="age" className="text-sm lg:text-base">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm lg:text-base">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State/Country"
                    className="pl-10 h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="bio" className="text-sm lg:text-base">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell others about yourself, your interests, and what you're looking for..."
                rows={4}
                maxLength={500}
                className="min-h-[120px] lg:min-h-[140px] text-base lg:text-lg touch-target"
              />
              <p className="text-xs lg:text-sm text-neutral-500 mt-2">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio/Professional Info (Sugar Daddies) */}
        {user?.role === 'sugar_daddy' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 lg:gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <Label htmlFor="occupation" className="text-sm lg:text-base">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="e.g. CEO, Entrepreneur, Investor"
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-sm lg:text-base">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name (optional)"
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <Label htmlFor="education" className="text-sm lg:text-base">Education</Label>
                  <Input
                    id="education"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="e.g. MBA, PhD, Bachelor's"
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
                <div>
                  <Label htmlFor="netWorth" className="text-sm lg:text-base">Net Worth</Label>
                  <Select value={formData.netWorth} onValueChange={(value) => handleInputChange('netWorth', value)}>
                    <SelectTrigger className="h-12 lg:h-14 text-base lg:text-lg touch-target">
                      <SelectValue placeholder="Select net worth range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-100k">Under $100K</SelectItem>
                      <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                      <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                      <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                      <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                      <SelectItem value="over-10m">Over $10M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="monthlyBudget" className="text-sm lg:text-base">Monthly Allowance Budget</Label>
                <Select value={formData.monthlyBudget} onValueChange={(value) => handleInputChange('monthlyBudget', value)}>
                  <SelectTrigger className="h-12 lg:h-14 text-base lg:text-lg touch-target">
                    <SelectValue placeholder="Select monthly budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1k-3k">$1K - $3K</SelectItem>
                    <SelectItem value="3k-5k">$3K - $5K</SelectItem>
                    <SelectItem value="5k-10k">$5K - $10K</SelectItem>
                    <SelectItem value="10k-25k">$10K - $25K</SelectItem>
                    <SelectItem value="25k-50k">$25K - $50K</SelectItem>
                    <SelectItem value="over-50k">Over $50K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div>
                  <Label className="text-sm lg:text-base">Looking For</Label>
                  <Select
                    value={formData.preferences.lookingFor}
                    onValueChange={(value) => handleNestedChange('preferences.lookingFor', value)}
                  >
                    <SelectTrigger className="h-12 lg:h-14 text-base lg:text-lg touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sugar_daddy">Sugar Daddy</SelectItem>
                      <SelectItem value="sugar_baby">Sugar Baby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm lg:text-base">Age Range</Label>
                  <div className="flex gap-2 lg:gap-4">
                    <Input
                      type="number"
                      min="18"
                      max="99"
                      value={formData.preferences.ageRange[0]}
                      onChange={(e) => handleNestedChange('preferences.ageRange', [
                        parseInt(e.target.value),
                        formData.preferences.ageRange[1]
                      ])}
                      placeholder="Min"
                      className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                    />
                    <Input
                      type="number"
                      min="18"
                      max="99"
                      value={formData.preferences.ageRange[1]}
                      onChange={(e) => handleNestedChange('preferences.ageRange', [
                        formData.preferences.ageRange[0],
                        parseInt(e.target.value)
                      ])}
                      placeholder="Max"
                      className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm lg:text-base">Maximum Distance (miles)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.preferences.distance}
                    onChange={(e) => handleNestedChange('preferences.distance', parseInt(e.target.value))}
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <Label className="text-base lg:text-lg font-semibold mb-3 block">Interests</Label>
                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-2 lg:px-4 lg:py-3 rounded-lg border text-sm lg:text-base transition-colors touch-target ${
                        formData.interests.includes(interest)
                          ? 'bg-champagne-500 text-charcoal-900 border-champagne-500'
                          : 'bg-charcoal-800 border-neutral-600 text-neutral-300 hover:border-champagne-500'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deal Breakers */}
              <div>
                <Label className="text-base lg:text-lg font-semibold mb-3 block">Deal Breakers</Label>
                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                  {dealBreakerOptions.map((dealBreaker) => (
                    <button
                      key={dealBreaker}
                      type="button"
                      onClick={() => handleDealBreakerToggle(dealBreaker)}
                      className={`px-3 py-2 lg:px-4 lg:py-3 rounded-lg border text-sm lg:text-base transition-colors touch-target ${
                        formData.dealBreakers.includes(dealBreaker)
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-charcoal-800 border-neutral-600 text-neutral-300 hover:border-red-500'
                      }`}
                    >
                      {dealBreaker}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <FeatureGate
          feature="social_links"
          upgradeMessage="Add your social media profiles to build credibility and trust"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <Globe className="w-5 h-5" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <div>
                  <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm lg:text-base">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.socialLinks.linkedin || ''}
                    onChange={(e) => handleNestedChange('socialLinks.linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="flex items-center gap-2 text-sm lg:text-base">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.socialLinks.instagram || ''}
                    onChange={(e) => handleNestedChange('socialLinks.instagram', e.target.value)}
                    placeholder="@username"
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="flex items-center gap-2 text-sm lg:text-base">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks.twitter || ''}
                    onChange={(e) => handleNestedChange('socialLinks.twitter', e.target.value)}
                    placeholder="@username"
                    className="h-12 lg:h-14 text-base lg:text-lg touch-target"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
              <Eye className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <Label className="text-sm lg:text-base">Profile Visibility</Label>
                  <Select
                    value={formData.settings.profileVisibility}
                    onValueChange={(value) => handleNestedChange('settings.profileVisibility', value)}
                  >
                    <SelectTrigger className="h-12 lg:h-14 text-base lg:text-lg touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="verified_only">Verified Users Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm lg:text-base">Allow Messages From</Label>
                  <Select
                    value={formData.settings.allowMessages}
                    onValueChange={(value) => handleNestedChange('settings.allowMessages', value)}
                  >
                    <SelectTrigger className="h-12 lg:h-14 text-base lg:text-lg touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="verified">Verified Users</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="none">No One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <label className="flex items-center gap-3 cursor-pointer touch-target">
                  <input
                    type="checkbox"
                    checked={formData.settings.showOnlineStatus}
                    onChange={(e) => handleNestedChange('settings.showOnlineStatus', e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-600"
                  />
                  <span className="text-sm lg:text-base">Show online status</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer touch-target">
                  <input
                    type="checkbox"
                    checked={formData.settings.showLastSeen}
                    onChange={(e) => handleNestedChange('settings.showLastSeen', e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-600"
                  />
                  <span className="text-sm lg:text-base">Show last seen</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg touch-target-lg"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};