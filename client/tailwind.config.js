/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Toggle dark mode via a `dark` class on <html>.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm, appetite-friendly brand palette.
        primary: {
          50: '#FEF3EE',
          100: '#FDE3D5',
          200: '#FAC4A8',
          300: '#F69C72',
          400: '#F0703F',
          500: '#E2562B', // deep orange / terracotta — primary brand color
          600: '#C5421C',
          700: '#A3321A',
          800: '#822A1B',
          900: '#6B2619',
        },
        cream: '#FFF8F1', // off-white background
        charcoal: '#2B2622', // primary text
        veg: '#1B9C5D', // accent green for veg tags
        gold: '#F5A623', // ratings
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Poppins"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(43, 38, 34, 0.12)',
        'card-hover': '0 16px 40px -8px rgba(226, 86, 43, 0.28)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
