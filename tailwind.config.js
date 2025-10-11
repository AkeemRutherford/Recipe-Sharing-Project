export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'airbnb-rausch': '#FF385C',
        'airbnb-rausch-dark': '#E31C5F',
        'airbnb-babu': '#00A699',
        'airbnb-hof': '#F7F7F7',
        'airbnb-foggy': '#767676',
        'airbnb-dark-gray': '#484848',
        'airbnb-light-gray': '#EBEBEB',
        'airbnb-black': '#222222',
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
