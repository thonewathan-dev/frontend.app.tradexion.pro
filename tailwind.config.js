/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E88E5',
        secondary: '#43A047',
        danger: '#E53935',
        dark: '#181A20',
        'dark-surface': '#1E2329',
        'dark-border': '#2B3139',
      },
    },
  },
  plugins: [],
}
