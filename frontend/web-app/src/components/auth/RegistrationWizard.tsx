'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Camera, DollarSign, MapPin, Calendar,
  Heart, Shield, CheckCircle, ArrowLeft, ArrowRight, Sparkles,
  Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  age: string;
  location: string;
  role: 'sugar_daddy' | 'sugar_baby';
  bio: string;
  interests: string[];
  incomeRange?: string;
  relationshipGoals: string[];
  profilePhoto?: File;
}

const steps = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Contact & Security', icon: Mail },
  { id: 3, title: 'Profile Details', icon: Heart },
  { id: 4, title: 'Lifestyle', icon: Sparkles },
  { id: 5, title: 'Photo Upload', icon: Camera },
  { id: 6, title: 'Verification', icon: Shield }
];

const interestsOptions = [
  'Travel', 'Fine Dining', 'Luxury Shopping', 'Art & Culture', 
  'Fitness & Wellness', 'Nightlife', 'Business', 'Philanthropy',
  'Cars', 'Real Estate', 'Investing', 'Fashion', 'Music', 'Sports'
];

const relationshipGoalsOptions = [
  'Mutual Benefits', 'Long-term Relationship', 'Casual Dating',
  'Friendship', 'Mentorship', 'Networking'
];

const incomeRanges = [
  '$50K - $100K', '$100K - $250K', '$250K - $500K', 
  '$500K - $1M', '$1M+'
];

export default function RegistrationWizard() {
  const router = useRouter();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    age: '',
    location: '',
    role: 'sugar_baby',
    bio: '',
    interests: [],
    relationshipGoals: [],
    incomeRange: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.age) newErrors.age = 'Age is required';
        else if (parseInt(formData.age) < 18) newErrors.age = 'You must be at least 18 years old';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;
        
      case 2:
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.username) newErrors.username = 'Username is required';
        break;
        
      case 3:
        if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
        else if (formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters';
        if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
        if (formData.relationshipGoals.length === 0) newErrors.relationshipGoals = 'Please select at least one relationship goal';
        break;
        
      case 4:
        if (formData.role === 'sugar_daddy' && !formData.incomeRange) {
          newErrors.incomeRange = 'Income range is required for Sugar Daddies';
        }
        break;
        
      case 5:
        if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMultiSelect = (field: 'interests' | 'relationshipGoals', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: 'File size must be less than 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(6)) return;
    
    setIsLoading(true);
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        role: formData.role,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age),
          location: formData.location,
          bio: formData.bio,
          interests: formData.interests,
          relationshipGoals: formData.relationshipGoals,
          incomeRange: formData.incomeRange,
          profilePhoto: formData.profilePhoto
        }
      });
      
      // Show success animation
      setCurrentStep(7); // Success step
      
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => (currentStep / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Your age (18+)"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={errors.age ? 'border-red-500' : ''}
                />
                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="City, State or Country"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'sugar_baby' }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.role === 'sugar_baby' 
                      ? 'border-champagne-500 bg-champagne-500/10' 
                      : 'border-gray-200 hover:border-champagne-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Sugar Baby</div>
                      <div className="text-sm text-gray-600">Looking for support</div>
                    </div>
                    <Heart className="w-5 h-5 text-champagne-500" />
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'sugar_daddy' }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.role === 'sugar_daddy' 
                      ? 'border-champagne-500 bg-champagne-500/10' 
                      : 'border-gray-200 hover:border-champagne-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Sugar Daddy</div>
                      <div className="text-sm text-gray-600">Providing support</div>
                    </div>
                    <DollarSign className="w-5 h-5 text-champagne-500" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password (8+ characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="bio">About Yourself</Label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Share your story... What are you passionate about? What are you seeking in a meaningful connection?"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent resize-none"
              />
              {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
              <p className="text-sm text-gray-500">{formData.bio.length}/500 characters</p>
            </div>
            
            <div className="space-y-4">
              <Label>Interests</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestsOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleMultiSelect('interests', interest)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      formData.interests.includes(interest)
                        ? 'border-champagne-500 bg-champagne-500/10 text-champagne-700'
                        : 'border-gray-200 hover:border-champagne-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {errors.interests && <p className="text-red-500 text-sm">{errors.interests}</p>}
            </div>
            
            <div className="space-y-4">
              <Label>Relationship Goals</Label>
              <div className="grid grid-cols-2 gap-3">
                {relationshipGoalsOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleMultiSelect('relationshipGoals', goal)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      formData.relationshipGoals.includes(goal)
                        ? 'border-champagne-500 bg-champagne-500/10 text-champagne-700'
                        : 'border-gray-200 hover:border-champagne-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              {errors.relationshipGoals && <p className="text-red-500 text-sm">{errors.relationshipGoals}</p>}
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {formData.role === 'sugar_daddy' && (
              <div className="space-y-2">
                <Label htmlFor="incomeRange">Income Range (Required for Sugar Daddies)</Label>
                <select
                  id="incomeRange"
                  name="incomeRange"
                  value={formData.incomeRange || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent ${
                    errors.incomeRange ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select your annual income range</option>
                  {incomeRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                {errors.incomeRange && <p className="text-red-500 text-sm">{errors.incomeRange}</p>}
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Privacy Note</h4>
              <p className="text-sm text-gray-600">
                Your income information is kept strictly confidential and is only used to verify 
                your profile authenticity. It will not be displayed publicly.
              </p>
            </div>
          </motion.div>
        );
        
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Profile Photo</h3>
              <p className="text-gray-600 mb-4">Upload a clear, recent photo of yourself</p>
              
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setPhotoPreview('');
                        setFormData(prev => ({ ...prev, profilePhoto: undefined }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-champagne-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Upload your profile photo</p>
                    <p className="text-xs text-gray-400 mt-2">Max 5MB • JPG, PNG, or GIF</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                
                {errors.profilePhoto && <p className="text-red-500 text-sm">{errors.profilePhoto}</p>}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Photo Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clear, recent photo of your face</li>
                <li>• No sunglasses or hats</li>
                <li>• No group photos</li>
                <li>• Good lighting and quality</li>
                <li>• Professional and respectful presentation</li>
              </ul>
            </div>
          </motion.div>
        );
        
      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 text-center"
          >
            <Shield className="w-16 h-16 mx-auto text-champagne-500 mb-4" />
            <h3 className="text-xl font-semibold">Almost There!</h3>
            <p className="text-gray-600">
              Your profile is almost complete. Before we verify your account, please review your information.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">What happens next:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email verification sent to {formData.email}</li>
                <li>• Profile review by our verification team</li>
                <li>• Account activation within 24 hours</li>
              </ul>
            </div>
            
            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
          </motion.div>
        );
        
      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-champagne-500">Welcome to BrandyBabe.com!</h3>
            <p className="text-gray-600">
              Your account has been created successfully. Please check your email for verification instructions.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/verify-email')}
                className="bg-gradient-gold text-charcoal-900 font-bold"
              >
                Continue to Email Verification
              </Button>
              
              <p className="text-xs text-gray-500">
                Having trouble? Check your spam folder or contact support.
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {steps[currentStep - 1]?.title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-gold h-2 rounded-full"
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : index + 1 === currentStep
                    ? 'bg-champagne-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep <= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-between mt-8 pt-6 border-t border-gray-100"
            >
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="space-x-3">
                {currentStep < 6 ? (
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-gradient-gold text-charcoal-900 font-bold"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-gradient-gold text-charcoal-900 font-bold"
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}