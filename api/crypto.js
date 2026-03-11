const { scanCrypto } = require('../services/cryptoScanner');
const { saveOpportunities } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    try {
        const data = await scanCrypto();

        // Supabase'e kaydet (yapılandırılmışsa)
        if (data.opportunities && data.opportunities.length) {
            await saveOpportunities('crypto', data.opportunities).catch(() => { });
        }

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
