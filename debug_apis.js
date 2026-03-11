require('dotenv').config();
const fetch = require('node-fetch');

async function testBinance() {
    console.log('Testing Binance...');
    const url = (process.env.BINANCE_API_URL || 'https://api.binance.com') + '/api/v3/ticker/24hr';
    try {
        const res = await fetch(url);
        console.log('Binance Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Binance Data Sample:', data.slice(0, 2));
            const targetSymbols = ['BTCUSDT', 'ETHUSDT'];
            const filtered = data.filter(t => targetSymbols.includes(t.symbol));
            console.log('Filtered Count:', filtered.length);
        }
    } catch (e) {
        console.error('Binance Error:', e.message);
    }
}

async function testPolygon() {
    console.log('\nTesting Polygon...');
    const key = process.env.POLYGON_API_KEY;
    console.log('Key exists:', !!key);
    const ticker = 'AAPL';
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${key}`;
    try {
        const res = await fetch(url);
        console.log('Polygon Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Polygon Data:', JSON.stringify(data, null, 2));
        } else {
            const text = await res.text();
            console.error('Polygon Error Body:', text);
        }
    } catch (e) {
        console.error('Polygon Error:', e.message);
    }
}

async function run() {
    await testBinance();
    await testPolygon();
}

run();
