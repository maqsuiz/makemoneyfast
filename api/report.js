const { scanCrypto } = require('../services/cryptoScanner');
const { scanEcommerce } = require('../services/ecommerceScanner');
const { scanStocks } = require('../services/stockScanner');
const { scanAITools } = require('../services/aiToolsScanner');
const { scanFreelance } = require('../services/freelanceScanner');
const { scanTrends } = require('../services/trendScanner');
const { generateReport } = require('../utils/reportGenerator');
const { saveReport } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    try {
        const [crypto, ecommerce, stocks, ai_tools, freelance, trends] = await Promise.all([
            scanCrypto(),
            scanEcommerce(),
            scanStocks(),
            scanAITools(),
            scanFreelance(),
            scanTrends()
        ]);

        const report = generateReport({ crypto, ecommerce, stocks, ai_tools, freelance, trends });

        // Supabase'e kaydet (yapılandırılmışsa)
        await saveReport(report).catch(() => { });

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
