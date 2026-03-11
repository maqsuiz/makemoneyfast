const { scanStocks } = require('../services/stockScanner');
const { saveOpportunities } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    try {
        const data = await scanStocks();

        if (data.signals && data.signals.length) {
            await saveOpportunities('stocks', data.signals).catch(() => { });
        }

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
