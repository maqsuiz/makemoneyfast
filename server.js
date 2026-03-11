require('dotenv').config();
const express = require('express');
const path = require('path');
const { scanCrypto } = require('./services/cryptoScanner');
const { scanStocks } = require('./services/stockScanner');
const { scanAITools } = require('./services/aiToolsScanner');
const { scanFreelance } = require('./services/freelanceScanner');
const { scanTrends } = require('./services/trendScanner');
const { generateReport } = require('./utils/reportGenerator');
const { initDb, saveOpportunity, getRecentOpportunities, deleteOpportunity, getStats } = require('./lib/db');

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
        const [crypto, stocks, ai_tools, freelance, trends, saved_opps] = await Promise.all([
            scanCrypto(),
            scanStocks(),
            scanAITools(),
            scanFreelance(),
            scanTrends(),
            getRecentOpportunities(20)
        ]);

        const report = generateReport({
            crypto,
            stocks,
            ai_tools,
            freelance,
            trends,
            saved_opps // Pass saved opportunities to generator
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

// Admin API
app.get('/api/admin/stats', async (req, res) => {
    try { res.json(await getStats()); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/opportunities', async (req, res) => {
    try { res.json(await getRecentOpportunities(100)); }
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/opportunities', async (req, res) => {
    try {
        const id = await saveOpportunity(req.body);
        res.json({ success: true, id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/opportunities/:id', async (req, res) => {
    try {
        await deleteOpportunity(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server live on port ${PORT}`);
});
