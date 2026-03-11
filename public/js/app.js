/* Dashboard Frontend Logic */
const API = {
  report: '/api/report',
  crypto: '/api/crypto',
  stocks: '/api/stocks',
  'ai-tools': '/api/ai-tools',
  freelance: '/api/freelance',
  trends: '/api/trends'
};

let currentTab = 'report';
let dataCache = {};

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
    try {
      await fetch('/api/refresh', { method: 'POST' });
      await loadTab(currentTab);
    } catch (e) { }
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
    updateHeaderInfo();
    if (tab === 'report') updateSummaryBar(dataCache[tab]);
  } catch (e) {
    document.getElementById('tabContent').innerHTML = `<div class="card animate-in"><p style="color:var(--red)">Error: ${e.message}</p></div>`;
  }
  showLoading(false);
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
  document.getElementById('tabContent').style.display = show ? 'none' : 'block';
}

function updateHeaderInfo() {
  document.getElementById('updateTime').textContent = 'Last: ' + new Date().toLocaleTimeString('en-US');
}

function updateSummaryBar(report) {
  document.getElementById('totalOpps').textContent = report.total_opportunities || 0;
  document.getElementById('aiRecommendation').textContent = report.ai_recommendation || '';
  const opps = report.opportunities || [];
  document.getElementById('cryptoOpps').textContent = opps.filter(o => o.module.toLowerCase() === 'crypto').length;
  document.getElementById('stockOpps').textContent = opps.filter(o => o.module.toLowerCase() === 'stock').length;
  document.getElementById('freelanceOpps').textContent = opps.filter(o => o.module.toLowerCase() === 'freelance').length;
  document.getElementById('aiOpps').textContent = opps.filter(o => o.module.toLowerCase().includes('ai')).length;
}

function renderTab(tab, data) {
  const container = document.getElementById('tabContent');
  const renderers = {
    'report': renderReport,
    'crypto': renderCrypto,
    'stocks': renderStocks,
    'ai-tools': renderAITools,
    'freelance': renderFreelance,
    'trends': renderTrends
  };
  container.innerHTML = renderers[tab] ? renderers[tab](data) : '<p>Module under construction</p>';
}

