const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

function getSupabase() {
    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase yapılandırılmamış. SUPABASE_URL ve SUPABASE_ANON_KEY env vars gerekli.');
        return null;
    }
    if (!supabase) {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
}

/**
 * Fırsatları Supabase'e kaydet
 */
async function saveOpportunities(module, opportunities) {
    const db = getSupabase();
    if (!db || !opportunities || !opportunities.length) return null;

    const rows = opportunities.map(opp => ({
        module,
        title: opp.title || opp.product_name || opp.coin_name || opp.name || 'Bilinmeyen',
        description: opp.description || opp.desc || '',
        data: opp,
        potential_profit: opp.potential_profit || opp.estimated_profit_tl || opp.budget_max || null,
        risk_level: opp.risk_level || opp.competition || null,
        confidence: opp.confidence || null
    }));

    const { data, error } = await db.from('opportunities').insert(rows);
    if (error) console.error('Supabase kayıt hatası:', error.message);
    return data;
}

/**
 * Raporu Supabase'e kaydet
 */
async function saveReport(report) {
    const db = getSupabase();
    if (!db) return null;

    const { data, error } = await db.from('reports').insert({
        title: report.title,
        total_opportunities: report.total_opportunities,
        report_data: report
    });
    if (error) console.error('Supabase rapor kayıt hatası:', error.message);
    return data;
}

/**
 * Son fırsatları getir
 */
async function getRecentOpportunities(module, limit = 20) {
    const db = getSupabase();
    if (!db) return [];

    let query = db.from('opportunities').select('*').order('created_at', { ascending: false }).limit(limit);
    if (module) query = query.eq('module', module);

    const { data, error } = await query;
    if (error) { console.error('Supabase okuma hatası:', error.message); return []; }
    return data || [];
}

module.exports = { getSupabase, saveOpportunities, saveReport, getRecentOpportunities };
