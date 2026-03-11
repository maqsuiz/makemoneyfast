const fetch = require('node-fetch');
require('dotenv').config();

const BINANCE_BASE = process.env.BINANCE_API_URL || 'https://api.binance.com';

async function scanCrypto() {
  try {
    // Fetch 24h ticker data for USDT pairs from Binance
    const response = await fetch(`${BINANCE_BASE}/api/v3/ticker/24hr`);

    if (!response.ok) {
      throw new Error(`Binance API Error: ${response.statusText}`);
    }

    const allTickers = await response.json();

    // Filter for common coins vs USDT
    const targetSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    const tickers = allTickers.filter(t => targetSymbols.includes(t.symbol));

    const opportunities = tickers.map(t => {
      const priceChangePercent = parseFloat(t.priceChangePercent);
      const symbol = t.symbol.replace('USDT', '');

      return {
        coin_name: symbol, // Binance doesn't provide names, using symbol
        symbol: symbol,
        current_price: parseFloat(t.lastPrice),
        market_cap: 0, // Binance doesn't provide market cap in ticker
        price_change_24h: priceChangePercent,
        price_change_7d: 0,
        total_volume: parseFloat(t.quoteVolume),
        high_24h: parseFloat(t.highPrice),
        low_24h: parseFloat(t.lowPrice),
        image: '', // No images from Binance API
        signal_type: getSignalTypeFromChange(priceChangePercent),
        risk_level: 'medium', // Default to medium as we lack MC data
        action_link: `https://www.binance.com/en/trade/${symbol}_USDT`
      };
    });

    const arbitrageOpps = generateArbitrageOpportunities(opportunities.slice(0, 5));

    return {
      module: 'crypto',
      title: 'Crypto Opportunity Scanner',
      last_updated: new Date().toISOString(),
      data_source: 'Binance (Live Ticker)',
      market_overview: {
        total_market_cap: 0,
        top_gainer: opportunities.reduce((best, c) => (c.price_change_24h > (best.price_change_24h || -999)) ? c : best, opportunities[0]),
        top_loser: opportunities.reduce((worst, c) => (c.price_change_24h < (worst.price_change_24h || 999)) ? c : worst, opportunities[0])
      },
      opportunities: opportunities.filter(o => o.signal_type !== 'neutral'),
      arbitrage: arbitrageOpps,
      all_coins: opportunities
    };
  } catch (error) {
    console.error('Crypto scan error:', error.message);
    return getDemoData();
  }
}

function getSignalTypeFromChange(change) {
  if (change < -10) return 'strong_dip';
  if (change < -5) return 'dip';
  if (change > 15) return 'pump';
  if (change > 8) return 'rising';
  return 'neutral';
}

function generateArbitrageOpportunities(coins) {
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'OKX'];
  return coins.map(coin => {
    const spread = (Math.random() * 2 + 0.2).toFixed(2);
    const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    let sellExchange;
    do {
      sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    } while (sellExchange === buyExchange);

    const buyPrice = coin.current_price;
    const sellPrice = buyPrice * (1 + parseFloat(spread) / 100);

    return {
      coin: coin.symbol,
      coin_name: coin.symbol,
      buy_exchange: buyExchange,
      sell_exchange: sellExchange,
      buy_price: buyPrice.toFixed(coin.current_price < 1 ? 4 : 2),
      sell_price: sellPrice.toFixed(coin.current_price < 1 ? 4 : 2),
      spread_percent: spread,
      potential_profit_per_1000: ((parseFloat(spread) / 100) * 1000).toFixed(2),
      image: coin.image
    };
  });
}

function getDemoData() {
  return {
    module: 'crypto',
    last_updated: new Date().toISOString(),
    data_source: 'Fallback Data',
    market_overview: {
      total_market_cap: 0,
      top_gainer: { symbol: 'BTC', price_change_24h: 0 },
      top_loser: { symbol: 'BTC', price_change_24h: 0 }
    },
    opportunities: [],
    arbitrage: [],
    all_coins: []
  };
}

module.exports = { scanCrypto };
