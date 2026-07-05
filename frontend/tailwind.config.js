/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1220',
          50: '#EEF1F7',
          100: '#D4DBE8',
          200: '#A9B7D1',
          300: '#7E93BA',
          400: '#536FA3',
          500: '#2E4B85',
          600: '#1C3566',
          700: '#122447',
          800: '#0B1220',
          900: '#060A13',
        },
        accent: {
          DEFAULT: '#FF6A00', // bold orange
          light: '#FF8A3D',
          dark: '#CC5500',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