function renderReport(data) {
  const opps = data.opportunities || [];
  return `
    <div class="report-header animate-in">
      <h2>${data.title || 'Market Scan Report'}</h2>
      <p>${data.summary || ''}</p>
      <div class="report-highlights">
        ${(data.highlights || []).map(h => `<span class="highlight-chip">${h}</span>`).join('')}
      </div>
    </div>
    <div class="opp-list">
      ${opps.map((o, i) => `
        <div class="opp-item animate-in" style="animation-delay:${i * 0.05}s">
          <div class="opp-number">${i + 1}</div>
          <div class="opp-content">
            <div class="opp-title">${o.title}</div>
            <div class="opp-desc">${o.description}</div>
            <div class="opp-meta">
              <span class="meta-tag">${o.module}</span>
              <span class="meta-tag badge-green">$${(o.potential_profit || 0).toLocaleString()}</span>
              <span class="meta-tag">Conf: ${o.confidence}%</span>
              <span class="meta-tag">Risk: ${o.risk_level}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderCrypto(data) {
  const coins = data.all_coins || [];
  const arb = data.arbitrage || [];
  return `
    <div class="section-header animate-in">
      <div>
        <div class="section-title">CRYPTO MARKET</div>
        <div class="section-subtitle">${data.data_source}</div>
      </div>
    </div>
    ${arb.length ? `
    <div class="card-grid" style="margin-bottom:30px">
      ${arb.map((a, i) => `
        <div class="card animate-in" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${a.coin} Arbitrage</span>
            <span class="card-badge badge-green">${a.spread_percent}% Spread</span>
          </div>
          <div class="card-body">
            <div class="price-row"><span class="platform">Buy: ${a.buy_exchange}</span><span class="price">$${a.buy_price}</span></div>
            <div class="price-row"><span class="platform">Sell: ${a.sell_exchange}</span><span class="price">$${a.sell_price}</span></div>
            <div class="profit-highlight">
              <span class="label">Profit / $1k:</span>
              <span class="value">$${a.potential_profit_per_1000}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>` : ''}
    <div class="card animate-in" style="overflow-x:auto;padding:0">
      <table class="crypto-table">
        <thead><tr><th>Coin</th><th>Price</th><th>24h Change</th><th>Signal</th><th>Risk</th></tr></thead>
        <tbody>
          ${coins.map(c => `
            <tr>
              <td><div class="crypto-coin"><div><div class="name">${c.symbol}</div></div></div></td>
              <td>$${(c.current_price || 0).toLocaleString()}</td>
              <td class="${c.price_change_24h >= 0 ? 'change-positive' : 'change-negative'}">${c.price_change_24h > 0 ? '+' : ''}${c.price_change_24h.toFixed(2)}%</td>
              <td><span class="meta-tag">${c.signal_type}</span></td>
              <td><span class="card-badge ${c.risk_level === 'low' ? 'badge-green' : 'badge-yellow'}">${c.risk_level}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderStocks(data) {
  const stocks = data.all_stocks || [];
  const signals = data.signals || [];
  return `
    <div class="section-header animate-in">
      <div>
        <div class="section-title">STOCKS SCANNER</div>
        <div class="section-subtitle">${data.data_source}</div>
      </div>
    </div>
    <div class="card-grid">
      ${stocks.map((s, i) => `
        <div class="card animate-in" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${s.ticker} – ${s.name}</span>
            <span class="card-badge ${s.change_percent >= 0 ? 'badge-green' : 'badge-red'}">${s.change_percent > 0 ? '+' : ''}${s.change_percent.toFixed(2)}%</span>
          </div>
          <div class="card-body">
            <div class="price-row"><span class="platform">Last Price</span><span class="price">$${s.price}</span></div>
            <div class="card-meta">
              <span class="meta-tag">RSI: ${s.rsi}</span>
              <span class="meta-tag">Sector: ${s.sector}</span>
            </div>
          </div>
          <div class="card-footer">
            <a class="card-link" href="${s.chart_link}" target="_blank">View Charts</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderAITools(data) {
  const tools = data.tools || [];
  return `
    <div class="section-header animate-in">
      <div class="section-title">NEW AI TOOLS</div>
    </div>
    <div class="card-grid">
      ${tools.map((t, i) => `
        <div class="card animate-in" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${t.name}</span>
            <span class="card-badge badge-blue">${t.trend}</span>
          </div>
          <div class="card-body">
            <p>${t.description}</p>
            <div class="card-meta">
              <span class="meta-tag">${t.pricing}</span>
              <span class="meta-tag">POTENTIAL: ${t.money_making_potential}</span>
            </div>
          </div>
          <div class="card-footer">
            <a class="card-link" href="${t.link}" target="_blank">Access Tool</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderFreelance(data) {
  const jobs = data.top_opportunities || [];
  return `
    <div class="section-header animate-in">
      <div class="section-title">HIGH-YIELD FREELANCE</div>
    </div>
    <div class="card-grid">
      ${jobs.map((j, i) => `
        <div class="card animate-in" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${j.title}</span>
            <span class="card-badge badge-yellow">$${j.budget_min}-$${j.budget_max}</span>
          </div>
          <div class="card-body">
            <p>${j.desc}</p>
            <div class="skill-tags">
              ${j.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div class="card-footer">
            <span class="meta-tag">${j.platform}</span>
            <a class="card-link" href="${j.link}" target="_blank">Apply Now</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function renderTrends(data) {
  const trends = data.trends || [];
  return `
    <div class="section-header animate-in">
      <div class="section-title">GLOBAL SEARCH TRENDS</div>
    </div>
    <div class="card-grid">
      ${trends.map((t, i) => `
        <div class="card animate-in" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <span class="card-title">${t.topic}</span>
            <span class="card-badge badge-yellow">${t.velocity}</span>
          </div>
          <div class="card-body">
            <p>${t.money_angle}</p>
            <div class="card-meta">
              <span class="meta-tag">${t.platform}</span>
              <span class="meta-tag">Eng: ${t.engagement.toLocaleString()}</span>
            </div>
          </div>
          <div class="card-footer">
            <a class="card-link" href="${t.link}" target="_blank">Investigate</a>
          </div>
        </div>
      `).join('')}
    </div>`;
}
