/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soundwave: {
          bg: '#0F0F12',
          surface: '#18191E',
          surfaceHover: '#24252B',
          surfaceActive: '#2C2D35',
          border: '#24252B',
          textMuted: '#94A3B8',
          textMain: '#F8FAFC',
          yellow: '#FFD60A',
          yellowHover: '#FFE033',
          green: '#1ED760',
          greenHover: '#1DB954',
          denim: '#2B5BA8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
