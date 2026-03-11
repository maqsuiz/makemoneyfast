const { scanFreelance } = require('../services/freelanceScanner');
const { saveOpportunities } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    try {
        const data = await scanFreelance();

        if (data.top_opportunities && data.top_opportunities.length) {
            await saveOpportunities('freelance', data.top_opportunities).catch(() => { });
        }

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
