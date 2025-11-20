/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'power-yellow': '#FFD700',
        'power-red': '#DC2626',
        'power-green': '#059669',
        'power-green-light': '#10B981',
        'power-green-dark': '#047857',
        'power-blue': '#2563EB',
        'brand-green': '#6BBF59',
        'brand-green-dark': '#4A9B3C',
        'brand-green-darker': '#2D6B22',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}



