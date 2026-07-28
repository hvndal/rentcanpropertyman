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
          'primary-container': '#5A4A3C',
          'on-primary-container': '#F5F7F6',
          'primary-fixed': '#CFDFDE',
          'primary-fixed-dim': '#b8d4d2',
          'on-primary-fixed': '#4E4238',
          'on-primary-fixed-variant': '#6B4822',
          secondary: '#F6CFDE',
          'on-secondary': '#4E4238',
          'secondary-container': '#F6CFDE',
          'on-secondary-container': '#4E4238',
          'secondary-fixed': '#F6CFDE',
          'secondary-fixed-dim': '#e8b8c8',
          'on-secondary-fixed': '#4E4238',
          'on-secondary-fixed-variant': '#6B4822',
          tertiary: '#D5B259',
          'on-tertiary': '#4E4238',
          'tertiary-container': '#c9a44d',
          'on-tertiary-container': '#4E4238',
          'tertiary-fixed': '#D5B259',
          'tertiary-fixed-dim': '#c4a050',
          'on-tertiary-fixed': '#4E4238',
          'on-tertiary-fixed-variant': '#6B4822',
          background: '#F2F5F4',
          'on-background': '#4E4238',
          surface: '#F2F5F4',
          'surface-dim': '#e8efee',
          'surface-bright': '#F5F7F6',
          'surface-container-lowest': '#F5F7F6',
          'surface-container-low': '#f0f4f3',
          'surface-container': '#e9efee',
          'surface-container-high': '#e0e8e7',
          'surface-container-highest': '#d5dfde',
          'surface-variant': '#e8f0ef',
          'surface-tint': '#6B4822',
          'on-surface': '#4E4238',
          'on-surface-variant': '#5c534a',
          outline: '#a29a90',
          'outline-variant': '#d0ccc6',
          'inverse-surface': '#4E4238',
          'inverse-on-surface': '#F5F7F6',
          'inverse-primary': '#CFDFDE',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a',
          accent: '#F6CFDE',
          'brand-cream': '#F2F5F4',
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
