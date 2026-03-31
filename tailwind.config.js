/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#5B21B6',
          coral:  '#F97316',
          yellow: '#EAB308',
          green:  '#10B981',
          bg:     '#FFF8F0',
          card:   '#FFFFFF',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
