const { scanTrends } = require('../services/trendScanner');
const { saveOpportunities } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    try {
        const data = await scanTrends();

        if (data.trends && data.trends.length) {
            await saveOpportunities('trends', data.trends).catch(() => { });
        }

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
