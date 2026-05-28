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
        // Primary: Emerald (Action & Success)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#2dd4bf',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Secondary: Slate (Primary UI)
        secondary: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
          950: '#020617',
        },
        // Accent: Blue (Information & Links)
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
          950: '#051e3e',
        },
        // Tertiary: Indigo (Secondary Actions & Info)
        indigo: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Quaternary: Amber (Highlights & Motivation)
        amber: {
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
        // Status Colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#0ea5e9',
        // Neutral
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.5px' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'none': 'none',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.3)',
      },
      borderRadius: {
        'xs': '0.25rem',
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
        // ============ CARD COMPONENTS ============
        '.card': {
          '@apply rounded-xl border border-secondary-200 bg-white shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:border-primary-300': {},
        },
        '.card-elevated': {
          '@apply rounded-xl border border-secondary-100 bg-white shadow-lg p-6 transition-all duration-300 hover:shadow-xl': {},
        },
        '.card-header': {
          '@apply text-xl md:text-2xl font-bold text-secondary-900 mb-4': {},
        },
        '.card-title': {
          '@apply text-lg font-semibold text-secondary-800': {},
        },
        '.card-subtitle': {
          '@apply text-sm text-secondary-600': {},
        },

        // ============ BUTTON COMPONENTS ============
        '.btn': {
          '@apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-primary': {
          '@apply btn bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-md hover:shadow-lg': {},
        },
        '.btn-primary-lg': {
          '@apply btn-primary px-6 py-3 text-base': {},
        },
        '.btn-secondary': {
          '@apply btn bg-secondary-100 text-secondary-800 hover:bg-secondary-200 active:scale-95': {},
        },
        '.btn-secondary-lg': {
          '@apply btn-secondary px-6 py-3 text-base': {},
        },
        '.btn-accent': {
          '@apply btn bg-accent-600 text-white hover:bg-accent-700 active:scale-95 shadow-md hover:shadow-lg': {},
        },
        '.btn-accent-lg': {
          '@apply btn-accent px-6 py-3 text-base': {},
        },
        '.btn-indigo': {
          '@apply btn bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg': {},
        },
        '.btn-indigo-lg': {
          '@apply btn-indigo px-6 py-3 text-base': {},
        },
        '.btn-amber': {
          '@apply btn bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-md hover:shadow-lg': {},
        },
        '.btn-amber-lg': {
          '@apply btn-amber px-6 py-3 text-base': {},
        },
        '.btn-success': {
          '@apply btn bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-md': {},
        },
        '.btn-danger': {
          '@apply btn bg-danger text-white hover:bg-red-600 active:scale-95 shadow-md': {},
        },
        '.btn-ghost': {
          '@apply btn text-secondary-700 hover:bg-secondary-100 active:scale-95': {},
        },
        '.btn-outline': {
          '@apply btn border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:scale-95': {},
        },

        // ============ FORM COMPONENTS ============
        '.form-input': {
          '@apply w-full px-4 py-2.5 rounded-lg border-2 border-secondary-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white text-secondary-900 placeholder-secondary-400 transition-all duration-200': {},
        },
        '.form-input-lg': {
          '@apply form-input px-5 py-3 text-base': {},
        },
        '.form-label': {
          '@apply block text-sm font-semibold text-secondary-700 mb-2': {},
        },
        '.form-error': {
          '@apply text-danger text-sm mt-1': {},
        },
        '.form-hint': {
          '@apply text-secondary-500 text-xs mt-1': {},
        },
        '.form-group': {
          '@apply mb-4': {},
        },

        // ============ TEXT COMPONENTS ============
        '.heading-1': {
          '@apply text-4xl md:text-5xl font-bold text-secondary-900': {},
        },
        '.heading-2': {
          '@apply text-3xl md:text-4xl font-bold text-secondary-900': {},
        },
        '.heading-3': {
          '@apply text-2xl md:text-3xl font-bold text-secondary-900': {},
        },
        '.heading-4': {
          '@apply text-xl md:text-2xl font-bold text-secondary-800': {},
        },
        '.heading-5': {
          '@apply text-lg font-semibold text-secondary-800': {},
        },
        '.subheading': {
          '@apply text-lg md:text-xl text-secondary-600': {},
        },
        '.body-text': {
          '@apply text-base text-secondary-700': {},
        },
        '.body-text-sm': {
          '@apply text-sm text-secondary-600': {},
        },
        '.text-muted': {
          '@apply text-secondary-500': {},
        },

        // ============ BADGE COMPONENTS ============
        '.badge': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold': {},
        },
        '.badge-primary': {
          '@apply badge bg-primary-100 text-primary-700': {},
        },
        '.badge-secondary': {
          '@apply badge bg-secondary-100 text-secondary-700': {},
        },
        '.badge-accent': {
          '@apply badge bg-accent-100 text-accent-700': {},
        },
        '.badge-success': {
          '@apply badge bg-primary-100 text-primary-700': {},
        },
        '.badge-warning': {
          '@apply badge bg-warning bg-opacity-10 text-warning': {},
        },
        '.badge-danger': {
          '@apply badge bg-danger bg-opacity-10 text-danger': {},
        },
        '.badge-indigo': {
          '@apply badge bg-indigo-100 text-indigo-700': {},
        },
        '.badge-amber': {
          '@apply badge bg-amber-100 text-amber-700': {},
        },

        // ============ LAYOUT COMPONENTS ============
        '.container-main': {
          '@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.section': {
          '@apply py-12 md:py-16 lg:py-20': {},
        },
        '.section-sm': {
          '@apply py-6 md:py-8': {},
        },
        '.section-lg': {
          '@apply py-16 md:py-24': {},
        },

        // ============ RESPONSIVE GRID ============
        '.grid-responsive': {
          '@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6': {},
        },
        '.grid-responsive-2': {
          '@apply grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6': {},
        },
        '.grid-responsive-4': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6': {},
        },

        // ============ TOUCH-FRIENDLY BUTTONS ============
        '.btn-touch': {
          '@apply min-h-12 sm:min-h-14 px-4 sm:px-6': {},
        },
        '.input-touch': {
          '@apply min-h-12 sm:min-h-14 px-3 sm:px-4': {},
        },

        // ============ MOBILE PADDING ============
        '.p-mobile': {
          '@apply p-4 sm:p-6 lg:p-8': {},
        },
        '.px-mobile': {
          '@apply px-4 sm:px-6 lg:px-8': {},
        },
        '.py-mobile': {
          '@apply py-4 sm:py-6 lg:py-8': {},
        },

        // ============ RESPONSIVE TEXT ============
        '.text-responsive-sm': {
          '@apply text-xs sm:text-sm lg:text-base': {},
        },
        '.text-responsive-base': {
          '@apply text-sm sm:text-base lg:text-lg': {},
        },
        '.text-responsive-lg': {
          '@apply text-base sm:text-lg lg:text-xl': {},
        },
        '.text-responsive-xl': {
          '@apply text-lg sm:text-xl lg:text-2xl': {},
        },
        '.text-responsive-2xl': {
          '@apply text-xl sm:text-2xl lg:text-3xl': {},
        },
        '.text-responsive-3xl': {
          '@apply text-2xl sm:text-3xl lg:text-4xl': {},
        },
        '.text-responsive-4xl': {
          '@apply text-3xl sm:text-4xl lg:text-5xl': {},
        },

        // ============ RESPONSIVE SPACING ============
        '.gap-responsive': {
          '@apply gap-3 sm:gap-4 lg:gap-6': {},
        },
        '.gap-responsive-lg': {
          '@apply gap-4 sm:gap-6 lg:gap-8': {},
        },
        '.space-responsive': {
          '@apply space-y-3 sm:space-y-4 lg:space-y-6': {},
        },
        '.space-responsive-lg': {
          '@apply space-y-4 sm:space-y-6 lg:space-y-8': {},
        },

        // ============ RESPONSIVE ROUNDED ============
        '.rounded-responsive': {
          '@apply rounded-lg sm:rounded-xl lg:rounded-2xl': {},
        },
        '.rounded-responsive-sm': {
          '@apply rounded-md sm:rounded-lg lg:rounded-xl': {},
        },

        // ============ RESPONSIVE SHADOW ============
        '.shadow-responsive': {
          '@apply shadow-sm sm:shadow-md lg:shadow-lg': {},
        },

        // ============ GRADIENT COMPONENTS ============
        '.gradient-text': {
          '@apply bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent': {},
        },
        '.gradient-text-blue': {
          '@apply bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent': {},
        },
        '.gradient-bg': {
          '@apply bg-gradient-to-br from-primary-50 to-accent-50': {},
        },

        // ============ UTILITY CLASSES ============
        '.divider': {
          '@apply border-t border-secondary-200': {},
        },
        '.divider-lg': {
          '@apply border-t-2 border-secondary-200': {},
        },
        '.transition-smooth': {
          '@apply transition-all duration-300 ease-in-out': {},
        },
        '.focus-ring': {
          '@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2': {},
        },
      });
    },
  ],
};

export default config;
