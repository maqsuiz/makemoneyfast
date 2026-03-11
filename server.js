const express = require('express');
const path = require('path');
const { scanCrypto } = require('./services/cryptoScanner');
const { scanEcommerce } = require('./services/ecommerceScanner');
const { scanStocks } = require('./services/stockScanner');
const { scanAITools } = require('./services/aiToolsScanner');
const { scanFreelance } = require('./services/freelanceScanner');
const { scanTrends } = require('./services/trendScanner');
const { generateReport } = require('./utils/reportGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Cache for scan results
let cache = {};
let cacheTime = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(key) {
    return cache[key] && cacheTime[key] && (Date.now() - cacheTime[key] < CACHE_TTL);
}

async function cachedScan(key, scanFn) {
    if (isCacheValid(key)) return cache[key];
    const result = await scanFn();
    cache[key] = result;
    cacheTime[key] = Date.now();
    return result;
}

// API Routes
app.get('/api/crypto', async (req, res) => {
    try { res.json(await cachedScan('crypto', scanCrypto)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ecommerce', async (req, res) => {
    try { res.json(await cachedScan('ecommerce', scanEcommerce)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stocks', async (req, res) => {
    try { res.json(await cachedScan('stocks', scanStocks)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ai-tools', async (req, res) => {
    try { res.json(await cachedScan('ai_tools', scanAITools)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/freelance', async (req, res) => {
    try { res.json(await cachedScan('freelance', scanFreelance)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/trends', async (req, res) => {
    try { res.json(await cachedScan('trends', scanTrends)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/report', async (req, res) => {
    try {
        const [crypto, ecommerce, stocks, ai_tools, freelance, trends] = await Promise.all([
            cachedScan('crypto', scanCrypto),
            cachedScan('ecommerce', scanEcommerce),
            cachedScan('stocks', scanStocks),
            cachedScan('ai_tools', scanAITools),
            cachedScan('freelance', scanFreelance),
            cachedScan('trends', scanTrends)
        ]);
        const report = generateReport({ crypto, ecommerce, stocks, ai_tools, freelance, trends });
        res.json(report);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Clear cache
app.post('/api/refresh', (req, res) => {
    cache = {};
    cacheTime = {};
    res.json({ success: true, message: 'Cache temizlendi, veriler yenilenecek.' });
});

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 ParaKazanma Dashboard çalışıyor!`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`📋 API Rapor: http://localhost:${PORT}/api/report\n`);
});
