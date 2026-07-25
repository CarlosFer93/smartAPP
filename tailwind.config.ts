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
        cream: {
          bg: '#F8F7F4',
          card: '#EFECE6',
          border: '#E5E0D8',
        },
        smart: {
          blue: '#0F3E6D',
          blueDark: '#0A2B4C',
          blueLight: '#1a5fa0',
          green: '#10B981',
          greenHover: '#059669',
          greenLight: '#D1FAE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.28s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'smart': '0 8px 32px -8px rgba(15, 62, 109, 0.18)',
        'smart-lg': '0 16px 48px -12px rgba(15, 62, 109, 0.24)',
        'green': '0 8px 24px -6px rgba(16, 185, 129, 0.30)',
      },
    },
  },
  plugins: [],
}

export default config
