import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: '#10b981',
        danger: '#ef4444',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'slide-left': 'slideLeft 0.6s ease-out',
        'slide-right': 'slideRight 0.6s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function (api: any) {
      const { addComponents, theme } = api;
      addComponents({
        // Card component
        '.card': {
          '@apply rounded-2xl border border-primary-200 bg-white shadow-lg p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary-300': {},
        },
        '.card-header': {
          '@apply text-xl md:text-2xl font-bold text-slate-900 mb-4': {},
        },

        // Button components
        '.btn-primary': {
          '@apply px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-700 hover:to-primary-900 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-secondary': {
          '@apply px-6 py-3 rounded-lg font-semibold bg-primary-100 text-primary-800 hover:bg-primary-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-ghost': {
          '@apply px-4 py-2 rounded-lg font-semibold text-primary-700 hover:bg-primary-100 active:scale-95 transition-all': {},
        },
        '.btn-success': {
          '@apply px-6 py-3 rounded-lg font-semibold bg-success text-white hover:bg-green-600 active:scale-95 transition-all': {},
        },
        '.btn-danger': {
          '@apply px-6 py-3 rounded-lg font-semibold bg-danger text-white hover:bg-red-600 active:scale-95 transition-all': {},
        },

        // Form inputs
        '.form-input': {
          '@apply w-full px-4 py-3 rounded-lg border-2 border-primary-200 focus:border-primary-500 focus:outline-none bg-white text-stone-900 placeholder-stone-400 transition-colors duration-200': {},
        },
        '.form-label': {
          '@apply block text-sm font-semibold text-primary-800 mb-2': {},
        },

        // Gradient text
        '.gradient-text': {
          '@apply bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent': {},
        },
        '.gradient-text-alt': {
          '@apply bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent': {},
        },

        // Section styling
        '.section-heading': {
          '@apply text-4xl md:text-5xl font-bold text-slate-900 mb-4': {},
        },
        '.section-subheading': {
          '@apply text-lg md:text-xl text-slate-600': {},
        },

        // Utility classes
        '.container-main': {
          '@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
      });
    },
  ],
};

export default config;
