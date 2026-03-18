import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
