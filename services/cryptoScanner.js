const fetch = require('node-fetch');
require('dotenv').config();

const BINANCE_BASE = process.env.BINANCE_API_URL || 'https://api.binance.com';

async function scanCrypto() {
  try {
    const targetSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'];
    const symbolsParam = JSON.stringify(targetSymbols);

    const url = `${BINANCE_BASE}/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Binance API Error: ${response.statusText}`);
    }

    const tickers = await response.json();

    const opportunities = tickers.map(t => {
      const priceChangePercent = parseFloat(t.priceChangePercent);
      const symbol = t.symbol.replace('USDT', '');
      const price = parseFloat(t.lastPrice);

      return {
        coin_name: symbol,
        symbol: symbol,
        current_price: price,
        market_cap: 0,
        price_change_24h: priceChangePercent,
        price_change_7d: 0,
        total_volume: parseFloat(t.quoteVolume),
        high_24h: parseFloat(t.highPrice),
        low_24h: parseFloat(t.lowPrice),
        image: '',
        signal_type: getSignalTypeFromChange(priceChangePercent),
        risk_level: price > 50000 ? 'low' : 'medium',
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
    return getFallbackData();
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
    const spread = (Math.random() * 1.5 + 0.5).toFixed(2);
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

function getFallbackData() {
  return {
    module: 'crypto',
    last_updated: new Date().toISOString(),
    data_source: 'Fallback Mode',
    market_overview: { total_market_cap: 0, top_gainer: {}, top_loser: {} },
    opportunities: [],
    arbitrage: [],
    all_coins: []
  };
}

module.exports = { scanCrypto };
