---
name: Tricity Trust System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#404845'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#717975'
  outline-variant: '#c0c8c4'
  surface-tint: '#3a675a'
  primary: '#134237'
  on-primary: '#ffffff'
  primary-container: '#2d5a4e'
  on-primary-container: '#a0cfc0'
  inverse-primary: '#a1d0c1'
  secondary: '#7b5455'
  on-secondary: '#ffffff'
  secondary-container: '#fecbcb'
  on-secondary-container: '#7a5354'
  tertiary: '#323e3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#495553'
  on-tertiary-container: '#bcc9c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bceddd'
  primary-fixed-dim: '#a1d0c1'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#214e43'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#ecbaba'
  on-secondary-fixed: '#2f1314'
  on-secondary-fixed-variant: '#613d3e'
  tertiary-fixed: '#d8e5e2'
  tertiary-fixed-dim: '#bcc9c6'
  on-tertiary-fixed: '#121e1c'
  on-tertiary-fixed-variant: '#3d4947'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system embodies a fusion of Scandinavian Functionalism and Swiss Graphic Design. The brand personality is serene, authoritative, and meticulously organized, targeting a sophisticated user base that values clarity over decoration. 

The aesthetic leverages high-end minimalism—utilizing intentional white space, a structured grid, and refined material effects. By combining the warmth of Scandinavian tones with the cold precision of Swiss layout principles, the UI evokes an emotional response of "structured tranquility." Every element serves a functional purpose, stripped of unnecessary ornamentation to highlight content and hierarchy.

## Colors
The palette is centered on a "Sophisticated Organic" theme. The primary **Sage Green** (#2D5A4E) provides a grounded, professional anchor used for key actions and branding. The **Dusty Rose** (#F4C2C2) acts as a soft counterpoint, used sparingly for highlights or secondary accents to prevent the UI from feeling overly clinical.

The background uses a **Soft Pearl** (#F9F9F9) to provide an airy, high-contrast canvas for typography. Neutral tones are derived from the Sage primary to ensure a cohesive, tonal gray scale that feels natural rather than purely digital.

## Typography
Following Swiss Graphic Design traditions, typography is the primary driver of hierarchy. **Plus Jakarta Sans** is utilized for its modern geometric clarity. 

- **Headlines:** Use heavy weights and tight tracking to create impactful, block-like visual anchors.
- **Body Text:** Set with generous line heights (1.6x) to ensure maximum readability and "breathability."
- **Labels:** Small-scale labels use uppercase styling with increased letter spacing (0.1em) to differentiate functional metadata from narrative content.
- **The Grid:** All type must align to an 8px baseline grid to maintain a rigorous rhythmic structure across the vertical axis.

## Layout & Spacing
The layout adheres to a strict 12-column Swiss Grid. Precision and alignment are non-negotiable. 

- **Desktop:** A fixed-width central container (1280px) with wide 64px margins creates a premium, gallery-like feel.
- **Rhythm:** Use an 8px base unit for all padding and margins. Vertical rhythm is prioritized; section spacing should be aggressive (e.g., 80px, 120px, 160px) to define clear boundaries without the need for heavy dividers.
- **Adaptation:** On mobile, columns collapse to a single stack, and margins tighten to 20px, but the generous vertical whitespace remains to preserve the minimalist brand identity.

## Elevation & Depth
Depth is achieved through "Glassmorphism" and subtle atmospheric shadows rather than heavy layering.

- **Glassmorphism:** Secondary containers and floating panels use a high-refraction backdrop blur (20px-30px) and a semi-transparent white fill (opacity 60-80%). This allows the soft background colors to bleed through, maintaining an "airy" quality.
- **Shadows:** Use a single, large-radius shadow for elevated components (e.g., Blur: 40px, Offset-Y: 10px, Color: Sage Green at 5% opacity). Shadows should feel like ambient light rather than a hard drop.
- **Borders:** All cards and interactive elements are defined by a precise 1px border in a lightened version of the Sage primary or a soft silver.

## Shapes
The shape language balances the rigidity of the grid with the softness of Scandinavian design. Standard components use a 0.5rem (8px) radius. For larger Glassmorphic cards or hero sections, use the `rounded-xl` (1.5rem) setting to introduce a more organic, modern architectural feel. 

Interactive elements like checkboxes retain a smaller, sharper radius (4px) to signal precision and utility.

## Components
- **Buttons:** Primary buttons are solid Sage Green with white text, no icons unless necessary. Secondary buttons use a Dusty Rose tint or a simple 1px border with high letter-spaced labels.
- **Glass Cards:** The signature component. Background-blur (30px), 1px stroke (#E0E5E4), and generous internal padding (32px).
- **Inputs:** Minimalist bottom-border-only or very light 1px frames. Focus states should transition the border to Sage Green with no "glow" effect, only a subtle weight increase.
- **Chips/Tags:** Use the Dusty Rose color at 15% opacity with dark text for a sophisticated "muted highlight" look.
- **Lists:** Separated by thin 1px lines that do not span the full width of the container, emphasizing the Swiss "hanging" layout style.
- **Data Visuals:** Use Sage and Rose in high-contrast pairings against the Soft Pearl background. Lines should be thin (1.5pt) and geometric.