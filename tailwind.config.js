export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forklore-red': {
          DEFAULT: '#FF4D6A',
          50: '#FFE5EA',
          100: '#FFCCD6',
          200: '#FF99AD',
          300: '#FF6684',
          400: '#FF335B',
          500: '#FF4D6A',
          600: '#E63946',
          700: '#CC2936',
          800: '#B31F27',
          900: '#991519'
        },
        'airbnb-rausch': {
          DEFAULT: '#FF5A5F',
          dark: '#E00007',
        },
        'airbnb-babu': '#00A699',
        'airbnb-arches': '#FC642D',
        'airbnb-hof': '#FFB400',
        'airbnb-foggy': '#767676',
        'airbnb-black': '#222222',
        'airbnb-dark-gray': '#484848',
      },
      fontFamily: {
        'circular': ['Circular', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'airbnb': '8px',
        'airbnb-lg': '12px',
      },
      boxShadow: {
        'airbnb': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'airbnb-hover': '0 6px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
