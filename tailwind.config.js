/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5da',
          300: '#f0b5bf',
          400: '#e58c9c',
          500: '#d56075',
          600: '#be445b',
          700: '#9f3448',
          800: '#852d3e',
          900: '#722a38',
          950: '#40121c',
        }
      }
    },
  },
  plugins: [],
}

