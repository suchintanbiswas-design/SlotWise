/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a0a0a',
          card: '#121212',
          'card-hover': '#181818',
          border: '#1e293b',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.4), 0 10px 20px -2px rgba(0, 0, 0, 0.3)',
        'hover': '0 14px 28px -6px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        'glow-blue': '0 0 20px -3px rgba(59, 130, 246, 0.35)',
      },
      borderRadius: {
        DEFAULT: '1rem',
      },
    },
  },
  plugins: [],
}
