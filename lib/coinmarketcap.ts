import axios from 'axios';

const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export interface CryptoQuote {
  price: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  volume_24h: number;
}

export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: CryptoQuote;
  };
}

export async function getLatestQuotes(symbols: string[]): Promise<{ [key: string]: CryptoData }> {
  try {
    const response = await axios.get(`${CMC_BASE_URL}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
      },
      params: {
        symbol: symbols.join(','),
        convert: 'USD',
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('CoinMarketCap API Error:', error);
    throw new Error('Failed to fetch cryptocurrency data');
  }
}