const { scanCrypto } = require('./services/cryptoScanner');
const { scanStocks } = require('./services/stockScanner');

async function test() {
    console.log('Testing Crypto Scanner...');
    const crypto = await scanCrypto();
    console.log('Crypto Data Source:', crypto.data_source);
    console.log('Crypto Coins Found:', crypto.all_coins.length);
    if (crypto.all_coins.length === 0) console.log('ERROR/FALLBACK detected in Crypto');

    console.log('\nTesting Stock Scanner...');
    const stocks = await scanStocks();
    console.log('Stock Data Source:', stocks.data_source);
    console.log('Stock Signals Found:', (stocks.signals || []).length);
    console.log('Stock Total Found:', (stocks.all_stocks || []).length);
}

test();
