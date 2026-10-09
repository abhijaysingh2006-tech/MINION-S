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
          bg: '#000000',
          surface: '#121212',
          surfaceHover: '#1A1A1A',
          surfaceElevated: '#232323',
          border: '#1F1F1F',
          textMuted: '#B3B3B3',
          textDisabled: '#6A6A6A',
          textMain: '#FFFFFF',
          yellow: '#FFD60A',
          yellowHover: '#FFE033',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        floating: '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
