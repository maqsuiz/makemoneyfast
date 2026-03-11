const { scanAITools } = require('../services/aiToolsScanner');
const { saveOpportunities } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    try {
        const data = await scanAITools();

        if (data.tools && data.tools.length) {
            await saveOpportunities('ai_tools', data.tools).catch(() => { });
        }

        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
