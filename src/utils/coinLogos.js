// Coin logo utility for Vite
// All available coins from assets
const availableCoins = [
  'BTC', 'ETH', 'BNB', 'BCH', 'BSV', 'DOGE', 'DOT', 'ETC', 
  'IOTA', 'LTC', 'LUNA', 'NEO', 'SNT', 'XRP', 'BBF', 'USDT', 'ADA'
];

export const getCoinLogoUrl = (currency) => {
  const upperCurrency = currency.toUpperCase();
  
  if (availableCoins.includes(upperCurrency)) {
    try {
      return new URL(`../assets/coins/${upperCurrency}.png`, import.meta.url).href;
    } catch (error) {
      return `/src/assets/coins/${upperCurrency}.png`;
    }
  }
  return null;
};

export const getAllCoins = () => {
  return availableCoins;
};
