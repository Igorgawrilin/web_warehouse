const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Разрешить запросы из фронтенда

// Подключение к SQLite (файл warehouse.db в папке server)
const db = new sqlite3.Database('./warehouse.db');

// Создание таблицы (если не существует)
db.run(`CREATE TABLE IF NOT EXISTS warehouse (id INTEGER PRIMARY KEY, data TEXT DEFAULT '{}')`);

// Инициализация: если данных нет, создаём пустой склад
db.get(`SELECT data FROM warehouse WHERE id = 1`, (err, row) => {
    if (!row || !row.data) {
        db.run(`INSERT INTO warehouse (id, data) VALUES (1, '{}')`);
    }
});

// GET /warehouse — получить данные
app.get('/warehouse', (req, res) => {
    db.get(`SELECT data FROM warehouse WHERE id = 1`, (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        try {
            res.json(JSON.parse(row.data || '{}'));
        } catch (e) {
            res.json({ shelves: {} }); // Fallback на пустой склад
        }
    });
});

// PUT /warehouse — обновить данные
app.put('/warehouse', (req, res) => {
    const data = JSON.stringify(req.body);
    db.run(`UPDATE warehouse SET data = ? WHERE id = 1`, [data], function(err) {
        if (err) return res.status(500).json({ error: 'Save error' });
        res.json({ message: 'Updated' });
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
