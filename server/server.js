const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Инициализация базы: создаем таблицу, если её нет, и одну пустую запись
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS warehouse (
                id SERIAL PRIMARY KEY,
                data JSONB
            );
        `);
        const res = await pool.query('SELECT * FROM warehouse WHERE id = 1');
        if (res.rowCount === 0) {
            await pool.query('INSERT INTO warehouse (id, data) VALUES (1, $1)', [{}]);
        }
        console.log("База данных готова к работе");
    } catch (err) {
        console.error("Ошибка инициализации БД:", err);
    }
}
initDB();

// Получить данные
app.get('/warehouse', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM warehouse WHERE id = 1');
        res.json(result.rows[0]?.data || {});
    } catch (err) {
        res.status(500).json({ error: 'Ошибка БД' });
    }
});

// Сохранить данные
app.put('/warehouse', async (req, res) => {
    try {
        const data = req.body;
        await pool.query('UPDATE warehouse SET data = $1 WHERE id = 1', [data]);
        res.json({ message: 'Данные сохранены' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при сохранении' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));