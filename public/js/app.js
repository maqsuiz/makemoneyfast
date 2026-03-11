/* ParaKazanma Dashboard – Frontend Logic */

const API = {
  report: '/api/report',
  crypto: '/api/crypto',
  ecommerce: '/api/ecommerce',
  stocks: '/api/stocks',
  'ai-tools': '/api/ai-tools',
  freelance: '/api/freelance',
  trends: '/api/trends'
};

let currentTab = 'report';
let dataCache = {};

// Init
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupRefresh();
  loadTab('report');
});

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      loadTab(currentTab);
    });
  });
}

function setupRefresh() {
  document.getElementById('btnRefresh').addEventListener('click', async () => {
    const btn = document.getElementById('btnRefresh');
    btn.classList.add('spinning');
    dataCache = {};
    await fetch('/api/refresh', { method: 'POST' });
    await loadTab(currentTab);
    btn.classList.remove('spinning');
  });
}

async function loadTab(tab) {
  showLoading(true);
  try {
    const url = API[tab];
    if (!dataCache[tab]) {
      const res = await fetch(url);
      dataCache[tab] = await res.json();
    }
    renderTab(tab, dataCache[tab]);
    updateTime();
    if (tab === 'report') updateSummaryBar(dataCache[tab]);
  } catch (e) {
    document.getElementById('tabContent').innerHTML = `<div class="card"><p style="color:var(--red)">Veri yüklenemedi: ${e.message}</p></div>`;
  }
  showLoading(false);
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
  document.getElementById('tabContent').style.display = show ? 'none' : 'block';
}

function updateTime() {
  document.getElementById('updateTime').textContent = 'Last: ' + new Date().toLocaleTimeString('en-US');
}

function updateSummaryBar(report) {
  document.getElementById('totalOpps').textContent = report.total_opportunities || 0;
  document.getElementById('aiRecommendation').textContent = report.ai_recommendation || '';

  // Count by type
  const opps = report.opportunities || [];
  document.getElementById('ecomOpps').textContent = opps.filter(o => o.type === 'arbitrage').length;
  document.getElementById('cryptoOpps').textContent = opps.filter(o => o.type === 'crypto').length;
  document.getElementById('stockOpps').textContent = opps.filter(o => o.type === 'stock').length;
  document.getElementById('freelanceOpps').textContent = opps.filter(o => o.type === 'freelance').length;
  document.getElementById('aiOpps').textContent = opps.filter(o => o.type === 'ai_tool').length;
}

// ============ RENDERERS ============

function renderTab(tab, data) {
  const container = document.getElementById('tabContent');
  const renderers = {
    'report': renderReport,
    'ecommerce': renderEcommerce,
    'crypto': renderCrypto,
    'stocks': renderStocks,
    'ai-tools': renderAITools,
    'freelance': renderFreelance,
    'trends': renderTrends
  };
  container.innerHTML = renderers[tab] ? renderers[tab](data) : '<p>Bilinmeyen sekme</p>';
}

