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
        dark: '#000000',
        'dark-surface': '#121212',
        'dark-border': '#333333',
      },
    },
  },
  plugins: [],
}
