# Design System 2026: Champagne & Charcoal
## Premium Luxury Specification

This document defines the "2026-ready" design system for the Sugar Daddy Platform, moving away from high-contrast "template" aesthetics toward a sophisticated, immersive luxury experience.

---

## 1. Color Palette: Champagne & Deep Charcoal

The 2026 palette prioritizes depth, soft transitions, and "quiet luxury."

### 1.1 Core Colors
| Name | Hex | Usage |
|------|-----|-------|
| **Champagne 500** | `#F7E7CE` | Primary brand color, highlights |
| **Champagne 600** | `#E8D4B4` | Hover states, active elements |
| **Deep Charcoal 900** | `#121212` | Primary background (Dark Mode) |
| **Deep Charcoal 800** | `#1A1A1A` | Card backgrounds, elevated surfaces |
| **Soft Ivory** | `#FAF9F6` | Primary background (Light Mode) |

### 1.2 Glassmorphism Support
To achieve the "2026" look, colors are often used with alpha channels:
- **Glass Background**: `rgba(26, 26, 26, 0.6)`
- **Glass Border**: `rgba(247, 231, 206, 0.1)`
- **Backdrop Blur**: `blur(12px)`

---

## 2. Typography: Fluid & Variable

We move away from static pixel sizes to a fluid system that scales perfectly across all devices.

### 2.1 Fluid Scale
Using `clamp()` for seamless scaling without breakpoints.

- **Display Large**: `clamp(2.5rem, 5vw + 1rem, 5rem)`
- **Heading 1**: `clamp(2rem, 4vw + 1rem, 3.5rem)`
- **Body Main**: `clamp(1rem, 0.5vw + 0.8rem, 1.125rem)`

### 2.2 Variable Fonts
- **Primary Sans**: `Inter Variable` (Weight: 100-900)
- **Display Serif**: `Playfair Display Variable` (Weight: 400-900, Optical Size: 20-144)

---

## 3. Materiality & Layout

### 3.1 Bento Grid Rules
- **Gaps**: `1.5rem` (24px) standard.
- **Border Radius**: `2rem` (32px) for large containers, `1rem` (16px) for nested items.
- **Aspect Ratios**: Use `aspect-video` or `aspect-square` to maintain grid harmony.

### 3.2 Backdrop Blurs
- **Level 1 (Navigation)**: `backdrop-blur-md` (8px)
- **Level 2 (Modals/Cards)**: `backdrop-blur-xl` (20px)

---

## 4. Motion & Animation

### 4.1 Framer Motion Standards
- **Transitions**: `type: "spring", stiffness: 260, damping: 20`
- **Hover**: `scale: 1.02, transition: { duration: 0.2 }`
- **Tap**: `scale: 0.98`

### 4.2 Scroll-Driven Patterns
- **Reveal**: Elements should fade in and slide up as they enter the viewport.
- **Parallax**: Subtle `y` offset on background images during scroll.

---

## 5. Component Guidelines

### 5.1 Button (Premium)
- **Visual**: Gradient border with a subtle inner glow.
- **Interaction**: Shimmer effect on hover that follows the mouse cursor.
- **Typography**: All-caps, `tracking-widest`, `font-medium`.

### 5.2 Input (Sophisticated)
- **Visual**: Bottom-border only by default, expanding to a full glassmorphic container on focus.
- **Animation**: Floating label moves with a "spring" transition.

### 5.3 Card (Bento Style)
- **Visual**: `bg-charcoal-800/60` with `backdrop-blur`.
- **Border**: 1px solid `rgba(255,255,255,0.05)`.
- **Shadow**: Soft ambient occlusion shadow rather than a direct drop shadow.
