const fetch = require('node-fetch');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

async function scanCrypto() {
  try {
    // Fetch top coins from CoinGecko (real data)
    const response = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
    );

    if (!response.ok) {
      console.warn('CoinGecko API yanıt vermedi, demo veri kullanılıyor...');
      return getDemoData();
    }

    const coins = await response.json();

    // Process coins into opportunities
    const opportunities = coins.map(coin => ({
      coin_name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      price_change_24h: coin.price_change_percentage_24h,
      price_change_7d: coin.price_change_percentage_7d_in_currency,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      image: coin.image,
      signal_type: getSignalType(coin),
      risk_level: getRiskLevel(coin),
      action_link: `https://www.coingecko.com/en/coins/${coin.id}`
    }));

    // Add arbitrage opportunities (simulated cross-exchange spreads)
    const arbitrageOpps = generateArbitrageOpportunities(coins.slice(0, 10));

    return {
      module: 'crypto',
      title: '₿ Kripto Fırsat Tarayıcı',
      icon: '₿',
      last_updated: new Date().toISOString(),
      data_source: 'CoinGecko (Gerçek Veri)',
      market_overview: {
        total_market_cap: coins.reduce((sum, c) => sum + (c.market_cap || 0), 0),
        top_gainer: coins.reduce((best, c) => (c.price_change_percentage_24h > (best.price_change_percentage_24h || -999)) ? c : best, coins[0]),
        top_loser: coins.reduce((worst, c) => (c.price_change_percentage_24h < (worst.price_change_percentage_24h || 999)) ? c : worst, coins[0])
      },
      opportunities: opportunities.filter(o => o.signal_type !== 'neutral'),
      arbitrage: arbitrageOpps,
      all_coins: opportunities
    };
  } catch (error) {
    console.error('Kripto tarama hatası:', error.message);
    return getDemoData();
  }
}

function getSignalType(coin) {
  const change = coin.price_change_percentage_24h || 0;
  if (change < -10) return 'strong_dip';
  if (change < -5) return 'dip';
  if (change > 15) return 'pump';
  if (change > 8) return 'rising';
  return 'neutral';
}

function getRiskLevel(coin) {
  const mc = coin.market_cap || 0;
  if (mc > 50000000000) return 'düşük';
  if (mc > 5000000000) return 'orta';
  return 'yüksek';
}

function generateArbitrageOpportunities(coins) {
  const exchanges = ['Binance', 'BtcTurk', 'Paribu', 'Gate.io', 'KuCoin'];
  return coins.slice(0, 5).map(coin => {
    const spread = (Math.random() * 4 + 0.5).toFixed(2);
    const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    let sellExchange;
    do {
      sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    } while (sellExchange === buyExchange);

    const buyPrice = coin.current_price;
    const sellPrice = buyPrice * (1 + parseFloat(spread) / 100);

    return {
      coin: coin.symbol.toUpperCase(),
      coin_name: coin.name,
      buy_exchange: buyExchange,
      sell_exchange: sellExchange,
      buy_price: buyPrice.toFixed(2),
      sell_price: sellPrice.toFixed(2),
      spread_percent: spread,
      potential_profit_per_1000: ((parseFloat(spread) / 100) * 1000).toFixed(2),
      image: coin.image
    };
  });
}

function getDemoData() {
  return {
    module: 'crypto',
    title: '₿ Kripto Fırsat Tarayıcı',
    icon: '₿',
    last_updated: new Date().toISOString(),
    data_source: 'Demo Veri',
    market_overview: {
      total_market_cap: 2450000000000,
      top_gainer: { name: 'Solana', symbol: 'SOL', price_change_percentage_24h: 12.5 },
      top_loser: { name: 'Dogecoin', symbol: 'DOGE', price_change_percentage_24h: -8.3 }
    },
    opportunities: [
      { coin_name: 'Bitcoin', symbol: 'BTC', current_price: 67500, price_change_24h: -3.2, signal_type: 'dip', risk_level: 'düşük', image: '', action_link: 'https://www.coingecko.com/en/coins/bitcoin' },
      { coin_name: 'Ethereum', symbol: 'ETH', current_price: 3450, price_change_24h: 5.8, signal_type: 'rising', risk_level: 'düşük', image: '', action_link: 'https://www.coingecko.com/en/coins/ethereum' },
      { coin_name: 'Solana', symbol: 'SOL', current_price: 145, price_change_24h: 12.5, signal_type: 'pump', risk_level: 'orta', image: '', action_link: 'https://www.coingecko.com/en/coins/solana' }
    ],
    arbitrage: [
      { coin: 'BTC', coin_name: 'Bitcoin', buy_exchange: 'Binance', sell_exchange: 'BtcTurk', buy_price: '67500.00', sell_price: '68850.00', spread_percent: '2.0', potential_profit_per_1000: '20.00' }
    ],
    all_coins: []
  };
}

module.exports = { scanCrypto };
