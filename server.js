require('dotenv').config();
const express = require('express');
const path = require('path');
const { scanCrypto } = require('./services/cryptoScanner');
const { scanStocks } = require('./services/stockScanner');
const { scanAITools } = require('./services/aiToolsScanner');
const { scanFreelance } = require('./services/freelanceScanner');
const { scanTrends } = require('./services/trendScanner');
const { generateReport } = require('./utils/reportGenerator');
const { initDb, saveOpportunity } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Initialize Database
initDb().catch(err => console.error('Database connection failed:', err));

// Core API Endpoints
app.get('/api/crypto', async (req, res) => {
    try { res.json(await scanCrypto()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stocks', async (req, res) => {
    try { res.json(await scanStocks()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ai-tools', async (req, res) => {
    try { res.json(await scanAITools()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/freelance', async (req, res) => {
    try { res.json(await scanFreelance()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/trends', async (req, res) => {
    try { res.json(await scanTrends()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/report', async (req, res) => {
    try {
        const [crypto, stocks, ai_tools, freelance, trends] = await Promise.all([
            scanCrypto(),
            scanStocks(),
            scanAITools(),
            scanFreelance(),
            scanTrends()
        ]);

        const report = generateReport({
            crypto,
            stocks,
            ai_tools,
            freelance,
            trends
        });

        // Background persistence for high confidence results
        if (report.opportunities) {
            report.opportunities
                .filter(opp => opp.confidence > 85)
                .forEach(opp => saveOpportunity(opp).catch(err => console.error('DB Async Save Err:', err)));
        }

        res.json(report);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/refresh', (req, res) => {
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server live on port ${PORT}`);
});
