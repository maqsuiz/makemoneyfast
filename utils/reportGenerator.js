/**
 * Rapor Oluşturucu
 * Tüm modüllerden gelen verileri birleştirip günlük rapor hazırlar
 */

function generateReport(allData) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    const opportunities = [];

    // E-Commerce
    if (allData.ecommerce && allData.ecommerce.opportunities) {
        allData.ecommerce.opportunities.slice(0, 3).forEach(o => {
            opportunities.push({
                title: `${o.product_name} – %${o.price_difference_percent} fiyat farkı`,
                type: 'arbitrage', module: '🛒 E-Ticaret',
                description: `${o.cheapest_platform}'da ${o.cheapest_price.toLocaleString('tr-TR')}₺, ${o.expensive_platform}'da ${o.expensive_price.toLocaleString('tr-TR')}₺`,
                potential_profit: `${o.estimated_profit_tl.toLocaleString('tr-TR')}₺`,
                risk_level: 'düşük', urgency: 'bugün', confidence: 85,
                links: o.links
            });
        });
    }

    // Crypto
    if (allData.crypto) {
        if (allData.crypto.arbitrage) {
            allData.crypto.arbitrage.slice(0, 2).forEach(a => {
                opportunities.push({
                    title: `${a.coin} Arbitraj: ${a.buy_exchange}→${a.sell_exchange} %${a.spread_percent}`,
                    type: 'crypto', module: '₿ Kripto',
                    description: `${a.buy_exchange}'da $${a.buy_price}, ${a.sell_exchange}'de $${a.sell_price}`,
                    potential_profit: `$${a.potential_profit_per_1000} (her $1000 için)`,
                    risk_level: 'orta', urgency: 'hemen', confidence: 72,
                    links: { buy: a.buy_exchange, sell: a.sell_exchange }
                });
            });
        }
        if (allData.crypto.opportunities) {
            allData.crypto.opportunities.filter(o => o.signal_type === 'dip' || o.signal_type === 'strong_dip').slice(0, 2).forEach(o => {
                opportunities.push({
                    title: `${o.coin_name} (${o.symbol}) – Dip Fırsatı %${Math.abs(o.price_change_24h).toFixed(1)} düşüş`,
                    type: 'crypto', module: '₿ Kripto',
                    description: `24s değişim: %${o.price_change_24h.toFixed(1)}, Risk: ${o.risk_level}`,
                    potential_profit: 'Dip alım fırsatı',
                    risk_level: o.risk_level, urgency: 'bugün', confidence: 65,
                    links: { detail: o.action_link }
                });
            });
        }
    }

    // Stocks
    if (allData.stocks && allData.stocks.signals) {
        allData.stocks.signals.slice(0, 2).forEach(s => {
            opportunities.push({
                title: `${s.ticker} – ${s.signal_label}`,
                type: 'stock', module: '📈 Hisse',
                description: s.description,
                potential_profit: s.suggestion,
                risk_level: s.rsi < 30 ? 'orta' : 'yüksek', urgency: s.urgency, confidence: s.confidence,
                links: { chart: s.chart_link }
            });
        });
    }

    // AI Tools
    if (allData.ai_tools && allData.ai_tools.tools) {
        allData.ai_tools.tools.filter(t => t.money_making_potential === 'Yüksek').slice(0, 2).forEach(t => {
            opportunities.push({
                title: `Yeni AI Aracı: ${t.name} – ${t.category}`,
                type: 'ai_tool', module: '🤖 AI',
                description: t.description,
                potential_profit: t.use_cases[0],
                risk_level: 'düşük', urgency: 'bu hafta', confidence: 78,
                links: { tool: t.link }
            });
        });
    }

    // Freelance
    if (allData.freelance && allData.freelance.top_opportunities) {
        allData.freelance.top_opportunities.slice(0, 2).forEach(j => {
            opportunities.push({
                title: `${j.platform}: ${j.title}`,
                type: 'freelance', module: '💼 Freelance',
                description: `Bütçe: $${j.budget_min}-$${j.budget_max} | Rekabet: ${j.competition}`,
                potential_profit: `$${j.budget_max}`,
                risk_level: 'düşük', urgency: j.urgency, confidence: 82,
                links: { job: j.link }
            });
        });
    }

    // Trends
    if (allData.trends && allData.trends.trends) {
        allData.trends.trends.filter(t => t.velocity.includes('Yüksel')).slice(0, 2).forEach(t => {
            opportunities.push({
                title: `Trend: ${t.topic}`,
                type: 'trend', module: '📊 Trend',
                description: `${t.platform} | ${t.velocity} | Engagement: ${t.engagement.toLocaleString()}`,
                potential_profit: t.money_angle,
                risk_level: 'düşük', urgency: 'bu hafta', confidence: 70,
                links: { trend: t.link }
            });
        });
    }

    opportunities.sort((a, b) => b.confidence - a.confidence);

    return {
        title: `📋 Günlük Fırsat Raporu – ${dateStr}`,
        generated_at: now.toISOString(),
        total_opportunities: opportunities.length,
        summary: `Bugün ${opportunities.length} fırsat bulundu.`,
        highlights: opportunities.slice(0, 3).map(o => `${o.module}: ${o.title}`),
        opportunities,
        modules_scanned: Object.keys(allData).length,
        ai_recommendation: generateRecommendation(opportunities)
    };
}

function generateRecommendation(opps) {
    if (!opps.length) return 'Bugün belirgin bir fırsat bulunamadı. Piyasayı takip etmeye devam edin.';
    const top = opps[0];
    return `🎯 Bugünkü en güçlü fırsat: "${top.title}". ${top.description}. Tahmini kazanç: ${top.potential_profit}. Risk: ${top.risk_level}. Bu fırsatı kaçırmayın!`;
}

module.exports = { generateReport };
