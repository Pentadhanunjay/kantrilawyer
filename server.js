// server.js
// Production-ready Express Backend for Render
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

// ── 1. CORS CONFIGURATION ────────────────────────────────────────────────
// The FRONTEND_URL variable should be set in your Render dashboard
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// ── 2. DATABASE CONNECTION (PostgreSQL) ──────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for cloud databases like Render/AWS
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// ── 3. ROUTES ────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Example Data Route (Fetch Courses)
app.get('/api/data/courses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Course" ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// ── 4. SERVER START ──────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend Server is running on port ${PORT}`);
    console.log(`🔒 CORS allowed for: ${process.env.FRONTEND_URL || 'ALL (Not recommended for production)'}`);
});
