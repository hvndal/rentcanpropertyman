/**
 * RentCan — shared Tailwind config (brand palette).
 * Load after https://cdn.tailwindcss.com on app + marketing pages.
 */
try {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#6B4822',
          'on-primary': '#ffffff',
          'primary-container': '#32261C',
          'on-primary-container': '#FFFCFB',
          'primary-fixed': '#CFDFDE',
          'primary-fixed-dim': '#b8d4d2',
          'on-primary-fixed': '#32261C',
          'on-primary-fixed-variant': '#6B4822',
          secondary: '#F6CFDE',
          'on-secondary': '#32261C',
          'secondary-container': '#F6CFDE',
          'on-secondary-container': '#32261C',
          'secondary-fixed': '#F6CFDE',
          'secondary-fixed-dim': '#e8b8c8',
          'on-secondary-fixed': '#32261C',
          'on-secondary-fixed-variant': '#6B4822',
          tertiary: '#D5B259',
          'on-tertiary': '#32261C',
          'tertiary-container': '#c9a44d',
          'on-tertiary-container': '#32261C',
          'tertiary-fixed': '#D5B259',
          'tertiary-fixed-dim': '#c4a050',
          'on-tertiary-fixed': '#32261C',
          'on-tertiary-fixed-variant': '#6B4822',
          background: '#FFFCFB',
          'on-background': '#32261C',
          surface: '#FFFCFB',
          'surface-dim': '#f0ebe8',
          'surface-bright': '#ffffff',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#faf8f7',
          'surface-container': '#f5f2f0',
          'surface-container-high': '#ebe6e3',
          'surface-container-highest': '#e0dad6',
          'surface-variant': '#e8f0ef',
          'surface-tint': '#6B4822',
          'on-surface': '#32261C',
          'on-surface-variant': '#5c4a3a',
          outline: '#a89888',
          'outline-variant': '#d4ccc4',
          'inverse-surface': '#32261C',
          'inverse-on-surface': '#FFFCFB',
          'inverse-primary': '#CFDFDE',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a',
          accent: '#F6CFDE',
          'brand-cream': '#FFFCFB',
          'brand-sand': '#CFDFDE',
          'brand-mint': '#CFDFDE',
          'brand-pink': '#F6CFDE',
          'brand-gold': '#D5B259',
          'brand-brown': '#6B4822'
        },
        borderRadius: {
          DEFAULT: '0.125rem',
          lg: '0.25rem',
          xl: '0.5rem',
          full: '0.75rem'
        },
        spacing: {
          'stack-xl': '64px',
          'margin-mobile': '24px',
          'stack-lg': '32px',
          'stack-sm': '8px',
          gutter: '24px',
          'stack-md': '16px',
          'margin-desktop': '64px',
          'container-max': '1280px'
        },
        fontFamily: {
          brand: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
          sans: ['Plus Jakarta Sans', 'sans-serif'],
          'title-lg': ['Plus Jakarta Sans'],
          'headline-md': ['Plus Jakarta Sans'],
          'body-md': ['Plus Jakarta Sans'],
          'display-lg': ['Plus Jakarta Sans'],
          'body-lg': ['Plus Jakarta Sans'],
          'display-lg-mobile': ['Plus Jakarta Sans'],
          'headline-lg': ['Plus Jakarta Sans'],
          'label-sm': ['Plus Jakarta Sans'],
          'label-lg': ['Plus Jakarta Sans'],
          'label-caps': ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
          'body-base': ['Plus Jakarta Sans', 'DM Sans', 'sans-serif']
        },
        fontSize: {
          'title-lg': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
          'headline-md': ['25px', { lineHeight: '1.3', fontWeight: '600' }],
          'body-md': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
          'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
          'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
          'display-lg-mobile': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
          'headline-lg': ['31px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
          'label-sm': ['10px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '700' }],
          'label-lg': ['13px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '600' }],
          'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.15em', fontWeight: '700' }],
          'body-base': ['16px', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }]
        }
      }
    }
  };
} catch (_e) {}
