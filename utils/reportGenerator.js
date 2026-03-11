/**
 * Rapor Oluşturucu
 * Tüm modüllerden gelen verileri birleştirip günlük rapor hazırlar
 */

function generateReport(allData) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const opportunities = [];

    // E-Commerce
    if (allData.ecommerce && allData.ecommerce.opportunities) {
        allData.ecommerce.opportunities.slice(0, 3).forEach(o => {
            opportunities.push({
                title: `${o.product_name} – %${o.price_difference_percent} price difference`,
                type: 'arbitrage', module: 'E-Commerce',
                description: `${o.cheapest_platform} at $${o.cheapest_price.toLocaleString('en-US')}, ${o.expensive_platform} at $${o.expensive_price.toLocaleString('en-US')}`,
                potential_profit: `$${o.estimated_profit_tl.toLocaleString('en-US')}`,
                risk_level: 'low', urgency: 'today', confidence: 85,
                links: o.links
            });
        });
    }

    // Crypto
    if (allData.crypto) {
        if (allData.crypto.arbitrage) {
            allData.crypto.arbitrage.slice(0, 2).forEach(a => {
                opportunities.push({
                    title: `${a.coin} Arbitrage: ${a.buy_exchange}→${a.sell_exchange} %${a.spread_percent}`,
                    type: 'crypto', module: 'Crypto',
                    description: `${a.buy_exchange} at $${a.buy_price}, ${a.sell_exchange} at $${a.sell_price}`,
                    potential_profit: `$${a.potential_profit_per_1000} (per $1000)`,
                    risk_level: 'medium', urgency: 'immediate', confidence: 72,
                    links: { buy: a.buy_exchange, sell: a.sell_exchange }
                });
            });
        }
        if (allData.crypto.opportunities) {
            allData.crypto.opportunities.filter(o => o.signal_type === 'dip' || o.signal_type === 'strong_dip').slice(0, 2).forEach(o => {
                opportunities.push({
                    title: `${o.coin_name} (${o.symbol}) – Dip Opportunity %${Math.abs(o.price_change_24h).toFixed(1)} drop`,
                    type: 'crypto', module: 'Crypto',
                    description: `24h change: %${o.price_change_24h.toFixed(1)}, Risk: ${o.risk_level}`,
                    potential_profit: 'Dip buy opportunity',
                    risk_level: o.risk_level, urgency: 'today', confidence: 65,
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
                type: 'stock', module: 'Stock',
                description: s.description,
                potential_profit: s.suggestion,
                risk_level: s.rsi < 30 ? 'medium' : 'high', urgency: s.urgency, confidence: s.confidence,
                links: { chart: s.chart_link }
            });
        });
    }

    // AI Tools
    if (allData.ai_tools && allData.ai_tools.tools) {
        allData.ai_tools.tools.filter(t => t.money_making_potential === 'High').slice(0, 2).forEach(t => {
            opportunities.push({
                title: `New KOMBAI Tool: ${t.name} – ${t.category}`,
                type: 'ai_tool', module: 'KOMBAI',
                description: t.description,
                potential_profit: t.use_cases[0],
                risk_level: 'low', urgency: 'this week', confidence: 78,
                links: { tool: t.link }
            });
        });
    }

    // Freelance
    if (allData.freelance && allData.freelance.top_opportunities) {
        allData.freelance.top_opportunities.slice(0, 2).forEach(j => {
            opportunities.push({
                title: `${j.platform}: ${j.title}`,
                type: 'freelance', module: 'Freelance',
                description: `Budget: $${j.budget_min}-$${j.budget_max} | Comp: ${j.competition}`,
                potential_profit: `$${j.budget_max}`,
                risk_level: 'low', urgency: j.urgency, confidence: 82,
                links: { job: j.link }
            });
        });
    }

    // Trends
    if (allData.trends && allData.trends.trends) {
        allData.trends.trends.filter(t => t.velocity.includes('Rising')).slice(0, 2).forEach(t => {
            opportunities.push({
                title: `Trend: ${t.topic}`,
                type: 'trend', module: 'Trend',
                description: `${t.platform} | ${t.velocity} | Engagement: ${t.engagement.toLocaleString()}`,
                potential_profit: t.money_angle,
                risk_level: 'low', urgency: 'this week', confidence: 70,
                links: { trend: t.link }
            });
        });
    }

    opportunities.sort((a, b) => b.confidence - a.confidence);

    return {
        title: `Daily Report – ${dateStr}`,
        generated_at: now.toISOString(),
        total_opportunities: opportunities.length,
        summary: `Today ${opportunities.length} opportunities found.`,
        highlights: opportunities.slice(0, 3).map(o => `${o.module}: ${o.title}`),
        opportunities,
        modules_scanned: Object.keys(allData).length,
        ai_recommendation: generateRecommendation(opportunities)
    };
}

function generateRecommendation(opps) {
    if (!opps.length) return 'No distinct opportunities found today. Keep monitoring the market.';
    const top = opps[0];
    return `Best opportunity today: "${top.title}". ${top.description}. Est. profit: ${top.potential_profit}. Risk: ${top.risk_level}. Do not miss it!`;
}

module.exports = { generateReport };
