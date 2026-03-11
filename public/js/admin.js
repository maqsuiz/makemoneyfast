/* Admin Panel Logic */

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadOpportunities();
    setupForm();
});

async function loadStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-crypto').textContent = stats.crypto;
        document.getElementById('stat-stocks').textContent = stats.stocks;
        document.getElementById('stat-ai').textContent = stats.ai;
        document.getElementById('stat-freelance').textContent = stats.freelance;
    } catch (e) { console.error('Stats load failed'); }
}

async function loadOpportunities() {
    try {
        const res = await fetch('/api/admin/opportunities');
        const data = await res.json();
        const tbody = document.getElementById('oppTableBody');
        
        tbody.innerHTML = data.map(o => `
            <tr>
                <td><span class="meta-tag" style="text-transform:uppercase">${o.module}</span></td>
                <td><div style="font-weight:700; color:var(--text-primary)">${o.title}</div><div style="font-size: 11px; opacity:0.7">${o.description.substring(0, 50)}...</div></td>
                <td>${o.confidence}%</td>
                <td style="font-size: 11px">${new Date(o.created_at).toLocaleDateString()}</td>
                <td><button class="btn-delete" onclick="deleteOpp(${o.id})">DELETE</button></td>
            </tr>
        `).join('');
    } catch (e) { console.error('Opps load failed'); }
}

async function deleteOpp(id) {
    if (!confirm('Are you sure?')) return;
    try {
        const res = await fetch(`/api/admin/opportunities/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadOpportunities();
            loadStats();
        }
    } catch (e) { alert('Delete failed'); }
}

function setupForm() {
    document.getElementById('addOppForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            module: formData.get('module'),
            type: 'manual',
            description: formData.get('description'),
            confidence: parseInt(formData.get('confidence')),
            potential_profit: parseFloat(formData.get('potential_profit')),
            risk_level: 'low',
            urgency: 'today',
            links: {},
            metadata: { source: 'admin' }
        };

        try {
            const res = await fetch('/api/admin/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                e.target.reset();
                loadOpportunities();
                loadStats();
                alert('Saved successfully!');
            }
        } catch (e) { alert('Save failed'); }
    });
}
