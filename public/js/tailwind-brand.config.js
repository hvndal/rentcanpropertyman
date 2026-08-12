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
          primary: '#183D35',
          'on-primary': '#ffffff',
          'primary-container': '#224E44',
          'on-primary-container': '#F5F3EE',
          'primary-fixed': '#E8E6E1',
          'primary-fixed-dim': '#D4D2CD',
          'on-primary-fixed': '#111111',
          'on-primary-fixed-variant': '#183D35',
          secondary: '#5F5D58',
          'on-secondary': '#ffffff',
          'secondary-container': '#E8E6E1',
          'on-secondary-container': '#111111',
          'secondary-fixed': '#E8E6E1',
          'secondary-fixed-dim': '#D4D2CD',
          'on-secondary-fixed': '#111111',
          'on-secondary-fixed-variant': '#5F5D58',
          tertiary: '#B9654A',
          'on-tertiary': '#ffffff',
          'tertiary-container': '#D4876E',
          'on-tertiary-container': '#111111',
          'tertiary-fixed': '#B9654A',
          'tertiary-fixed-dim': '#A85A42',
          'on-tertiary-fixed': '#ffffff',
          'on-tertiary-fixed-variant': '#B9654A',
          background: '#F5F3EE',
          'on-background': '#111111',
          surface: '#F5F3EE',
          'surface-dim': '#ECEAE5',
          'surface-bright': '#FAF9F6',
          'surface-container-lowest': '#FAF9F6',
          'surface-container-low': '#F5F3EE',
          'surface-container': '#ECEAE5',
          'surface-container-high': '#E8E6E1',
          'surface-container-highest': '#D4D2CD',
          'surface-variant': '#ECEAE5',
          'surface-tint': '#183D35',
          'on-surface': '#111111',
          'on-surface-variant': '#5F5D58',
          outline: '#8A8884',
          'outline-variant': '#D4D2CD',
          'inverse-surface': '#111111',
          'inverse-on-surface': '#F5F3EE',
          'inverse-primary': '#B9654A',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a',
          accent: '#B9654A',
          'brand-cream': '#F5F3EE',
          'brand-sand': '#E8E6E1',
          'brand-mint': '#E8E6E1',
          'brand-pink': '#B9654A',
          'brand-gold': '#B9654A',
          'brand-brown': '#183D35'
        },
        borderRadius: {
          DEFAULT: '0.125rem',
          lg: '0.5rem',
          xl: '0.625rem',
          full: '0.75rem'
        },
        spacing: {
          'stack-xl': '64px',
          'margin-mobile': '20px',
          'stack-lg': '32px',
          'stack-sm': '8px',
          gutter: '24px',
          'stack-md': '16px',
          'margin-desktop': '64px',
          'container-max': '1280px'
        },
        fontFamily: {
          brand: ['Manrope', 'sans-serif'],
          sans: ['Manrope', 'sans-serif'],
          'title-lg': ['Manrope'],
          'headline-md': ['Manrope'],
          'body-md': ['Manrope'],
          'display-lg': ['Manrope'],
          'body-lg': ['Manrope'],
          'display-lg-mobile': ['Manrope'],
          'headline-lg': ['Manrope'],
          'label-sm': ['Manrope'],
          'label-lg': ['Manrope'],
          'label-caps': ['Manrope', 'sans-serif'],
          'body-base': ['Manrope', 'sans-serif']
        },
        fontSize: {
          'title-lg': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
          'headline-md': ['25px', { lineHeight: '1.3', fontWeight: '600' }],
          'body-md': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
          'display-lg': ['56px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
          'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
          'display-lg-mobile': ['36px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
          'headline-lg': ['31px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
          'label-sm': ['10px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '700' }],
          'label-lg': ['13px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '600' }],
          'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.12em', fontWeight: '700' }],
          'body-base': ['16px', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }]
        }
      }
    }
  };
} catch (_e) {}