function renderReport(data) {
  const opps = data.opportunities || [];
  return `
    <div class="report-header">
      <h2>${data.title || 'Günlük Rapor'}</h2>
      <p>${data.summary || ''}</p>
      ${data.highlights ? `<div class="report-highlights">${data.highlights.map(h => `<span class="highlight-chip">${h}</span>`).join('')}</div>` : ''}
    </div>
    <div class="section-header">
      <div class="section-title">ALL OPPORTUNITIES (By Confidence)</div>
    </div>
    <div class="opp-list">
      ${opps.map((o, i) => `
        <div class="opp-item" style="animation-delay:${i * 0.05}s">
          <div class="opp-number">${i + 1}</div>
          <div class="opp-content">
            <div class="opp-title">${o.title}</div>
            <div class="opp-desc">${o.description}</div>
            <div class="opp-meta">
              <span class="meta-tag">${o.module}</span>
              <span class="meta-tag">${o.potential_profit}</span>
              <span class="meta-tag ${o.risk_level === 'düşük' ? 'badge-green' : o.risk_level === 'yüksek' ? 'badge-red' : 'badge-yellow'}"">Risk: ${o.risk_level}</span>
              <span class="meta-tag">TIME: ${o.urgency}</span>
              <span class="meta-tag">CONF: %${o.confidence}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderEcommerce(data) {
  const opps = data.opportunities || [];
  return `
    <div class="section-header">
      <div>
        <div class="section-title">E-COMMERCE ARBITRAGE</div>
        <div class="section-subtitle">${data.data_source} • ${opps.length} opportunities found</div>
      </div>
    </div>
    <div class="card-grid">
      ${opps.map((o, i) => `
        <div class="card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${o.product_name}</span>
            <span class="card-badge badge-green">%${o.price_difference_percent} fark</span>
          </div>
          <div class="card-body">
            ${Object.entries(o.all_prices).map(([plat, price]) => `
              <div class="price-row">
                <span class="platform">${plat}</span>
                <span class="price ${price === o.cheapest_price ? 'cheapest' : price === o.expensive_price ? 'expensive' : ''}">${price.toLocaleString('tr-TR')}₺</span>
              </div>
            `).join('')}
            <div class="profit-highlight">
              <span class="label">Tahmini Kar:</span>
              <span class="value">${o.estimated_profit_tl.toLocaleString('tr-TR')}₺</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="meta-tag">${o.category}</span>
            <a class="card-link" href="${o.links.amazon || '#'}" target="_blank">En Ucuz Gör</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderCrypto(data) {
  const coins = data.all_coins && data.all_coins.length ? data.all_coins : data.opportunities || [];
  const arb = data.arbitrage || [];
  return `
    <div class="section-header">
      <div>
        <div class="section-title">CRYPTO MARKET</div>
        <div class="section-subtitle">${data.data_source}</div>
      </div>
    </div>
    ${arb.length ? `
    <div style="margin-bottom:24px">
      <h3 style="font-size:15px;font-weight:700;margin-bottom:12px">ARBITRAGE OPPORTUNITIES</h3>
      <div class="card-grid">
        ${arb.map((a, i) => `
          <div class="card" style="animation-delay:${i * 0.06}s">
            <div class="card-header">
              <span class="card-title">${a.coin_name} (${a.coin})</span>
              <span class="card-badge badge-green">%${a.spread_percent} spread</span>
            </div>
            <div class="card-body">
              <div class="price-row"><span class="platform">BUY: ${a.buy_exchange}</span><span class="price cheapest">$${a.buy_price}</span></div>
              <div class="price-row"><span class="platform">SELL: ${a.sell_exchange}</span><span class="price expensive">$${a.sell_price}</span></div>
              <div class="profit-highlight">
                <span class="label">Profit per $1000:</span>
                <span class="value">$${a.potential_profit_per_1000}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px">MARKET DATA</h3>
    <div class="card" style="overflow-x:auto">
      <table class="crypto-table">
        <thead><tr><th>Coin</th><th>Price</th><th>24h Change</th><th>Signal</th><th>Risk</th><th></th></tr></thead>
        <tbody>
          ${coins.slice(0, 15).map(c => `
            <tr>
              <td><div class="crypto-coin">${c.image ? `<img src="${c.image}" alt="${c.symbol}">` : ''}<div><div class="name">${c.coin_name || c.name}</div><div class="symbol">${c.symbol}</div></div></div></td>
              <td>$${(c.current_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="${(c.price_change_24h || 0) >= 0 ? 'change-positive' : 'change-negative'}">${(c.price_change_24h || 0) >= 0 ? '+' : ''}${(c.price_change_24h || 0).toFixed(2)}%</td>
              <td><span class="meta-tag">${formatSignal(c.signal_type)}</span></td>
              <td><span class="card-badge ${c.risk_level === 'low' ? 'badge-green' : c.risk_level === 'high' ? 'badge-red' : 'badge-yellow'}">${c.risk_level || '-'}</span></td>
              <td><a class="card-link" href="${c.action_link || '#'}" target="_blank">Details</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderStocks(data) {
  const signals = data.signals || [];
  const stocks = data.all_stocks || [];
  const ms = data.market_summary || {};
  return `
    <div class="section-header">
      <div>
        <div class="section-title">STOCK SCANNER</div>
        <div class="section-subtitle">${data.data_source}</div>
      </div>
    </div>
    <div class="summary-bar" style="padding:0 0 16px 0;grid-template-columns:repeat(5,1fr)">
      <div class="summary-card"><div><span class="summary-value ${ms.bist100_change >= 0 ? 'change-positive' : 'change-negative'}">${ms.bist100_change >= 0 ? '+' : ''}${ms.bist100_change}%</span><span class="summary-label">BIST 100</span></div></div>
      <div class="summary-card"><div><span class="summary-value ${ms.sp500_change >= 0 ? 'change-positive' : 'change-negative'}">${ms.sp500_change >= 0 ? '+' : ''}${ms.sp500_change}%</span><span class="summary-label">S&P 500</span></div></div>
      <div class="summary-card"><div><span class="summary-value ${ms.nasdaq_change >= 0 ? 'change-positive' : 'change-negative'}">${ms.nasdaq_change >= 0 ? '+' : ''}${ms.nasdaq_change}%</span><span class="summary-label">NASDAQ</span></div></div>
      <div class="summary-card"><div><span class="summary-value">${ms.usd_try}₺</span><span class="summary-label">USD/TRY</span></div></div>
      <div class="summary-card"><div><span class="summary-value">${ms.eur_try}₺</span><span class="summary-label">EUR/TRY</span></div></div>
    </div>
    ${signals.length ? `
    <h3 style="font-size:15px;font-weight:700;margin-bottom:12px">ACTIVE SIGNALS</h3>
    <div class="card-grid">
      ${signals.map((s, i) => `
        <div class="card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${s.ticker} – ${s.name}</span>
            <span class="card-badge ${s.signal_type === 'oversold' ? 'badge-green' : s.signal_type === 'overbought' ? 'badge-red' : 'badge-yellow'}">${s.signal_label}</span>
          </div>
          <div class="card-body">
            <p>${s.description}</p>
            <p style="color:var(--accent-3);margin-top:8px">INFO: ${s.suggestion}</p>
            <div class="card-meta">
              <span class="meta-tag">PRICE: ${s.price.toLocaleString('en-US')} ${s.market === 'BIST' ? '₺' : '$'}</span>
              <span class="meta-tag">RSI: ${s.rsi}</span>
              <span class="meta-tag">CONF: %${s.confidence}</span>
              <span class="meta-tag">TIME: ${s.urgency}</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="meta-tag">${s.market} • ${s.sector}</span>
            <a class="card-link" href="${s.chart_link}" target="_blank">Go to Chart</a>
          </div>
        </div>
      `).join('')}
    </div>` : '<p style="color:var(--text-muted)">No active signals found.</p>'}`;
}

function renderAITools(data) {
  const tools = data.tools || [];
  return `
    <div class="section-header">
      <div>
        <div class="section-title">KOMBAI TOOLS</div>
        <div class="section-subtitle">${data.data_source} • ${tools.length} results</div>
      </div>
    </div>
    <div class="card-grid">
      ${tools.map((t, i) => `
        <div class="card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${t.name}</span>
            <span class="tool-trend trend-${t.trend}">${t.trend === 'hot' ? 'HOT' : t.trend === 'rising' ? 'RISING' : 'STABLE'}</span>
          </div>
          <div class="card-body">
            <p>${t.description}</p>
            <div class="card-meta" style="margin-top:8px">
              <span class="meta-tag">${t.category}</span>
              <span class="meta-tag">PRICE: ${t.pricing}</span>
              <span class="meta-tag">UP: ${t.upvotes}</span>
              <span class="card-badge ${t.money_making_potential === 'High' ? 'badge-green' : 'badge-yellow'}">PROFIT: ${t.money_making_potential}</span>
            </div>
            <ul class="use-cases">
              ${t.use_cases.map(u => `<li>${u}</li>`).join('')}
            </ul>
          </div>
          <div class="card-footer">
            <span class="meta-tag">${t.launch_date}</span>
            <a class="card-link" href="${t.link}" target="_blank">Review Tool</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderFreelance(data) {
  const jobs = data.top_opportunities || data.all_jobs || [];
  const s = data.summary || {};
  return `
    <div class="section-header">
      <div>
        <div class="section-title">FREELANCE JOBS</div>
        <div class="section-subtitle">${data.data_source} • ${jobs.length} results</div>
      </div>
    </div>
    <div class="summary-bar" style="padding:0 0 16px 0;grid-template-columns:repeat(4,1fr)">
      <div class="summary-card"><div><span class="summary-value">${s.total_jobs || 0}</span><span class="summary-label">Total Jobs</span></div></div>
      <div class="summary-card"><div><span class="summary-value">${s.high_budget || 0}</span><span class="summary-label">$500+ Budget</span></div></div>
      <div class="summary-card"><div><span class="summary-value">${s.low_competition || 0}</span><span class="summary-label">Low Competition</span></div></div>
      <div class="summary-card"><div><span class="summary-value">$${(s.total_potential || 0).toLocaleString()}</span><span class="summary-label">Total Potential</span></div></div>
    </div>
    <div class="card-grid">
      ${jobs.map((j, i) => `
        <div class="card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${j.title}</span>
            <span class="card-badge ${j.competition === 'Low' ? 'badge-green' : j.competition === 'High' ? 'badge-red' : 'badge-yellow'}">${j.competition} Competition</span>
          </div>
          <div class="card-body">
            <p>${j.desc}</p>
            <div class="card-meta" style="margin-top:10px">
              <span class="meta-tag">${j.platform}</span>
              <span class="meta-tag">BUDGET: ${j.currency === 'TRY' ? '' : ' $'}${j.budget_min}-${j.budget_max}${j.currency === 'TRY' ? ' ₺' : ''}</span>
              <span class="meta-tag">RATE: ${j.client_rating}</span>
              <span class="meta-tag">PROPOSALS: ${j.proposals}</span>
              <span class="meta-tag">TIME: ${j.hours_ago}h ago</span>
            </div>
            <div class="skill-tags" style="margin-top:8px">
              ${j.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div class="card-footer">
            <span class="meta-tag ${j.urgency === 'immediate' ? 'badge-red' : j.urgency === 'today' ? 'badge-yellow' : ''}">${j.urgency}</span>
            <a class="card-link" href="${j.link}" target="_blank">View Job</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderTrends(data) {
  const trends = data.trends || [];
  return `
    <div class="section-header">
      <div>
        <div class="section-title">TRENDS & SOCIAL</div>
        <div class="section-subtitle">${data.data_source} • ${trends.length} results</div>
      </div>
    </div>
    <div class="card-grid">
      ${trends.map((t, i) => `
        <div class="card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${t.topic}</span>
            <span class="tool-trend ${t.velocity.includes('Rapidly') ? 'trend-hot' : t.velocity.includes('Rising') ? 'trend-rising' : 'trend-stable'}">${t.velocity}</span>
          </div>
          <div class="card-body">
            <p style="color:var(--accent-3);font-weight:600">INFO: ${t.money_angle}</p>
            <div class="card-meta" style="margin-top:10px">
              <span class="meta-tag">${t.platform}</span>
              <span class="meta-tag">ENGAGEMENT: ${t.engagement.toLocaleString()}</span>
              <span class="meta-tag ${t.sentiment === 'Positive' || t.sentiment === 'Very Positive' || t.sentiment === 'Bullish' ? 'badge-green' : t.sentiment === 'Negative' ? 'badge-red' : 'badge-yellow'}">${t.sentiment}</span>
              <span class="meta-tag">${t.category}</span>
            </div>
            ${t.related ? `<div class="skill-tags" style="margin-top:8px">${t.related.map(r => `<span class="skill-tag">${r}</span>`).join('')}</div>` : ''}
          </div>
          <div class="card-footer">
            <span></span>
            <a class="card-link" href="${t.link}" target="_blank">See Trend</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

// Helpers
function formatSignal(type) {
  const map = {
    'strong_dip': 'STRONG DIP',
    'dip': 'DIP',
    'pump': 'PUMP',
    'rising': 'RISING',
    'neutral': 'NEUTRAL'
  };
  return map[type] || type || '—';
}
