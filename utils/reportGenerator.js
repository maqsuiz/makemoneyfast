function generateReport(allData) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const opportunities = [];

    // Crypto
    if (allData.crypto) {
        if (allData.crypto.arbitrage) {
            allData.crypto.arbitrage.slice(0, 3).forEach(a => {
                opportunities.push({
                    title: `${a.coin} Arbitrage spread: %${a.spread_percent}`,
                    type: 'crypto', module: 'crypto',
                    description: `${a.buy_exchange} ($${a.buy_price}) -> ${a.sell_exchange} ($${a.sell_price})`,
                    potential_profit: a.potential_profit_per_1000,
                    risk_level: 'low', urgency: 'immediate', confidence: 90,
                    links: { buy: a.buy_exchange, sell: a.sell_exchange }
                });
            });
        }
        if (allData.crypto.all_coins) {
            allData.crypto.all_coins.filter(o => o.signal_type !== 'neutral').slice(0, 3).forEach(o => {
                opportunities.push({
                    title: `${o.symbol} – ${o.signal_type}`,
                    type: 'crypto', module: 'crypto',
                    description: `Price: $${o.current_price}, 24h: ${o.price_change_24h.toFixed(2)}%`,
                    potential_profit: 0,
                    risk_level: o.risk_level, urgency: 'today', confidence: 80,
                    links: { detail: o.action_link }
                });
            });
        }
    }

    // Stocks
    if (allData.stocks && allData.stocks.signals) {
        allData.stocks.signals.slice(0, 3).forEach(s => {
            opportunities.push({
                title: `${s.ticker} – ${s.signal_label}`,
                type: 'stock', module: 'stock',
                description: s.description,
                potential_profit: 0,
                risk_level: 'medium', urgency: s.urgency, confidence: s.confidence,
                links: { chart: s.chart_link }
            });
        });
    }

    // AI Tools
    if (allData.ai_tools && allData.ai_tools.tools) {
        allData.ai_tools.tools.filter(t => t.money_making_potential === 'High').slice(0, 3).forEach(t => {
            opportunities.push({
                title: `AI: ${t.name}`,
                type: 'ai', module: 'ai',
                description: t.description,
                potential_profit: 0,
                risk_level: 'low', urgency: 'this week', confidence: 85,
                links: { tool: t.link }
            });
        });
    }

    // Freelance
    if (allData.freelance && allData.freelance.top_opportunities) {
        allData.freelance.top_opportunities.slice(0, 3).forEach(j => {
            opportunities.push({
                title: `Freelance: ${j.title}`,
                type: 'freelance', module: 'freelance',
                description: `$${j.budget_min}-$${j.budget_max} on ${j.platform}`,
                potential_profit: j.budget_max,
                risk_level: 'low', urgency: j.urgency, confidence: 82,
                links: { job: j.link }
            });
        });
    }

    // Trends
    if (allData.trends && allData.trends.trends) {
        allData.trends.trends.slice(0, 3).forEach(t => {
            opportunities.push({
                title: `Trend: ${t.topic}`,
                type: 'trend', module: 'trend',
                description: t.money_angle,
                potential_profit: 0,
                risk_level: 'low', urgency: 'today', confidence: 75,
                links: { trend: t.link }
            });
        });
    }

    opportunities.sort((a, b) => b.confidence - a.confidence);

    return {
        title: `Financial Opportunities Report – ${dateStr}`,
        summary: `${opportunities.length} high-potential items detected across markets.`,
        highlights: opportunities.slice(0, 3).map(o => `${o.module.toUpperCase()}: ${o.title}`),
        opportunities,
        total_opportunities: opportunities.length,
        ai_recommendation: generateRecommendation(opportunities)
    };
}

function generateRecommendation(opps) {
    if (!opps.length) return 'Market is quiet. Keep watching for dips.';
    const best = opps[0];
    return `AI Advisor: Top signal is ${best.title} in ${best.module}. Confidence: ${best.confidence}%.`;
}

module.exports = { generateReport };
