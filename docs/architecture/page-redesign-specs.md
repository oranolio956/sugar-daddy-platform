# Page-by-Page Redesign Specifications

This document provides detailed redesign specifications for the Sugar Daddy Platform, aligning with the [Design System](docs/architecture/design-system.md) and addressing the gaps identified in the [Current Design Analysis](docs/architecture/current-design-analysis.md).

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

---

## 3. Register Page (`frontend/web-app/src/app/register/page.tsx`)

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

---

## Implementation Notes
- **Framework:** Next.js 14 (App Router).
- **Styling:** Tailwind CSS with custom configuration from `design-system.md`.
- **Animations:** Framer Motion for page transitions and scroll reveals.
- **Icons:** Lucide React for standard UI, custom SVG for premium badges.
- **Accessibility:** Ensure 4.5:1 contrast ratio for all text; ARIA labels for all interactive elements.
