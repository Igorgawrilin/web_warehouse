const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Подключение через переменную окружения (берем из Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Нужно для Render/Supabase
});

// GET /warehouse — получить данные
app.get('/warehouse', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM warehouse WHERE id = 1');
        res.json(result.rows[0]?.data || {});
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT /warehouse — обновить данные
app.put('/warehouse', async (req, res) => {
    try {
        const data = req.body; // В Postgres JSON можно передавать как объект
        await pool.query('UPDATE warehouse SET data = $1 WHERE id = 1', [data]);
        res.json({ message: 'Updated' });
    } catch (err) {
        res.status(500).json({ error: 'Save error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));