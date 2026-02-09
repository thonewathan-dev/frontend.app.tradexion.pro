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
        dark: 'var(--bg-color)',
        'dark-surface': '#121212',
        'dark-border': '#333333',
        'binance-yellow': '#FCD535',
        'binance-black': '#1E2329',
        'binance-green': '#0ECB81',
        'binance-red': '#F6465D',
        'binance-gray': '#EAECEF',
      },
    },
  },
  plugins: [],
}
