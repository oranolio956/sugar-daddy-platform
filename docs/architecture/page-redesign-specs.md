# Page-by-Page Redesign Specifications

This document provides detailed redesign specifications for the Sugar Daddy Platform, aligning with the [Design System](docs/architecture/design-system.md) and addressing the gaps identified in the [Current Design Analysis](docs/architecture/current-design-analysis.md).

## Table of Contents
1. [Homepage Redesign](#1-homepage-redesign)
2. [Login Page Redesign](#2-login-page-redesign)
3. [Registration Page Redesign](#3-registration-page-redesign)
4. [Dashboard Redesign](#4-dashboard-redesign)
5. [Layout & Navigation Redesign](#5-layout--navigation-redesign)
6. [Premium Components Specifications](#6-premium-components-specifications)
7. [Animation & Interaction Specifications](#7-animation--interaction-specifications)
8. [Responsive Design Specifications](#8-responsive-design-specifications)
9. [Accessibility & Performance](#9-accessibility--performance)
10. [Implementation Guidelines](#10-implementation-guidelines)

---

## 1. Homepage (`frontend/web-app/src/app/page.tsx`)

### Page Overview
- **Purpose:** Convert visitors into registered members by showcasing the platform's exclusivity, security, and high-quality community.
- **Key Metrics:** Registration conversion rate, time on page, bounce rate.

### Layout Structure
- **Hero Section:** Full-screen (100vh) with lifestyle video/image background.
- **Trust Bar:** Horizontal strip below hero with security badges and member counts.
- **Featured Members:** Horizontal carousel with blurred previews for non-members.
- **How It Works:** 3-column grid with animated step indicators.
- **Membership Benefits:** Alternating side-by-side layout (Image/Text).
- **Testimonials:** 3-card grid with elegant typography.
- **Final CTA:** Centered high-impact section.

### Component Breakdown
- `HeroSection`: Lifestyle background, animated headline, split CTA.
- `MemberCarousel`: Blurred profile cards with "Join to View" overlay.
- `StepCard`: Icon, title, description with connector lines.
- `BenefitSection`: Rich imagery paired with benefit copy.
- `TestimonialCard`: Playfair Display quotes, member role, star rating.

### Visual Design
- **Colors:** `luxury-black` background for hero, `ivory-pearl` for body sections. `primary-500` (Gold) for primary CTAs.
- **Typography:** `font-display` (Playfair Display) for all section headers (text-5xl+). `font-sans` (Inter) for body.
- **Shadows:** `shadow-premium` on cards.

### Interactions
- **Hero:** Parallax effect on background image.
- **Buttons:** `animate-pulse-gold` on primary "Start Your Journey" button.
- **Scroll:** Reveal animations (fade-in-up) as sections enter viewport.

### Missing Elements (From Analysis)
- **Hero Video/Image:** Add cinematic lifestyle background
- **Featured Members Carousel:** Show attractive member profiles with blur overlay
- **Success Stories:** Testimonials with photos and results
- **Trust Indicators:** SSL badges, verification info, member statistics
- **Lifestyle Imagery:** Photos conveying luxury lifestyle
- **Statistics Display:** Member count, matches made, success rate

### Enhanced Homepage Structure
```jsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-ivory-pearl">
      {/* Hero Section with Video Background */}
      <HeroSection />
      
      {/* Trust Bar with Statistics */}
      <TrustBar 
        memberCount="500K+"
        matchesMade="100K+"
        verifiedMembers="95%"
      />
      
      {/* Featured Members Carousel */}
      <FeaturedMembersCarousel />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Lifestyle Gallery */}
      <LifestyleGallery />
      
      {/* Success Stories */}
      <SuccessStories />
      
      {/* Premium Benefits */}
      <PremiumBenefits />
      
      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}
```

---

## 2. Login Page (`frontend/web-app/src/app/login/page.tsx`)

### Page Overview
- **Purpose:** Provide a secure, elegant entry point for existing members.
- **Key Metrics:** Login success rate, social login usage.

### Layout Structure
- **Split-Screen:** 
  - **Left (40%):** Login form on `luxury-charcoal` background.
  - **Right (60%):** High-resolution lifestyle image (e.g., luxury lounge or candlelit dinner).

### Component Breakdown
- `LoginForm`: Custom inputs with gold focus rings.
- `SocialLoginGroup`: Branded buttons for Google/Apple with `shadow-soft`.
- `TrustFooter`: Small security badges (SSL, Verified) below the form.

### Visual Design
- **Colors:** `primary-500` for the "Sign In" button. `neutral-400` for placeholders.
- **Typography:** `font-display` for "Welcome Back" header.

### Interactions
- **Form:** Floating label animation on input focus.
- **Transition:** Smooth fade-in of the lifestyle image on page load.

### Premium Features
- **Biometric Login:** Face ID/Touch ID integration
- **Demo Login:** "View Demo" option for showcasing
- **Branded Social Buttons:** Custom Google/Apple icons
- **Security Messaging:** "Your privacy is our priority" reassurance

### Enhanced Login Structure
```jsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/5 bg-luxury-charcoal p-8 lg:p-12">
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral-300 mb-8">
            Sign in to your exclusive account
          </p>
          
          <LoginForm />
          
          <div className="mt-6">
            <SocialLoginGroup />
          </div>
          
          <div className="mt-8 text-center text-sm text-neutral-400">
            <SecurityBadges />
          </div>
        </div>
      </div>
      
      {/* Right Side - Lifestyle Image */}
      <div className="hidden lg:block lg:w-3/5 bg-gradient-to-r from-primary-900 to-secondary-900">
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h2 className="font-display text-4xl font-bold mb-4">
              Luxury Lifestyle Awaits
            </h2>
            <p className="text-lg opacity-90">
              Join thousands of successful individuals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Registration Page (`frontend/web-app/src/app/register/page.tsx`)

### Page Overview
- **Purpose:** Guide users through a multi-step onboarding process without overwhelming them.
- **Key Metrics:** Completion rate per step, drop-off points.

### Layout Structure
- **Multi-Step Wizard:**
  - **Top:** Progress indicator (Step 1 of 5) with gold line.
  - **Center:** Step-specific form content.
  - **Side Panel (Desktop):** Rotating testimonials or "Why Join" benefits.

### Step Breakdown
1. **Account Type:** Large visual cards for "Sugar Daddy" vs "Sugar Baby".
2. **Basic Info:** Email, password, username.
3. **Profile Details:** Age, location, and photo upload (drag & drop).
4. **Preferences:** Interests tags and "What I'm looking for" text area.
5. **Verification:** Optional ID/Social verification prompt.

### Visual Design
- **Progress Bar:** `bg-primary-500` for active steps.
- **Cards:** `border-primary-200` for selected account type.

### Interactions
- **Transitions:** Horizontal slide animation between steps.
- **Validation:** Shake animation on form fields with errors.

### Missing Elements (From Analysis)
- **Progress Indicator:** Visual stepper showing completion
- **Visual Role Selection:** Cards with imagery instead of dropdown
- **Photo Upload:** Drag & drop interface with guidelines
- **Profile Questions:** Lifestyle, interests, expectations
- **Income Verification:** Range selection for sugar daddies
- **Email Verification:** Post-registration verification step

### Enhanced Registration Structure
```jsx
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  return (
    <div className="min-h-screen bg-gradient-champagne py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress & Form */}
          <div className="lg:col-span-2">
            <RegistrationWizard 
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </div>
          
          {/* Side Panel */}
          <div className="lg:col-span-1">
            <RegistrationSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
const Step1_AccountType = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="font-display text-2xl font-bold text-neutral-800">
        Choose Your Journey
      </h2>
      <p className="text-neutral-600 mt-2">
        Select your role to get started
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4">
      <RoleCard 
        type="sugar-daddy"
        title="Sugar Daddy"
        description="Successful professional seeking companionship"
        icon={<BriefcaseIcon />}
      />
      <RoleCard 
        type="sugar-baby"
        title="Sugar Baby"
        description="Attractive individual seeking guidance"
        icon={<SparklesIcon />}
      />
    </div>
  </div>
);

const Step3_PhotoUpload = () => (
  <div className="space-y-6">
    <div>
      <h3 className="font-display text-xl font-semibold text-neutral-800 mb-2">
        Add Your Photos
      </h3>
      <p className="text-neutral-600">
        Upload clear, recent photos that showcase your personality
      </p>
    </div>
    
    <PhotoUploadZone 
      guidelines={[
        "Clear, well-lit photos",
        "Recent images (within 6 months)",
        "No group photos",
        "Professional quality preferred"
      ]}
    />
    
    <div className="grid grid-cols-3 gap-4 mt-6">
      <PhotoPreview src="/placeholder1.jpg" />
      <PhotoPreview src="/placeholder2.jpg" />
      <PhotoPreview src="/placeholder3.jpg" />
    </div>
  </div>
);
```

---

## 4. Dashboard (`frontend/web-app/src/app/dashboard/page.tsx`)

### Page Overview
- **Purpose:** Provide a high-level view of activity, matches, and quick actions.
- **Key Metrics:** Daily active usage, message response rate.

### Layout Structure
- **Header:** User profile summary with "Premium" status badge.
- **Grid Layout:**
  - **Top Row:** 4 Stats cards (Matches, Views, Messages, Balance).
  - **Main Column (Left):** Activity feed and Match Suggestions carousel.
  - **Sidebar (Right):** Quick Actions, Profile Completion, and Recent Visitors.

### Component Breakdown
- `StatCard`: Icon, value, and trend indicator (e.g., +5% this week).
- `MatchCarousel`: Swipeable cards with profile photo and compatibility %.
- `ActivityCard`: Rich notification (e.g., "Alexandra liked your profile").
- `UpgradeBanner`: `bg-gradient-gold` banner for free users.

### Visual Design
- **Colors:** `bg-ivory-linen` for the page background. `bg-white` for cards.
- **Shadows:** `shadow-card` with `shadow-card-hover` on interaction.

### Interactions
- **Swipe:** Touch-enabled carousel for match suggestions.
- **Real-time:** Pulse animation on the "Online" status indicator.

### Missing Elements (From Analysis)
- **Profile Photo Prominence:** User's photo should be featured prominently
- **Profile Completion:** Progress ring showing completion percentage
- **Who Viewed You:** Activity section showing profile views
- **Match Suggestions:** "People you might like" with photos
- **Premium Upsell:** Upgrade prompts and feature highlights
- **Boost Features:** Spotlight/boost functionality
- **Activity Feed:** Real-time notifications and updates

### Enhanced Dashboard Structure
```jsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-ivory-linen">
      {/* Header with User Info */}
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard 
                title="Matches" 
                value="12" 
                trend="+3 this week"
                icon={<HeartIcon className="w-6 h-6" />}
              />
              <StatCard 
                title="Profile Views" 
                value="45" 
                trend="+12 today"
                icon={<EyeIcon className="w-6 h-6" />}
              />
              <StatCard 
                title="Messages" 
                value="8" 
                trend="2 unread"
                icon={<MessageIcon className="w-6 h-6" />}
              />
              <StatCard 
                title="Balance" 
                value="$250" 
                trend="Available credits"
                icon={<CreditCardIcon className="w-6 h-6" />}
              />
            </div>
            
            {/* Profile Completion */}
            <ProfileCompletionCard />
            
            {/* Match Suggestions */}
            <MatchSuggestionsCarousel />
            
            {/* Activity Feed */}
            <ActivityFeed />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard />
            
            {/* Who Viewed You */}
            <WhoViewedYouCard />
            
            {/* Premium Upgrade */}
            <PremiumUpgradeCard />
            
            {/* Recent Messages */}
            <RecentMessagesCard />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Layout & Navigation (`frontend/web-app/src/components/Layout.tsx`)

### Page Overview
- **Purpose:** Provide consistent, premium navigation across the application.

### Layout Structure
- **Desktop Sidebar:** Fixed left navigation with gold accent border.
- **Mobile Bottom Nav:** 5-icon bar (Home, Search, Messages, Activity, Profile).
- **Top Bar:** Search input, Notification bell, and User menu.

### Component Breakdown
- `SidebarItem`: Icon + Label with `primary-500` active state.
- `NotificationCenter`: Dropdown with rich activity cards.
- `UserMenu`: Dropdown with "My Profile", "Settings", and "Logout".

### Visual Design
- **Colors:** `luxury-black` for sidebar. `primary-500` for active icons.
- **Typography:** `font-sans` medium for nav labels.

### Interactions
- **Hover:** Subtle gold glow on nav items.
- **Notifications:** Bouncing badge animation for new alerts.

### Missing Elements (From Analysis)
- **Logo:** Professional logo instead of plain text
- **User Menu:** Dropdown with profile options
- **Global Search:** Search functionality across platform
- **Dark Mode Toggle:** Proper dark mode integration
- **Notification Rich Cards:** Detailed notification content

### Enhanced Layout Structure
```jsx
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-ivory-pearl dark:bg-luxury-charcoal">
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Navigation Bar */}
          <TopBar />
          
          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
        
        {/* Right Sidebar (Optional) */}
        <RightSidebar />
      </div>
      
      {/* Global Modals */}
      <GlobalModals />
    </div>
  );
}

// Enhanced Sidebar Component
const Sidebar = () => (
  <aside className="hidden lg:block w-64 bg-white dark:bg-luxury-slate border-r border-neutral-200 dark:border-luxury-graphite fixed left-0 top-0 h-full">
    <div className="p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Logo className="w-8 h-8" />
        <span className="font-display text-xl font-bold text-neutral-800 dark:text-neutral-100">
          LuxeMatch
        </span>
      </div>
      
      {/* Navigation Links */}
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <SidebarItem 
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={item.isActive}
          />
        ))}
      </nav>
      
      {/* User Profile Section */}
      <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-luxury-graphite">
        <UserProfileCard />
      </div>
    </div>
  </aside>
);

// Enhanced Top Bar
const TopBar = () => (
  <header className="bg-white dark:bg-luxury-slate border-b border-neutral-200 dark:border-luxury-graphite sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <MobileMenuButton />
          <SearchBar />
        </div>
        
        {/* Right Side */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserMenu />
          <DarkModeToggle />
        </div>
      </div>
    </div>
  </header>
);
```

---

## 6. Premium Components Specifications

### 6.1 ProfileCard Component
```jsx
interface ProfileCardProps {
  user: UserProfile;
  variant?: 'standard' | 'premium' | 'featured';
  showActions?: boolean;
  onLike?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const ProfileCard = ({ user, variant = 'standard', ...props }) => {
  return (
    <div className={cn(
      "bg-white dark:bg-luxury-slate rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300",
      variant === 'premium' && "border-2 border-primary-200 dark:border-primary-800",
      variant === 'featured' && "relative bg-gradient-champagne"
    )}>
      {/* Profile Image */}
      <div className="relative h-48 bg-gradient-premium">
        <img 
          src={user.profilePhoto} 
          alt={user.name}
          className="w-full h-full object-cover"
        />
        
        {/* Verification Badge */}
        {user.isVerified && (
          <div className="absolute top-3 left-3">
            <VerificationBadge type="photo" />
          </div>
        )}
        
        {/* Premium Badge */}
        {user.isPremium && (
          <div className="absolute top-3 right-3">
            <PremiumBadge tier="gold" />
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {user.name}, {user.age}
          </h3>
          <div className="flex items-center gap-2">
            <OnlineStatus isOnline={user.isOnline} />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {user.distance} miles away
            </span>
          </div>
        </div>
        
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
          {user.bio}
        </p>
        
        {/* Lifestyle Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {user.tags.map(tag => (
            <LifestyleTag key={tag} tag={tag} />
          ))}
        </div>
        
        {/* Actions */}
        {props.showActions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={props.onViewProfile}>
              View Profile
            </Button>
            <Button size="sm" onClick={props.onMessage}>
              Message
            </Button>
            <LikeButton isActive={user.hasLiked} onClick={props.onLike} />
          </div>
        )}
      </div>
    </div>
  );
};
```

### 6.2 Avatar Component
```jsx
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
  status?: 'online' | 'offline' | 'away';
  verification?: 'none' | 'email' | 'photo' | 'income';
  premium?: boolean;
}

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  variant = 'circle',
  status,
  verification = 'none',
  premium = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };
  
  return (
    <div className="relative inline-block">
      <div className={cn(
        "relative bg-gradient-gold text-luxury-black font-bold overflow-hidden",
        sizeClasses[size],
        variant === 'circle' && "rounded-full",
        variant === 'rounded' && "rounded-xl",
        variant === 'square' && "rounded-none"
      )}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Premium Border */}
        {premium && (
          <div className="absolute inset-0 rounded-full border-2 border-primary-500"></div>
        )}
      </div>
      
      {/* Status Indicator */}
      {status && (
        <div className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-luxury-charcoal",
          status === 'online' && "bg-success-500",
          status === 'offline' && "bg-neutral-400",
          status === 'away' && "bg-warning-500"
        )}></div>
      )}
      
      {/* Verification Badge */}
      {verification !== 'none' && (
        <div className="absolute -top-1 -right-1">
          <VerificationBadge type={verification} size="sm" />
        </div>
      )}
    </div>
  );
};
```

### 6.3 VerificationBadge Component
```jsx
interface VerificationBadgeProps {
  type: 'email' | 'photo' | 'income' | 'phone' | 'social';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const VerificationBadge = ({ type, size = 'md', showLabel = false }) => {
  const badgeConfig = {
    email: { icon: <MailIcon />, color: 'success', label: 'Email' },
    photo: { icon: <CameraIcon />, color: 'primary', label: 'Photo' },
    income: { icon: <DollarSignIcon />, color: 'gold', label: 'Income' },
    phone: { icon: <PhoneIcon />, color: 'info', label: 'Phone' },
    social: { icon: <UserCheckIcon />, color: 'secondary', label: 'Social' }
  };
  
  const config = badgeConfig[type];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
      config.color === 'success' && "bg-success-100 text-success-700",
      config.color === 'primary' && "bg-primary-100 text-primary-700",
      config.color === 'gold' && "bg-gradient-gold text-luxury-black",
      config.color === 'info' && "bg-info-100 text-info-700",
      config.color === 'secondary' && "bg-secondary-100 text-secondary-700"
    )}>
      {config.icon}
      {showLabel && config.label}
    </div>
  );
};
```

### 6.4 PremiumBadge Component
```jsx
interface PremiumBadgeProps {
  tier: 'silver' | 'gold' | 'platinum';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const PremiumBadge = ({ tier, size = 'md', showLabel = true }) => {
  const tierConfig = {
    silver: { 
      gradient: 'bg-gradient-to-r from-gray-300 to-gray-400',
      icon: <StarIcon className="text-gray-600" />,
      label: 'Silver'
    },
    gold: { 
      gradient: 'bg-gradient-gold',
      icon: <CrownIcon className="text-luxury-black" />,
      label: 'Gold'
    },
    platinum: { 
      gradient: 'bg-gradient-to-r from-blue-400 to-blue-600',
      icon: <DiamondIcon className="text-white" />,
      label: 'Platinum'
    }
  };
  
  const config = tierConfig[tier];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm",
      size === 'sm' && "text-xs px-2 py-1",
      size === 'lg' && "text-base px-4 py-2"
    )}>
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center",
        config.gradient
      )}>
        {config.icon}
      </div>
      {showLabel && (
        <span className="text-luxury-black">{config.label}</span>
      )}
    </div>
  );
};
```

### 6.5 PhotoGallery Component
```jsx
interface PhotoGalleryProps {
  photos: string[];
  isVerified?: boolean;
  canView?: boolean;
  onPhotoClick?: (index: number) => void;
}

const PhotoGallery = ({ photos, isVerified = false, canView = true, onPhotoClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((photo, index) => (
        <div key={index} className="relative group cursor-pointer">
          <img
            src={photo}
            alt={`Photo ${index + 1}`}
            className={cn(
              "w-full h-32 md:h-40 object-cover rounded-lg",
              !canView && "blur-sm",
              "transition-all duration-300 group-hover:scale-105"
            )}
            onClick={() => canView && onPhotoClick?.(index)}
          />
          
          {!canView && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LockIcon className="w-8 h-8 text-white opacity-80" />
            </div>
          )}
          
          {index === 0 && isVerified && (
            <div className="absolute top-2 left-2">
              <VerificationBadge type="photo" size="sm" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 7. Animation & Interaction Specifications

### 7.1 Page Transitions
```css
/* Page Transition Animations */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 7.2 Component Animations
```css
/* Card Hover Effects */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Button Press Animation */
.btn-press:active {
  transform: scale(0.98);
}

/* Loading Shimmer */
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Pulse Gold Animation */
.pulse-gold {
  animation: pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseGold {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); 
  }
  50% { 
    box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); 
  }
}
```

### 7.3 Micro-interactions
```jsx
// Like Button Animation
const LikeButton = ({ isActive, onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    onClick();
  };
  
  return (
    <button 
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        isActive ? "text-primary-500" : "text-neutral-400 hover:text-primary-500"
      )}
    >
      <HeartIcon 
        className={cn(
          "w-5 h-5",
          isAnimating && "animate-heartBeat"
        )}
      />
    </button>
  );
};

// Heart Beat Animation
@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### 7.4 Scroll Animations
```jsx
// Intersection Observer for Scroll Animations
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return { ref, isVisible };
};

// Usage in Components
const AnimatedSection = ({ children }) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
    >
      {children}
    </div>
  );
};
```

---

## 8. Responsive Design Specifications

### 8.1 Breakpoint Strategy
```css
/* Custom Breakpoints for Premium Experience */
:root {
  --breakpoint-xs: 475px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile-First Approach */
.homepage-hero {
  /* Mobile styles */
  height: 60vh;
  
  @media (min-width: 768px) {
    /* Tablet styles */
    height: 70vh;
  }
  
  @media (min-width: 1024px) {
    /* Desktop styles */
    height: 80vh;
  }
  
  @media (min-width: 1280px) {
    /* Large desktop styles */
    height: 100vh;
  }
}
```

### 8.2 Mobile-Specific Components
```jsx
// Bottom Navigation for Mobile
const BottomNavigation = () => {
  const navigationItems = [
    { icon: <HomeIcon />, label: 'Home', href: '/' },
    { icon: <SearchIcon />, label: 'Search', href: '/search' },
    { icon: <MessageCircleIcon />, label: 'Messages', href: '/messages' },
    { icon: <BellIcon />, label: 'Activity', href: '/activity' },
    { icon: <UserIcon />, label: 'Profile', href: '/profile' }
  ];
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-luxury-charcoal border-t border-neutral-200 dark:border-luxury-graphite">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => (
          <button key={item.href} className="flex flex-col items-center gap-1 p-2">
            <item.icon className="w-6 h-6 text-neutral-500" />
            <span className="text-xs text-neutral-500">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Mobile Sidebar Overlay
const MobileSidebar = ({ isOpen, onClose }) => {
  return (
    <div className={cn(
      "lg:hidden fixed inset-0 z-50",
      isOpen ? "block" : "hidden"
    )}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-luxury-slate shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <button onClick={onClose}>
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {/* Navigation items */}
          </nav>
        </div>
      </div>
    </div>
  );
};
```

### 8.3 Tablet Optimizations
```css
/* Tablet-Specific Layouts */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    /* Tablet landscape */
    grid-template-columns: 2fr 1fr;
  }
  
  @media (min-width: 1024px) {
    /* Desktop */
    grid-template-columns: 3fr 1fr;
  }
}

/* Form Layouts for Tablet */
.registration-form {
  max-width: 500px;
  
  @media (min-width: 768px) {
    /* Side-by-side layout for tablet */
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
```

### 8.4 Touch Interactions
```css
/* Touch-Friendly Styles */
.touch-target {
  min-height: 44px; /* Minimum touch target size */
  min-width: 44px;
  padding: 12px;
  border-radius: 8px;
}

/* Swipe Gestures for Mobile */
.carousel-item {
  touch-action: pan-y; /* Allow vertical scrolling, handle horizontal swipes */
}

/* Mobile Form Optimizations */
.mobile-form {
  input, select, textarea {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px;
    border-radius: 8px;
  }
}
```

---

## 9. Accessibility & Performance

### 9.1 Accessibility Standards
```jsx
// Accessible Button Component
const AccessibleButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  ariaLabel,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || children}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === 'primary' && "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500",
        variant === 'secondary' && "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible Form Labels
const AccessibleInput = ({ 
  id, 
  label, 
  error, 
  helpText, 
  required = false,
  ...inputProps 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {label}
        {required && <span className="text-error-500">*</span>}
      </Label>
      
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      
      {helpText && (
        <p className="text-sm text-neutral-500" id={`${id}-help`}>
          {helpText}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-error-500" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};
```

### 9.2 Performance Optimizations
```jsx
// Lazy Loading for Images
const LazyImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className={className}>
      {isLoaded && (
        <img 
          src={src} 
          alt={alt} 
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

// Virtualization for Long Lists
const VirtualizedList = ({ items, itemHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, items.length]);
  
  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        {items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => (
          <div
            key={item.id}
            style={{
              height: itemHeight,
              transform: `translateY(${(visibleRange.startIndex + index) * itemHeight}px)`
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 9.3 Color Contrast & Readability
```css
/* High Contrast Text */
.text-high-contrast {
  color: #000000;
  background-color: #ffffff;
}

.text-medium-contrast {
  color: #333333;
  background-color: #f8f8f8;
}

/* Dark Mode Contrast */
.dark .text-high-contrast {
  color: #ffffff;
  background-color: #000000;
}

.dark .text-medium-contrast {
  color: #e0e0e0;
  background-color: #1a1a1a;
}

/* Focus Indicators */
.focus-visible {
  outline: 2px solid #d4af37;
  outline-offset: 2px;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Implementation Guidelines

### 10.1 Development Workflow
```bash
# 1. Component Development
npm run dev
# Develop components in isolation using Storybook

# 2. Design System Integration
npm run build:design-system
# Build and test design tokens

# 3. Responsive Testing
npm run test:responsive
# Test across all breakpoints

# 4. Performance Testing
npm run analyze
# Bundle analysis and performance metrics

# 5. Accessibility Testing
npm run test:a11y
# Automated accessibility testing
```

### 10.2 Component Naming Conventions
```typescript
// Component File Structure
components/
├── ui/                    # Base UI components
│   ├── Button/
│   │   ├── index.tsx     # Main component
│   │   ├── variants.ts   # CVA variants
│   │   └── styles.css    # Component styles
│   └── Card/
├── premium/              # Premium-specific components
│   ├── ProfileCard/
│   ├── VerificationBadge/
│   └── PremiumBadge/
└── layout/               # Layout components
    ├── Layout/
    └── Navigation/
```

### 10.3 State Management
```typescript
// Zustand Store for Premium Features
interface PremiumState {
  user: UserProfile | null;
  isPremium: boolean;
  credits: number;
  features: PremiumFeatures;
  actions: {
    upgrade: (plan: PremiumPlan) => Promise<void>;
    useCredit: (feature: string) => void;
    refreshUser: () => Promise<void>;
  };
}

const usePremiumStore = create<PremiumState>((set, get) => ({
  user: null,
  isPremium: false,
  credits: 0,
  features: {},
  actions: {
    upgrade: async (plan) => {
      // Handle premium upgrade
    },
    useCredit: (feature) => {
      // Deduct credits for feature usage
    },
    refreshUser: async () => {
      // Refresh user data
    }
  }
}));
```

### 10.4 Testing Strategy
```typescript
// Component Testing with Jest & Testing Library
describe('ProfileCard', () => {
  it('should render user information correctly', () => {
    const user = mockUser();
    render(<ProfileCard user={user} />);
    
    expect(screen.getByText(user.name)).toBeInTheDocument();
    expect(screen.getByText(`${user.age}`)).toBeInTheDocument();
  });
  
  it('should show verification badge when user is verified', () => {
    const user = { ...mockUser(), isVerified: true };
    render(<ProfileCard user={user} />);
    
    expect(screen.getByLabelText('Verified')).toBeInTheDocument();
  });
  
  it('should handle like action', async () => {
    const user = mockUser();
    const onLike = jest.fn();
    
    render(<ProfileCard user={user} onLike={onLike} />);
    
    await userEvent.click(screen.getByLabelText('Like'));
    expect(onLike).toHaveBeenCalled();
  });
});
```

### 10.5 Performance Monitoring
```typescript
// Performance Monitoring Hook
const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor component render time
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) { // More than one frame
        console.warn(`Slow render: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
  
  // Monitor image loading
  const trackImageLoad = (src: string) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      if (loadTime > 1000) {
        console.warn(`Slow image load: ${src} took ${loadTime.toFixed(2)}ms`);
      }
    };
    
    img.src = src;
  };
  
  return { trackImageLoad };
};
```

### 10.6 Deployment Checklist
- [ ] All components pass accessibility tests
- [ ] Performance metrics meet targets (Lighthouse scores)
- [ ] Responsive design tested on all breakpoints
- [ ] Dark mode implementation complete
- [ ] Premium features properly gated
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Form validation working
- [ ] Security measures implemented
- [ ] Analytics tracking in place

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Update color palette and typography
- [ ] Implement core design system components
- [ ] Create premium component library

### Phase 2: Page Redesign (Week 3-4)
- [ ] Redesign homepage with premium elements
- [ ] Update login page with split-screen layout
- [ ] Convert registration to multi-step wizard
- [ ] Enhance dashboard with rich components

### Phase 3: Polish & Performance (Week 5-6)
- [ ] Add animations and micro-interactions
- [ ] Implement responsive optimizations
- [ ] Performance optimization and testing
- [ ] Accessibility improvements

### Phase 4: Testing & Deployment (Week 7)
- [ ] Comprehensive testing
- [ ] User acceptance testing
- [ ] Performance monitoring setup
- [ ] Production deployment

---

*Document Version: 2.0*
*Created: December 2024*
*Last Updated: December 2024*
*Next Review: January 2025*
