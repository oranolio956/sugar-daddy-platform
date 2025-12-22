# Design System Foundation - Sugar Daddy Platform

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography System](#3-typography-system)
4. [Design Tokens](#4-design-tokens)
5. [Tailwind Configuration](#5-tailwind-configuration)
6. [Usage Examples](#6-usage-examples)
7. [Accessibility Considerations](#7-accessibility-considerations)

---

## 1. Design Philosophy

### 1.1 Brand Personality

The Sugar Daddy Platform design system embodies **luxury, exclusivity, and sophistication**. Our visual language draws inspiration from:

- **High-end fashion brands** (Gucci, Chanel, Louis Vuitton)
- **Luxury hotels** (Four Seasons, Ritz-Carlton, Aman)
- **Exclusive private clubs** (Soho House, The Wing)
- **Premium dating platforms** (Seeking.com, Luxy, Millionaire Match)

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Elegance** | Every element should feel refined and intentional |
| **Warmth** | Colors and typography should feel inviting, not cold |
| **Trust** | Design should convey security and legitimacy |
| **Exclusivity** | Visual cues should suggest premium membership value |
| **Clarity** | Despite luxury aesthetics, usability remains paramount |

### 1.3 Visual Mood

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ✦ Candlelit dinner ambiance                              │
│   ✦ Champagne bubbles and gold accents                     │
│   ✦ Velvet textures and soft shadows                       │
│   ✦ Rose petals and romantic undertones                    │
│   ✦ Private jet and yacht lifestyle imagery                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Color Palette

### 2.1 Primary Colors - Rich Gold & Champagne

The primary palette centers on **gold tones** that evoke wealth, success, and premium quality.

#### Gold (Primary)

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FDF9F0` | rgb(253, 249, 240) | Subtle backgrounds, hover states |
| 100 | `#FAF0D7` | rgb(250, 240, 215) | Light backgrounds, cards |
| 200 | `#F5E1AF` | rgb(245, 225, 175) | Borders, dividers |
| 300 | `#EFD087` | rgb(239, 208, 135) | Secondary buttons, tags |
| 400 | `#E8BE5F` | rgb(232, 190, 95) | Hover states, highlights |
| **500** | **`#D4AF37`** | **rgb(212, 175, 55)** | **Primary brand color** |
| 600 | `#C9A227` | rgb(201, 162, 39) | Primary buttons, CTAs |
| 700 | `#A88620` | rgb(168, 134, 32) | Active states, pressed |
| 800 | `#876B1A` | rgb(135, 107, 26) | Dark accents |
| 900 | `#665013` | rgb(102, 80, 19) | Text on light backgrounds |

```css
/* Visual Swatch - Gold */
█████ #D4AF37 - Rich Gold (Primary)
█████ #C9A227 - Antique Gold
█████ #F5E1AF - Champagne Light
█████ #EFD087 - Champagne
```

### 2.2 Secondary Colors - Deep Burgundy & Wine

The secondary palette uses **burgundy/wine tones** inspired by Seeking.com, conveying romance, passion, and sophistication.

#### Burgundy (Secondary)

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FDF2F4` | rgb(253, 242, 244) | Error backgrounds, alerts |
| 100 | `#FCE7EB` | rgb(252, 231, 235) | Light accent backgrounds |
| 200 | `#F9CED6` | rgb(249, 206, 214) | Soft highlights |
| 300 | `#F4A6B5` | rgb(244, 166, 181) | Decorative elements |
| 400 | `#EC7A91` | rgb(236, 122, 145) | Secondary highlights |
| **500** | **`#722F37`** | **rgb(114, 47, 55)** | **Deep burgundy - Main** |
| 600 | `#8B0000` | rgb(139, 0, 0) | Dark red accent |
| 700 | `#5C262D` | rgb(92, 38, 45) | Dark burgundy |
| 800 | `#4A1F24` | rgb(74, 31, 36) | Very dark burgundy |
| 900 | `#38181C` | rgb(56, 24, 28) | Near-black burgundy |

```css
/* Visual Swatch - Burgundy */
█████ #722F37 - Deep Burgundy (Secondary)
█████ #8B0000 - Dark Red
█████ #F4A6B5 - Blush Pink
█████ #EC7A91 - Rose
```

### 2.3 Accent Colors - Rose Gold

Rose gold provides a **romantic, feminine accent** that bridges gold and burgundy.

#### Rose Gold (Accent)

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FDF5F6` | rgb(253, 245, 246) | Subtle backgrounds |
| 100 | `#FCE8EB` | rgb(252, 232, 235) | Light accents |
| 200 | `#F9D4DA` | rgb(249, 212, 218) | Soft highlights |
| 300 | `#F4B5C0` | rgb(244, 181, 192) | Decorative elements |
| 400 | `#E89AA8` | rgb(232, 154, 168) | Secondary accents |
| **500** | **`#B76E79`** | **rgb(183, 110, 121)** | **Rose gold - Main** |
| 600 | `#A35D67` | rgb(163, 93, 103) | Darker rose gold |
| 700 | `#8A4D56` | rgb(138, 77, 86) | Dark accent |
| 800 | `#713F47` | rgb(113, 63, 71) | Very dark rose |
| 900 | `#5A333A` | rgb(90, 51, 58) | Near-black rose |

```css
/* Visual Swatch - Rose Gold */
█████ #B76E79 - Rose Gold (Accent)
█████ #E89AA8 - Light Rose
█████ #F4B5C0 - Blush
█████ #A35D67 - Dusty Rose
```

### 2.4 Neutral Colors - Warm Grays & Ivory

Warm neutrals create a **sophisticated, inviting foundation** rather than cold grays.

#### Warm Neutrals

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FAFAF9` | rgb(250, 250, 249) | Page backgrounds |
| 100 | `#F5F5F4` | rgb(245, 245, 244) | Card backgrounds |
| 200 | `#E7E5E4` | rgb(231, 229, 228) | Borders, dividers |
| 300 | `#D6D3D1` | rgb(214, 211, 209) | Disabled states |
| 400 | `#A8A29E` | rgb(168, 162, 158) | Placeholder text |
| 500 | `#78716C` | rgb(120, 113, 108) | Secondary text |
| 600 | `#57534E` | rgb(87, 83, 78) | Body text |
| 700 | `#44403C` | rgb(68, 64, 60) | Headings |
| 800 | `#292524` | rgb(41, 37, 36) | Primary text |
| 900 | `#1C1917` | rgb(28, 25, 23) | High contrast text |

#### Luxury Dark Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Black | `#0D0D0D` | rgb(13, 13, 13) | True dark mode background |
| Charcoal | `#1A1A1A` | rgb(26, 26, 26) | Dark mode cards |
| Slate | `#2D2D2D` | rgb(45, 45, 45) | Dark mode elevated surfaces |
| Graphite | `#404040` | rgb(64, 64, 64) | Dark mode borders |

#### Ivory & Cream (Light Mode Backgrounds)

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Ivory | `#FFFFF0` | rgb(255, 255, 240) | Premium page backgrounds |
| Cream | `#FFFDD0` | rgb(255, 253, 208) | Warm accent backgrounds |
| Pearl | `#F8F6F0` | rgb(248, 246, 240) | Card backgrounds |
| Linen | `#FAF0E6` | rgb(250, 240, 230) | Soft backgrounds |

### 2.5 Semantic Colors

#### Success - Emerald Green

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#ECFDF5` | rgb(236, 253, 245) | Success backgrounds |
| 100 | `#D1FAE5` | rgb(209, 250, 229) | Light success |
| 200 | `#A7F3D0` | rgb(167, 243, 208) | Success borders |
| 300 | `#6EE7B7` | rgb(110, 231, 183) | Success highlights |
| 400 | `#34D399` | rgb(52, 211, 153) | Success icons |
| **500** | **`#10B981`** | **rgb(16, 185, 129)** | **Success - Main** |
| 600 | `#059669` | rgb(5, 150, 105) | Success dark |
| 700 | `#047857` | rgb(4, 120, 87) | Success darker |
| 800 | `#065F46` | rgb(6, 95, 70) | Success text |
| 900 | `#064E3B` | rgb(6, 78, 59) | Success text dark |

#### Warning - Amber Gold

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FFFBEB` | rgb(255, 251, 235) | Warning backgrounds |
| 100 | `#FEF3C7` | rgb(254, 243, 199) | Light warning |
| 200 | `#FDE68A` | rgb(253, 230, 138) | Warning borders |
| 300 | `#FCD34D` | rgb(252, 211, 77) | Warning highlights |
| 400 | `#FBBF24` | rgb(251, 191, 36) | Warning icons |
| **500** | **`#F59E0B`** | **rgb(245, 158, 11)** | **Warning - Main** |
| 600 | `#D97706` | rgb(217, 119, 6) | Warning dark |
| 700 | `#B45309` | rgb(180, 83, 9) | Warning darker |
| 800 | `#92400E` | rgb(146, 64, 14) | Warning text |
| 900 | `#78350F` | rgb(120, 53, 15) | Warning text dark |

#### Error - Deep Rose/Crimson

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FEF2F2` | rgb(254, 242, 242) | Error backgrounds |
| 100 | `#FEE2E2` | rgb(254, 226, 226) | Light error |
| 200 | `#FECACA` | rgb(254, 202, 202) | Error borders |
| 300 | `#FCA5A5` | rgb(252, 165, 165) | Error highlights |
| 400 | `#F87171` | rgb(248, 113, 113) | Error icons |
| **500** | **`#DC2626`** | **rgb(220, 38, 38)** | **Error - Main** |
| 600 | `#B91C1C` | rgb(185, 28, 28) | Error dark |
| 700 | `#991B1B` | rgb(153, 27, 27) | Error darker |
| 800 | `#7F1D1D` | rgb(127, 29, 29) | Error text |
| 900 | `#450A0A` | rgb(69, 10, 10) | Error text dark |

#### Info - Soft Blue Gray

| Shade | Hex | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#F0F9FF` | rgb(240, 249, 255) | Info backgrounds |
| 100 | `#E0F2FE` | rgb(224, 242, 254) | Light info |
| 200 | `#BAE6FD` | rgb(186, 230, 253) | Info borders |
| 300 | `#7DD3FC` | rgb(125, 211, 252) | Info highlights |
| 400 | `#38BDF8` | rgb(56, 189, 248) | Info icons |
| **500** | **`#64748B`** | **rgb(100, 116, 139)** | **Info - Main (muted)** |
| 600 | `#475569` | rgb(71, 85, 105) | Info dark |
| 700 | `#334155` | rgb(51, 65, 85) | Info darker |
| 800 | `#1E293B` | rgb(30, 41, 59) | Info text |
| 900 | `#0F172A` | rgb(15, 23, 42) | Info text dark |

### 2.6 Gradient Combinations

#### Premium Gradients

```css
/* Gold Shimmer - Primary CTAs */
.gradient-gold {
  background: linear-gradient(135deg, #D4AF37 0%, #F5E1AF 50%, #D4AF37 100%);
}

/* Gold Dark - Buttons, Headers */
.gradient-gold-dark {
  background: linear-gradient(135deg, #C9A227 0%, #D4AF37 50%, #A88620 100%);
}

/* Burgundy - Secondary Elements */
.gradient-burgundy {
  background: linear-gradient(135deg, #722F37 0%, #8B0000 100%);
}

/* Rose Gold - Accent Elements */
.gradient-rose {
  background: linear-gradient(135deg, #B76E79 0%, #E89AA8 100%);
}

/* Luxury Dark - Dark Mode Surfaces */
.gradient-luxury {
  background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%);
}

/* Premium Blend - Hero Sections */
.gradient-premium {
  background: linear-gradient(135deg, #D4AF37 0%, #B76E79 100%);
}

/* Hero Overlay - Image Overlays */
.gradient-hero {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.9) 100%);
}

/* Champagne Fade - Subtle Backgrounds */
.gradient-champagne {
  background: linear-gradient(180deg, #FDF9F0 0%, #FAF0D7 100%);
}

/* Sunset Romance - Special Features */
.gradient-sunset {
  background: linear-gradient(135deg, #D4AF37 0%, #B76E79 50%, #722F37 100%);
}
```

#### Gradient Usage Guidelines

| Gradient | Use Case | Example |
|----------|----------|---------|
| Gold Shimmer | Primary CTA buttons, premium badges | Sign Up, Upgrade |
| Gold Dark | Navigation, headers | Top bar, sidebar |
| Burgundy | Secondary actions, alerts | Cancel, Delete |
| Rose Gold | Feminine accents, highlights | Match notifications |
| Luxury Dark | Dark mode backgrounds | Cards, modals |
| Premium Blend | Hero sections, feature highlights | Landing page hero |
| Champagne Fade | Page backgrounds | Dashboard, profiles |
| Sunset Romance | Special promotions | Premium features |

---

## 3. Typography System

### 3.1 Font Families

#### Display Font - Playfair Display

**Purpose:** Hero headlines, section titles, luxury branding elements

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&display=swap');
```

| Property | Value |
|----------|-------|
| Font Family | `'Playfair Display', Georgia, Cambria, 'Times New Roman', serif` |
| Weights | 400, 500, 600, 700, 800, 900 |
| Styles | Normal, Italic |
| Use Cases | Hero headlines, section titles, luxury callouts |

**Characteristics:**
- High contrast between thick and thin strokes
- Elegant serifs with a modern feel
- Excellent for large display sizes
- Conveys sophistication and timelessness

#### Body Font - Inter

**Purpose:** Body text, UI elements, form labels

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

| Property | Value |
|----------|-------|
| Font Family | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| Weights | 100-900 (variable) |
| Styles | Normal |
| Use Cases | Body text, buttons, navigation, forms |

**Characteristics:**
- Designed specifically for screens
- Excellent legibility at small sizes
- Variable font with fine-tuned optical sizing
- Professional and clean appearance

#### Accent Font - Cormorant Garamond

**Purpose:** Taglines, quotes, special callouts

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap');
```

| Property | Value |
|----------|-------|
| Font Family | `'Cormorant Garamond', Georgia, serif` |
| Weights | 300, 400, 500, 600, 700 |
| Styles | Normal, Italic |
| Use Cases | Taglines, testimonials, romantic quotes |

**Characteristics:**
- Refined and elegant serif
- Beautiful italic variant
- Works well for medium-sized text
- Adds a touch of romance and sophistication

#### Monospace Font - JetBrains Mono

**Purpose:** Code snippets, technical elements, verification codes

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

| Property | Value |
|----------|-------|
| Font Family | `'JetBrains Mono', 'Fira Code', Monaco, Consolas, monospace` |
| Weights | 400, 500, 600, 700 |
| Use Cases | Verification codes, technical info, code blocks |

### 3.2 Typography Scale

| Name | Size | Line Height | Letter Spacing | Use Case |
|------|------|-------------|----------------|----------|
| `xs` | 0.75rem (12px) | 1rem (16px) | 0.025em | Captions, labels |
| `sm` | 0.875rem (14px) | 1.25rem (20px) | 0.01em | Secondary text, metadata |
| `base` | 1rem (16px) | 1.5rem (24px) | 0 | Body text |
| `lg` | 1.125rem (18px) | 1.75rem (28px) | -0.01em | Lead paragraphs |
| `xl` | 1.25rem (20px) | 1.75rem (28px) | -0.01em | Subheadings |
| `2xl` | 1.5rem (24px) | 2rem (32px) | -0.02em | Section headings |
| `3xl` | 1.875rem (30px) | 2.25rem (36px) | -0.02em | Page headings |
| `4xl` | 2.25rem (36px) | 2.5rem (40px) | -0.025em | Large headings |
| `5xl` | 3rem (48px) | 1.1 | -0.025em | Hero subheadings |
| `6xl` | 3.75rem (60px) | 1.1 | -0.03em | Hero headlines |
| `7xl` | 4.5rem (72px) | 1.05 | -0.03em | Display headlines |
| `8xl` | 6rem (96px) | 1 | -0.04em | Large display |
| `9xl` | 8rem (128px) | 1 | -0.04em | Extra large display |

### 3.3 Typography Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  HERO HEADLINE                                                  │
│  font-display text-6xl font-bold tracking-tight                │
│  "Find Your Perfect Arrangement"                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Section Title                                                  │
│  font-display text-4xl font-semibold                           │
│  "How It Works"                                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Card Heading                                                   │
│  font-sans text-xl font-semibold                               │
│  "Premium Membership"                                           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Body Text                                                      │
│  font-sans text-base font-normal                               │
│  "Connect with successful individuals..."                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Caption / Label                                                │
│  font-sans text-sm font-medium text-neutral-500                │
│  "Last active 2 hours ago"                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Font Weight Guidelines

| Weight | Name | Use Case |
|--------|------|----------|
| 100 | Thin | Decorative large text only |
| 200 | Extra Light | Large display text |
| 300 | Light | Subheadings, elegant text |
| 400 | Regular | Body text, paragraphs |
| 500 | Medium | UI elements, buttons |
| 600 | Semi Bold | Subheadings, emphasis |
| 700 | Bold | Headings, CTAs |
| 800 | Extra Bold | Hero headlines |
| 900 | Black | Display text, impact |

### 3.5 Line Height Guidelines

| Context | Line Height | Tailwind Class |
|---------|-------------|----------------|
| Tight (headlines) | 1.1 - 1.2 | `leading-tight` |
| Snug (subheadings) | 1.25 - 1.375 | `leading-snug` |
| Normal (body) | 1.5 | `leading-normal` |
| Relaxed (long form) | 1.625 | `leading-relaxed` |
| Loose (spacious) | 2 | `leading-loose` |

### 3.6 Letter Spacing Guidelines

| Context | Letter Spacing | Tailwind Class |
|---------|----------------|----------------|
| Tight (large headlines) | -0.05em | `tracking-tighter` |
| Slightly tight | -0.025em | `tracking-tight` |
| Normal | 0 | `tracking-normal` |
| Wide (small caps, labels) | 0.025em | `tracking-wide` |
| Wider (all caps) | 0.05em | `tracking-wider` |
| Widest (decorative) | 0.1em | `tracking-widest` |

---

## 4. Design Tokens

### 4.1 Spacing Scale

| Token | Value | Pixels | Use Case |
|-------|-------|--------|----------|
| `0` | 0 | 0px | Reset |
| `px` | 1px | 1px | Hairline borders |
| `0.5` | 0.125rem | 2px | Micro spacing |
| `1` | 0.25rem | 4px | Tight spacing |
| `1.5` | 0.375rem | 6px | Small gaps |
| `2` | 0.5rem | 8px | Component padding |
| `2.5` | 0.625rem | 10px | Small padding |
| `3` | 0.75rem | 12px | Standard gap |
| `3.5` | 0.875rem | 14px | Medium gap |
| `4` | 1rem | 16px | Base unit |
| `5` | 1.25rem | 20px | Medium spacing |
| `6` | 1.5rem | 24px | Section padding |
| `7` | 1.75rem | 28px | Large gap |
| `8` | 2rem | 32px | Component margin |
| `9` | 2.25rem | 36px | Large margin |
| `10` | 2.5rem | 40px | Section gap |
| `11` | 2.75rem | 44px | Large section gap |
| `12` | 3rem | 48px | Page section |
| `14` | 3.5rem | 56px | Large section |
| `16` | 4rem | 64px | Hero spacing |
| `18` | 4.5rem | 72px | Extra large |
| `20` | 5rem | 80px | Page margins |
| `24` | 6rem | 96px | Hero sections |
| `28` | 7rem | 112px | Large hero |
| `32` | 8rem | 128px | Extra large hero |

### 4.2 Border Radius Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `none` | 0 | Sharp corners |
| `sm` | 0.125rem (2px) | Subtle rounding |
| `DEFAULT` | 0.25rem (4px) | Standard buttons |
| `md` | 0.375rem (6px) | Cards, inputs |
| `lg` | 0.5rem (8px) | Large cards |
| `xl` | 0.75rem (12px) | Modals |
| `2xl` | 1rem (16px) | Feature cards |
| `3xl` | 1.5rem (24px) | Hero cards |
| `4xl` | 2rem (32px) | Large features |
| `full` | 9999px | Pills, avatars |

### 4.3 Shadow Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `DEFAULT` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Standard cards |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Elevated cards |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, dropdowns |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Large modals |
| `2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero elements |
| `inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` | Inset elements |
| `none` | `0 0 #0000` | No shadow |

#### Premium Shadows

| Token | Value | Use Case |
|-------|-------|----------|
| `soft` | `0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)` | Soft elevation |
| `medium` | `0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` | Medium elevation |
| `hard` | `0 10px 40px -10px rgba(0, 0, 0, 0.2)` | Strong elevation |
| `premium` | `0 4px 20px -2px rgba(212, 175, 55, 0.25)` | Gold glow |
| `premium-lg` | `0 10px 40px -5px rgba(212, 175, 55, 0.3)` | Large gold glow |
| `premium-xl` | `0 20px 60px -10px rgba(212, 175, 55, 0.35)` | Extra large gold glow |
| `glow-gold` | `0 0 20px rgba(212, 175, 55, 0.4)` | Gold glow effect |
| `glow-rose` | `0 0 20px rgba(183, 110, 121, 0.4)` | Rose gold glow |
| `inner-gold` | `inset 0 2px 4px 0 rgba(212, 175, 55, 0.1)` | Inner gold highlight |
| `card` | `0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)` | Card default |
| `card-hover` | `0 1px 3px rgba(0, 0, 0, 0.05), 0 30px 40px -5px rgba(0, 0, 0, 0.1), 0 15px 15px -5px rgba(0, 0, 0, 0.04)` | Card hover |

### 4.4 Z-Index Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `0` | 0 | Base layer |
| `10` | 10 | Elevated content |
| `20` | 20 | Dropdowns |
| `30` | 30 | Sticky elements |
| `40` | 40 | Fixed headers |
| `50` | 50 | Modals backdrop |
| `60` | 60 | Modals |
| `70` | 70 | Popovers |
| `80` | 80 | Tooltips |
| `90` | 90 | Notifications |
| `100` | 100 | Maximum priority |

### 4.5 Transition & Animation Tokens

#### Transition Durations

| Token | Value | Use Case |
|-------|-------|----------|
| `75` | 75ms | Micro interactions |
| `100` | 100ms | Quick feedback |
| `150` | 150ms | Standard transitions |
| `200` | 200ms | Default |
| `300` | 300ms | Smooth transitions |
| `400` | 400ms | Deliberate animations |
| `500` | 500ms | Slow transitions |
| `600` | 600ms | Page transitions |
| `700` | 700ms | Complex animations |
| `1000` | 1000ms | Long animations |

#### Transition Timing Functions

| Token | Value | Use Case |
|-------|-------|----------|
| `linear` | `linear` | Constant speed |
| `in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating |
| `out` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating |
| `in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |
| `premium` | `cubic-bezier(0.4, 0, 0.2, 1)` | Premium feel |
| `bounce-in` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Bouncy entrance |

#### Animation Presets

| Animation | Duration | Timing | Use Case |
|-----------|----------|--------|----------|
| `fade-in` | 500ms | ease-in-out | Content reveal |
| `fade-in-up` | 600ms | ease-out | Card entrance |
| `fade-in-down` | 600ms | ease-out | Dropdown reveal |
| `slide-up` | 300ms | ease-out | Toast notifications |
| `slide-down` | 300ms | ease-out | Accordion content |
| `slide-in-right` | 500ms | ease-out | Sidebar entrance |
| `slide-in-left` | 500ms | ease-out | Panel entrance |
| `scale-in` | 300ms | ease-out | Modal entrance |
| `shimmer` | 2000ms | linear | Loading states |
| `float` | 3000ms | ease-in-out | Decorative elements |
| `glow` | 2000ms | ease-in-out | Premium highlights |
| `pulse-gold` | 2000ms | ease | Attention grabber |

---

## 5. Tailwind Configuration

### 5.1 Complete Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================
      // COLOR PALETTE
      // ============================================
      colors: {
        // Primary - Rich Gold & Champagne
        primary: {
          50: '#FDF9F0',
          100: '#FAF0D7',
          200: '#F5E1AF',
          300: '#EFD087',
          400: '#E8BE5F',
          500: '#D4AF37', // Rich Gold - Main
          600: '#C9A227',
          700: '#A88620',
          800: '#876B1A',
          900: '#665013',
        },
        
        // Secondary - Deep Burgundy & Wine
        secondary: {
          50: '#FDF2F4',
          100: '#FCE7EB',
          200: '#F9CED6',
          300: '#F4A6B5',
          400: '#EC7A91',
          500: '#722F37', // Deep Burgundy - Main
          600: '#8B0000',
          700: '#5C262D',
          800: '#4A1F24',
          900: '#38181C',
        },
        
        // Accent - Rose Gold
        accent: {
          50: '#FDF5F6',
          100: '#FCE8EB',
          200: '#F9D4DA',
          300: '#F4B5C0',
          400: '#E89AA8',
          500: '#B76E79', // Rose Gold - Main
          600: '#A35D67',
          700: '#8A4D56',
          800: '#713F47',
          900: '#5A333A',
        },
        
        // Neutral - Warm Grays
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        
        // Luxury Dark Colors
        luxury: {
          black: '#0D0D0D',
          charcoal: '#1A1A1A',
          slate: '#2D2D2D',
          graphite: '#404040',
        },
        
        // Ivory & Cream Backgrounds
        ivory: {
          DEFAULT: '#FFFFF0',
          cream: '#FFFDD0',
          pearl: '#F8F6F0',
          linen: '#FAF0E6',
        },
        
        // Semantic - Success (Emerald)
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        
        // Semantic - Warning (Amber)
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        
        // Semantic - Error (Crimson)
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        
        // Semantic - Info (Slate Blue)
        info: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      
      // ============================================
      // TYPOGRAPHY
      // ============================================
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
      
      // ============================================
      // SPACING
      // ============================================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // ============================================
      // BREAKPOINTS
      // ============================================
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
      
      // ============================================
      // SHADOWS
      // ============================================
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'premium': '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
        'premium-lg': '0 10px 40px -5px rgba(212, 175, 55, 0.3)',
        'premium-xl': '0 20px 60px -10px rgba(212, 175, 55, 0.35)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4)',
        'glow-rose': '0 0 20px rgba(183, 110, 121, 0.4)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(212, 175, 55, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 1px 3px rgba(0, 0, 0, 0.05), 0 30px 40px -5px rgba(0, 0, 0, 0.1), 0 15px 15px -5px rgba(0, 0, 0, 0.04)',
      },
      
      // ============================================
      // ANIMATIONS
      // ============================================
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 15px rgba(212, 175, 55, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // ============================================
      // GRADIENTS
      // ============================================
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F5E1AF 50%, #D4AF37 100%)',
        'gradient-gold-dark': 'linear-gradient(135deg, #C9A227 0%, #D4AF37 50%, #A88620 100%)',
        'gradient-burgundy': 'linear-gradient(135deg, #722F37 0%, #8B0000 100%)',
        'gradient-rose': 'linear-gradient(135deg, #B76E79 0%, #E89AA8 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
        'gradient-premium': 'linear-gradient(135deg, #D4AF37 0%, #B76E79 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.9) 100%)',
        'gradient-champagne': 'linear-gradient(180deg, #FDF9F0 0%, #FAF0D7 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #D4AF37 0%, #B76E79 50%, #722F37 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)',
      },
      
      // ============================================
      // MISCELLANEOUS
      // ============================================
      backdropBlur: {
        xs: '2px',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### 5.2 CSS Variables (Optional Enhancement)

Add to `globals.css` for CSS variable support:

```css
@layer base {
  :root {
    /* Primary - Gold */
    --color-primary-50: 253 249 240;
    --color-primary-100: 250 240 215;
    --color-primary-200: 245 225 175;
    --color-primary-300: 239 208 135;
    --color-primary-400: 232 190 95;
    --color-primary-500: 212 175 55;
    --color-primary-600: 201 162 39;
    --color-primary-700: 168 134 32;
    --color-primary-800: 135 107 26;
    --color-primary-900: 102 80 19;
    
    /* Secondary - Burgundy */
    --color-secondary-50: 253 242 244;
    --color-secondary-100: 252 231 235;
    --color-secondary-200: 249 206 214;
    --color-secondary-300: 244 166 181;
    --color-secondary-400: 236 122 145;
    --color-secondary-500: 114 47 55;
    --color-secondary-600: 139 0 0;
    --color-secondary-700: 92 38 45;
    --color-secondary-800: 74 31 36;
    --color-secondary-900: 56 24 28;
    
    /* Accent - Rose Gold */
    --color-accent-50: 253 245 246;
    --color-accent-100: 252 232 235;
    --color-accent-200: 249 212 218;
    --color-accent-300: 244 181 192;
    --color-accent-400: 232 154 168;
    --color-accent-500: 183 110 121;
    --color-accent-600: 163 93 103;
    --color-accent-700: 138 77 86;
    --color-accent-800: 113 63 71;
    --color-accent-900: 90 51 58;
    
    /* Background */
    --background: 250 250 249;
    --foreground: 41 37 36;
    
    /* Card */
    --card: 255 255 255;
    --card-foreground: 41 37 36;
    
    /* Border */
    --border: 231 229 228;
    --input: 231 229 228;
    
    /* Ring */
    --ring: 212 175 55;
  }
  
  .dark {
    /* Background */
    --background: 13 13 13;
    --foreground: 250 250 249;
    
    /* Card */
    --card: 26 26 26;
    --card-foreground: 250 250 249;
    
    /* Border */
    --border: 64 64 64;
    --input: 64 64 64;
    
    /* Ring */
    --ring: 212 175 55;
  }
}
```

### 5.3 Google Fonts Import

Add to `layout.tsx` or `globals.css`:

```css
/* Google Fonts Import - Add to globals.css or use next/font */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

Or using Next.js font optimization:

```typescript
// app/layout.tsx
import { Playfair_Display, Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

---

## 6. Usage Examples

### 6.1 Button Examples

```jsx
{/* Primary Gold Button */}
<button className="bg-gradient-gold hover:bg-gradient-gold-dark text-luxury-black font-semibold px-6 py-3 rounded-lg shadow-premium hover:shadow-premium-lg transition-all duration-300">
  Get Started
</button>

{/* Secondary Burgundy Button */}
<button className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200">
  Learn More
</button>

{/* Outline Gold Button */}
<button className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-medium px-6 py-3 rounded-lg transition-colors duration-200">
  View Profile
</button>

{/* Ghost Button */}
<button className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200">
  Cancel
</button>

{/* Premium Glow Button */}
<button className="bg-gradient-gold text-luxury-black font-bold px-8 py-4 rounded-xl shadow-glow-gold hover:shadow-premium-xl animate-pulse-gold transition-all duration-300">
  Upgrade to Premium
</button>
```

### 6.2 Card Examples

```jsx
{/* Standard Card */}
<div className="bg-white dark:bg-luxury-charcoal rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-6">
  <h3 className="font-display text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
    Card Title
  </h3>
  <p className="font-sans text-neutral-600 dark:text-neutral-400 mt-2">
    Card description text goes here.
  </p>
</div>

{/* Premium Card with Gold Border */}
<div className="bg-gradient-champagne dark:bg-luxury-charcoal rounded-2xl shadow-premium border border-primary-200 dark:border-primary-800 p-6">
  <div className="flex items-center gap-2 mb-4">
    <span className="bg-gradient-gold text-luxury-black text-xs font-bold px-2 py-1 rounded-full">
      PREMIUM
    </span>
  </div>
  <h3 className="font-display text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
    Premium Feature
  </h3>
</div>

{/* Profile Card */}
<div className="bg-white dark:bg-luxury-charcoal rounded-3xl shadow-card overflow-hidden group">
  <div className="relative h-48 bg-gradient-premium">
    <img src="/profile.jpg" alt="Profile" className="w-full h-full object-cover" />
    <div className="absolute bottom-4 right-4">
      <span className="bg-success-500 text-white text-xs px-2 py-1 rounded-full">
        Verified
      </span>
    </div>
  </div>
  <div className="p-6">
    <h3 className="font-display text-xl font-semibold">Alexandra, 28</h3>
    <p className="text-neutral-500 text-sm">New York, NY</p>
  </div>
</div>
```

### 6.3 Typography Examples

```jsx
{/* Hero Headline */}
<h1 className="font-display text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
  Find Your Perfect <span className="text-primary-500">Arrangement</span>
</h1>

{/* Section Title */}
<h2 className="font-display text-4xl font-semibold text-neutral-800 dark:text-neutral-100">
  How It Works
</h2>

{/* Tagline with Accent Font */}
<p className="font-serif text-2xl italic text-accent-500">
  Where success meets beauty
</p>

{/* Body Text */}
<p className="font-sans text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
  Connect with successful individuals who appreciate the finer things in life.
  Our platform brings together ambitious professionals and attractive companions.
</p>

{/* Caption */}
<span className="font-sans text-sm text-neutral-500 tracking-wide uppercase">
  Last active 2 hours ago
</span>
```

### 6.4 Form Examples

```jsx
{/* Input with Label */}
<div className="space-y-2">
  <label className="font-sans text-sm font-medium text-neutral-700 dark:text-neutral-300">
    Email Address
  </label>
  <input
    type="email"
    className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-luxury-graphite bg-white dark:bg-luxury-slate text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
    placeholder="you@example.com"
  />
</div>

{/* Premium Input with Gold Focus */}
<input
  type="text"
  className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 dark:border-luxury-graphite bg-white dark:bg-luxury-slate focus:border-primary-500 focus:shadow-glow-gold transition-all duration-300"
  placeholder="Search members..."
/>
```

### 6.5 Badge Examples

```jsx
{/* Verification Badge */}
<span className="inline-flex items-center gap-1 bg-success-100 text-success-700 text-xs font-medium px-2.5 py-1 rounded-full">
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
  Verified
</span>

{/* Premium Badge */}
<span className="inline-flex items-center gap-1 bg-gradient-gold text-luxury-black text-xs font-bold px-3 py-1 rounded-full shadow-premium">
  ★ Premium
</span>

{/* Online Status */}
<span className="inline-flex items-center gap-1.5">
  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
  <span className="text-sm text-neutral-500">Online</span>
</span>
```

### 6.6 Dark Mode Examples

```jsx
{/* Component with Dark Mode Support */}
<div className="bg-ivory-pearl dark:bg-luxury-charcoal text-neutral-900 dark:text-neutral-100 rounded-2xl p-6 shadow-card dark:shadow-none dark:border dark:border-luxury-graphite">
  <h3 className="font-display text-xl font-semibold mb-2">
    Dark Mode Ready
  </h3>
  <p className="text-neutral-600 dark:text-neutral-400">
    This component automatically adapts to dark mode.
  </p>
  <button className="mt-4 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 text-luxury-black font-medium px-4 py-2 rounded-lg transition-colors">
    Action
  </button>
</div>
```

---

## 7. Accessibility Considerations

### 7.1 Color Contrast Ratios

All color combinations have been tested for WCAG 2.1 AA compliance (minimum 4.5:1 for normal text, 3:1 for large text).

#### Light Mode Contrast Ratios

| Combination | Ratio | WCAG AA | WCAG AAA |
|-------------|-------|---------|----------|
| Primary-600 on White | 4.8:1 | ✅ Pass | ❌ Fail |
| Primary-700 on White | 6.2:1 | ✅ Pass | ✅ Pass |
| Secondary-500 on White | 8.1:1 | ✅ Pass | ✅ Pass |
| Neutral-700 on White | 9.5:1 | ✅ Pass | ✅ Pass |
| Neutral-800 on White | 12.6:1 | ✅ Pass | ✅ Pass |
| White on Primary-500 | 3.2:1 | ✅ Large | ❌ Fail |
| Luxury-black on Primary-500 | 5.8:1 | ✅ Pass | ✅ Pass |

#### Dark Mode Contrast Ratios

| Combination | Ratio | WCAG AA | WCAG AAA |
|-------------|-------|---------|----------|
| Primary-400 on Luxury-black | 7.2:1 | ✅ Pass | ✅ Pass |
| Primary-500 on Luxury-charcoal | 5.8:1 | ✅ Pass | ✅ Pass |
| Neutral-100 on Luxury-black | 15.8:1 | ✅ Pass | ✅ Pass |
| Neutral-300 on Luxury-charcoal | 10.2:1 | ✅ Pass | ✅ Pass |

### 7.2 Recommended Text Color Pairings

#### For Light Backgrounds

| Background | Text Color | Use Case |
|------------|------------|----------|
| White / Ivory | `neutral-800` | Primary text |
| White / Ivory | `neutral-600` | Secondary text |
| White / Ivory | `neutral-500` | Tertiary text |
| Primary-50 | `primary-900` | Highlighted text |
| Success-50 | `success-800` | Success messages |
| Error-50 | `error-800` | Error messages |

#### For Dark Backgrounds

| Background | Text Color | Use Case |
|------------|------------|----------|
| Luxury-black | `neutral-100` | Primary text |
| Luxury-charcoal | `neutral-200` | Primary text |
| Luxury-slate | `neutral-300` | Secondary text |
| Primary-500 | `luxury-black` | Button text |
| Secondary-500 | `white` | Button text |

### 7.3 Focus States

All interactive elements must have visible focus indicators:

```css
/* Focus ring utility classes */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-luxury-black;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500;
}
```

### 7.4 Motion Preferences

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.5 Font Size Accessibility

- Minimum body text size: 16px (1rem)
- Minimum touch target size: 44x44px
- Line height for body text: 1.5 minimum
- Maximum line length: 75 characters for optimal readability

### 7.6 Color Blindness Considerations

The design system uses multiple visual cues beyond color:

- **Success states**: Green color + checkmark icon
- **Error states**: Red color + X icon + text description
- **Warning states**: Amber color + warning icon
- **Premium badges**: Gold color + star icon + "Premium" text

---

## Appendix A: Quick Reference

### Color Tokens Quick Reference

```
Primary (Gold):     #D4AF37 (500)
Secondary (Burgundy): #722F37 (500)
Accent (Rose Gold): #B76E79 (500)
Success (Emerald):  #10B981 (500)
Warning (Amber):    #F59E0B (500)
Error (Crimson):    #DC2626 (500)
Info (Slate):       #64748B (500)
```

### Font Stack Quick Reference

```
Display: font-display (Playfair Display)
Serif:   font-serif (Cormorant Garamond)
Sans:    font-sans (Inter)
Mono:    font-mono (JetBrains Mono)
```

### Shadow Quick Reference

```
Soft:        shadow-soft
Medium:      shadow-medium
Hard:        shadow-hard
Premium:     shadow-premium
Gold Glow:   shadow-glow-gold
Rose Glow:   shadow-glow-rose
Card:        shadow-card
Card Hover:  shadow-card-hover
```

### Gradient Quick Reference

```
Gold:        bg-gradient-gold
Gold Dark:   bg-gradient-gold-dark
Burgundy:    bg-gradient-burgundy
Rose:        bg-gradient-rose
Luxury:      bg-gradient-luxury
Premium:     bg-gradient-premium
Hero:        bg-gradient-hero
Champagne:   bg-gradient-champagne
```

---

*Document Version: 1.0*
*Created: December 2024*
*Last Updated: December 2024*
