/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        minion: {
          yellow: '#FFD60A',
          yellowHover: '#FFE033',
          yellowDark: '#E5BF00',
          denim: '#2B5BA8',
          denimHover: '#376FC8',
          denimDark: '#1E3E73',
          bg: '#0F0F12',
          surface: '#18191E',
          surfaceLight: '#24252B',
          surfaceElevated: '#2F3038',
          textMuted: '#94A3B8',
          textMain: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(255, 214, 10, 0.6))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 4px rgba(255, 214, 10, 0.2))' },
        }
      }
    },
  },
  plugins: [],
}
