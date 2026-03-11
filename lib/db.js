require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.SUPABASE_CONN_STRING,
    ssl: {
        rejectUnauthorized: false // Required for Supabase in many environments
    }
});

async function initDb() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS opportunities (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                type TEXT NOT NULL,
                module TEXT NOT NULL,
                description TEXT,
                potential_profit NUMERIC,
                risk_level TEXT,
                urgency TEXT,
                confidence INTEGER,
                links JSONB,
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized: opportunities table is ready.');
    } catch (err) {
        console.error('Database initialization error:', err);
    } finally {
        client.release();
    }
}

async function saveOpportunity(opp) {
    const client = await pool.connect();
    try {
        const query = `
            INSERT INTO opportunities (title, type, module, description, potential_profit, risk_level, urgency, confidence, links, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id;
        `;
        const values = [
            opp.title,
            opp.type,
            opp.module,
            opp.description,
            opp.potential_profit,
            opp.risk_level,
            opp.urgency,
            opp.confidence,
            JSON.stringify(opp.links || {}),
            JSON.stringify(opp.metadata || {})
        ];
        const res = await client.query(query, values);
        return res.rows[0].id;
    } catch (err) {
        console.error('Error saving opportunity:', err);
    } finally {
        client.release();
    }
}

async function getRecentOpportunities(limit = 50) {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM opportunities ORDER BY created_at DESC LIMIT $1', [limit]);
        return res.rows;
    } catch (err) {
        console.error('Error fetching opportunities:', err);
        return [];
    } finally {
        client.release();
    }
}

async function deleteOpportunity(id) {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM opportunities WHERE id = $1', [id]);
        return true;
    } catch (err) {
        console.error('Error deleting opportunity:', err);
        return false;
    } finally {
        client.release();
    }
}

async function getStats() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                count(*) as total,
                count(*) FILTER (WHERE module = 'crypto') as crypto,
                count(*) FILTER (WHERE module = 'stock') as stocks,
                count(*) FILTER (WHERE module = 'freelance') as freelance,
                count(*) FILTER (WHERE module = 'ai') as ai
            FROM opportunities
        `);
        return res.rows[0];
    } catch (err) {
        console.error('Error fetching stats:', err);
        return { total: 0, crypto: 0, stocks: 0, freelance: 0, ai: 0 };
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    initDb,
    saveOpportunity,
    getRecentOpportunities,
    deleteOpportunity,
    getStats
};
