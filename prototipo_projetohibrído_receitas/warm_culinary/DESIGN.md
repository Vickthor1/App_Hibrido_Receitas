---
name: Gourmet Hub
colors:
  surface: '#f8f9ff'
  surface-dim: '#d3dae9'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff3ff'
  surface-container: '#e7eefd'
  surface-container-high: '#e2e8f7'
  surface-container-highest: '#dce3f2'
  on-surface: '#151c26'
  on-surface-variant: '#59413a'
  inverse-surface: '#2a313c'
  inverse-on-surface: '#ebf1ff'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ab3500'
  primary: '#832600'
  on-primary: '#ffffff'
  primary-container: '#ff6b35'
  on-primary-container: '#5f1900'
  inverse-primary: '#ffb59d'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfe3'
  on-secondary-container: '#616265'
  tertiary: '#444748'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c5f60'
  on-tertiary-container: '#d7d9da'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832700'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#45474a'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#444748'
  background: '#f8f9ff'
  on-background: '#151c26'
  surface-variant: '#dce3f2'
  warm-surface: '#f8f9ff'
  outline-warm: '#8d7168'
typography:
  headline-xl:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 32px
---

## Brand & Style
The brand personality is **warm, appetizing, and approachable**, designed for home cooks who value both inspiration and efficiency. It utilizes a **Modern-Tactile** aesthetic that blends Material Design 3 logic with rich, high-fidelity imagery. 

The visual style focuses on "food-first" presentation, using a warm color palette to evoke comfort. Elements are clearly defined through soft shadows and subtle container nesting, creating a sense of organized abundance. The interface avoids clinical coldness by using rounded shapes and organic transitions, making the digital experience feel as inviting as a well-kept kitchen.

## Colors
The palette is centered around a rich **Paprika Orange** (#ab3500) as the primary brand color, used for high-emphasis actions and key branding elements. This is supported by a vibrant **Terracotta Container** (#ff6b35) which provides warmth and visibility.

The background system uses a **Cool-Tinted Neutral** (#f8f9ff) to ensure the warm food photography "pops" without the overall interface feeling muddy. Grayscale values are slightly desaturated to maintain a professional, clean look (Secondary and Tertiary tones). Contrast is maintained through deep "On-Surface" colors (#151c26) to ensure high legibility for recipe instructions and ingredient lists.

## Typography
We use **Be Vietnam Pro** exclusively to provide a contemporary, friendly, and highly legible experience. 

- **Headlines:** Use bold weights (700) with slight negative letter-spacing for large displays to create a tight, editorial feel. 
- **Body:** Standardized at 14px for density, ensuring users can see more content without excessive scrolling. 
- **Labels:** Small caps or increased letter spacing (0.05em) are used for metadata like "Recipe of the Day" tags to distinguish them from interactive labels.

## Layout & Spacing
The system uses a **Fixed Grid** approach for desktop (max-width 1280px) and a **Fluid Content** model for mobile devices.

- **Mobile:** Uses a 20px page margin with a 16px gutter between elements. Navigation is anchored to a bottom bar for thumb-driven ergonomics.
- **Desktop:** Utilizes a fixed 320px (80 units) left-hand navigation drawer. Content is centered with generous vertical stacking (24px to 32px) to prevent visual clutter.
- **Rhythm:** Spacing follows an 8px base unit. Consistent use of `stack-md` (16px) for internal component spacing and `stack-lg` (24px) for section headers creates a predictable vertical hierarchy.

## Elevation & Depth
Depth is established through **Ambient Shadows** and **Tonal Layering**. 

1.  **Low Elevation (Surface-Lowest):** The main background.
2.  **Mid Elevation (Cards):** Uses a very soft, diffused shadow `0px 4px 20px rgba(0,0,0,0.05)` and a subtle `1px` border in `surface-variant`.
3.  **High Elevation (Navigation/Modals):** Drawers and bottom bars use a more pronounced shadow to indicate they exist on a separate plane from the content canvas.
4.  **Interaction:** Elements should transition their shadow intensity or border color (`primary`) on hover to provide clear tactile feedback.

## Shapes
The design uses a **High-Rounded** language to appear friendly and safe.

- **Cards & Hero Sections:** 16px (1rem) corner radius for large containers.
- **Buttons & Inputs:** Full pill-shape (9999px) for primary actions and search bars to maximize "tappability" perception.
- **Category Icons:** 16px (1rem) rounded squares, providing a structured but soft grid of options.
- **Tags:** Small pill-shaped containers for status indicators and labels.

## Components
- **Buttons:** Primary buttons are pill-shaped, using `primary` background with `on-primary` text. Icon-only buttons (like filter) use a `rounded-lg` (8px) shape to differentiate them from main navigation actions.
- **Inputs:** Search bars are pill-shaped with a surface-container-lowest fill and a distinct leading icon.
- **Cards:** Feature two variants: 
    1. **Vertical (Standard):** Image on top with a 1:1 aspect ratio, title and metadata below.
    2. **Horizontal (Quick-view):** Fixed-size square thumbnail (80-96px) on the left with text content to the right.
- **Navigation:**
    - **Mobile:** Bottom bar with a central floating action button (FAB) for "Add Recipe" functionality.
    - **Desktop:** Vertical drawer with pill-shaped active states for menu items.
- **Chips/Tags:** Small uppercase labels with high letter spacing, used over images or inside cards to denote categories or ratings.