// List of coins that are actually available on Binance
// Only include coins that are actively traded on Binance
export const BINANCE_AVAILABLE_COINS = [
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'DOT', 'LTC', 'BCH', 
  'ETC', 'NEO', 'IOTA', 'LUNA'
];

// Coins that are NOT available on Binance (filter these out)
export const BINANCE_UNAVAILABLE_COINS = [
  'BSV', 'BBF', 'SNT'
];

export const getBinanceCoins = () => {
  return BINANCE_AVAILABLE_COINS;
};
