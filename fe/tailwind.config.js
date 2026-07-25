/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#14212B',
          soft: '#3A4A56',
          muted: '#6B7C88',
        },
        mist: {
          DEFAULT: '#F3F6F4',
          deep: '#E4EBE6',
        },
        tide: {
          DEFAULT: '#0F766E',
          bright: '#14B8A6',
          soft: '#CCFBF1',
        },
        citrus: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
        },
      },
      boxShadow: {
        lift: '0 18px 40px -24px rgba(20, 33, 43, 0.35)',
        soft: '0 8px 24px -16px rgba(20, 33, 43, 0.25)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        bounceBadge: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.25)' },
          '70%': { transform: 'scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-up': 'fadeUp 0.55s ease both',
        'pulse-soft': 'pulseSoft 0.65s ease',
        'bounce-badge': 'bounceBadge 0.55s ease',
        float: 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
