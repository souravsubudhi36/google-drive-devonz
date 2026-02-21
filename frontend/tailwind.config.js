/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#9E7FFF',
          50: '#F5F0FF',
          100: '#EBE1FF',
          200: '#D4C2FF',
          300: '#BEA3FF',
          400: '#9E7FFF',
          500: '#7C5CE0',
          600: '#6344C0',
          700: '#4C30A0',
          800: '#371F80',
          900: '#241260',
        },
        surface: {
          DEFAULT: '#262626',
          50: '#404040',
          100: '#383838',
          200: '#303030',
          300: '#262626',
          400: '#1F1F1F',
          500: '#171717',
          600: '#0F0F0F',
        },
        accent: {
          pink: '#f472b6',
          blue: '#38bdf8',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
