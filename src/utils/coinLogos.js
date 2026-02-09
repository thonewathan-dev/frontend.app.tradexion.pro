// Coin logo utility for Vite
// All available coins from assets
const availableCoins = [
  'BTC', 'ETH', 'BNB', 'BCH', 'BSV', 'DOGE', 'DOT', 'ETC',
  'IOTA', 'LTC', 'LUNA', 'NEO', 'SNT', 'XRP', 'BBF', 'USDT', 'ADA'
];

export const getCoinLogoUrl = (currency) => {
  const upperCurrency = currency.toUpperCase();

  // Special handling for Forex (using high-quality external flags)
  const forexFlags = {
    'AUD': 'au', 'BRL': 'br', 'CAD': 'ca', 'CHF': 'ch',
    'CNY': 'cn', 'CZK': 'cz', 'DKK': 'dk', 'EUR': 'eu', 'GBP': 'gb',
    'HKD': 'hk', 'HUF': 'hu', 'IDR': 'id', 'ILS': 'il', 'INR': 'in',
    'ISK': 'is', 'JPY': 'jp', 'KRW': 'kr', 'MXN': 'mx', 'MYR': 'my',
    'NOK': 'no', 'NZD': 'nz', 'PHP': 'ph', 'PLN': 'pl', 'RON': 'ro',
    'SEK': 'se', 'SGD': 'sg', 'THB': 'th', 'TRY': 'tr', 'USD': 'us',
    'ZAR': 'za'
  };

  if (upperCurrency === 'USD') {
    return 'https://t4.ftcdn.net/jpg/05/22/35/01/360_F_522350125_mPLuK4cNT6RNN6bvpuKZpLGjqbJr5EiL.jpg';
  }

  if (forexFlags[upperCurrency]) {
    return `https://flagcdn.com/w40/${forexFlags[upperCurrency]}.png`;
  }

  // Special handling for Metals (Premium SVGs)
  // Check for both the base code (XAU) and common pair formats
  const cleanCurrency = upperCurrency.replace('/USD', '').replace('USDT', '');

  if (cleanCurrency === 'XAU') return `${window.location.origin}/gold--big.svg`;
  if (cleanCurrency === 'XAG') return `${window.location.origin}/silver--big.svg`;
  if (cleanCurrency === 'XPT') return `${window.location.origin}/platinum--big.svg`;
  if (cleanCurrency === 'XPD') return `${window.location.origin}/palladium--big.svg`;

  // Generic fallback for any currency/asset
  if (availableCoins.includes(upperCurrency)) {
    try {
      return new URL(`../assets/coins/${upperCurrency}.png`, import.meta.url).href;
    } catch (error) {
      return `/src/assets/coins/${upperCurrency}.png`;
    }
  }

  // High quality dynamic fallback for everything else
  return `https://ui-avatars.com/api/?name=${upperCurrency}&background=random&color=fff&rounded=true`;
};

export const getAllCoins = () => {
  return availableCoins;
};
