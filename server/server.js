// server.js
require('dotenv').config();                 // для чтения .env
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Supabase ----------
const SUPABASE_URL = process.env.SUPABASE_URL;          // https://xxx.supabase.co
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // секретный ключ
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- Таблица ----------
const TABLE_NAME = 'warehouse_state';   // создайте таблицу с колонками: id (uuid, primary), data (jsonb)

// ---------- POST – сохранить ----------
app.post('/api/warehouse', async (req, res) => {
    const { warehouse } = req.body;
    if (!warehouse) return res.status(400).json({ error: 'Нет данных' });

    try {
        // Вставляем/обновляем запись с фиксированным id = 'current'
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .upsert({ id: 'current', data: warehouse })
            .eq('id', 'current');

        if (error) throw error;
        res.json({ status: 'ok' });
    } catch (e) {
        console.error('❌ Ошибка Supabase POST:', e);
        res.status(500).json({ error: e.message });
    }
});

// ---------- GET – загрузить ----------
app.get('/api/warehouse', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('data')
            .eq('id', 'current')
            .single();

        if (error) {
            // Если записи ещё нет – возвращаем пустой объект
            if (error.code === 'PGRST116') {
                return res.json({ warehouse: { shelves: {} } });
            }
            throw error;
        }

        res.json({ warehouse: data.data });
    } catch (e) {
        console.error('❌ Ошибка Supabase GET:', e);
        res.status(500).json({ error: e.message });
    }
});

// ---------- Запуск ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
