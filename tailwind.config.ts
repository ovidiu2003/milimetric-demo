import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Brand colors with opacity variants
    'text-brand-dark',
    'text-brand-dark/70',
    'text-brand-charcoal',
    'text-brand-charcoal/60',
    'text-brand-charcoal/70',
    'text-brand-accent',
    'text-brand-accent/5',
    'text-brand-accent/10',
    'text-brand-accent/40',
    'text-brand-accent/50',
    'bg-brand-cream',
    'bg-brand-beige',
    'bg-brand-beige/30',
    'bg-brand-beige/50',
    'bg-brand-warm',
    'bg-brand-accent',
    'bg-brand-accent/5',
    'bg-brand-accent/10',
    'border-brand-beige',
    'border-brand-beige/30',
    'border-brand-beige/50',
    'border-brand-accent',
    'border-brand-accent/40',
    'border-brand-accent/50',
    'ring-brand-accent/40',
    'ring-brand-dark/40',
    'ring-offset-brand-cream',
    // Custom animations
    'animate-step-in',
    'animate-fade-in',
    'animate-fade-in-up',
    'animate-slide-up',
    // Custom components
    'section-container',
    'heading-lg',
    'heading-sm',
    'card-interactive',
    'input-field',
    'configurator-panel',
    'configurator-canvas',
    'btn-primary',
    'btn-secondary',
    'btn-ghost',
    'glass-panel',
    'material-swatch',
    'compartment-cell',
    'step-indicator',
    'step-dot',
    'step-dot/active',
    'step-dot/completed',
    'step-dot/pending',
    'separator',
    // Navigation classes
    'nav-header',
    'nav-header--scrolled',
    'nav-header--transparent',
    'nav-pill',
    'nav-cta',
    'nav-cta--transparent',
    'nav-mobile-menu',
    // Hero classes
    'hero-dot',
    'hero-dot.active',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#fafafa',
          beige: '#e0ddd8',
          dark: '#080808',
          charcoal: '#404040',
          warm: '#f2f2ee',
          accent: '#080808',
          'accent-hover': '#333333',
          sage: '#7D8B73',
          gold: '#f9e1a1',
          muted: '#969696',
        },
      },
      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
        hand: ['Caveat', 'cursive'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        container: '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'step-in': 'fadeSlideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      letterSpacing: {
        'display': '0.04em',
        'wide-display': '0.08em',
      },
    },
  },
  plugins: [],
}

export default config
