/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EFE8DE',
          400: '#E4D8C7',
          500: '#D5C4AF',
        },
        bischeese: {
          50: '#FAF5EE',
          100: '#F4ECE1',
          200: '#E8DEC8',
          300: '#D9C2A3',
          400: '#C69C6D',
          500: '#B47640',
          600: '#9A5F2D',
          700: '#7E4C23',
          800: '#5C381B',
          900: '#3D2614',
          950: '#26170B',
        },
        espresso: {
          50: '#F6F4F2',
          100: '#ECE6E0',
          200: '#D8CDC2',
          300: '#BDB0A2',
          400: '#9B8B7B',
          500: '#7D6B5D',
          600: '#645447',
          700: '#4F4137',
          800: '#3D2B1F',
          900: '#2B1E16',
          950: '#1A120D',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

