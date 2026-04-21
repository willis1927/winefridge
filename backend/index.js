require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();


// Allow all origins (development only — comment out and restore below for production)
app.use(cors());

// const allowedOrigins = new Set(
//   [
//     process.env.FRONTEND_URL,
//     'http://localhost:5173',
//     'http://127.0.0.1:5173',
//   ].filter(Boolean)
// );

// function isAllowedOrigin(origin) {
//   if (!origin) {
//     return true;
//   }
//
//   if (allowedOrigins.has(origin)) {
//     return true;
//   }
//
//   try {
//     const { protocol, hostname } = new URL(origin);
//     return protocol === 'https:' && hostname.endsWith('.vercel.app');
//   } catch {
//     return false;
//   }
// }

// app.use(cors({
//   origin(origin, callback) {
//     if (isAllowedOrigin(origin)) {
//       return callback(null, true);
//     }
//
//     return callback(new Error(`CORS blocked for origin: ${origin}`));
//   }
// }));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Wine Cellar API!');
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET 1st 20 Wines 
app.get('/wines', async (req, res) => {
  const search = req.query.search ?? '';
  try {
    const [rows] = await db.query('SELECT * FROM lwin WHERE display_name LIKE ? and type = "Wine" LIMIT 20', [`%${search}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create a user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.json({ id: result.insertId, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STORAGE ENDPOINTS =====

// GET all storage locations for a user
app.get('/storage/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM storage WHERE owner_id = ?', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create a storage location
app.post('/storage', async (req, res) => {
  const { name, capacity, owner_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO storage (name, capacity, owner_id) VALUES (?, ?, ?)',
      [name, capacity, owner_id]
    );
    res.json({ id: result.insertId, name, capacity, owner_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update storage location
app.put('/storage/:storageId', async (req, res) => {
  const { storageId } = req.params;
  const { name, capacity } = req.body;
  try {
    await db.query('UPDATE storage SET name = ?, capacity = ? WHERE id = ?', [name, capacity, storageId]);
    res.json({ message: 'Storage updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE storage location
app.delete('/storage/:storageId', async (req, res) => {
  const { storageId } = req.params;
  try {
    await db.query('DELETE FROM storage WHERE id = ?', [storageId]);
    res.json({ message: 'Storage deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STORED WINES ENDPOINTS =====

// GET all stored wines for a user
app.get('/stored-wines/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        sw.storedID,
        sw.owner_id,
        sw.lwin,
        sw.vintage,
        sw.size,
        sw.full_lwin,
        sw.date_purchased,
        sw.purchased_from,
        sw.date_stored,
        sw.notes,
        sw.storage_id,
        l.display_name,
        s.name as storage_name,
        vi.current_drink_state,
        vi.drink_by_date
      FROM stored_wines sw
      LEFT JOIN lwin l ON sw.lwin = l.lwin
      LEFT JOIN storage s ON sw.storage_id = s.id
      LEFT JOIN vintage_info vi ON sw.full_lwin = vi.full_lwin
      WHERE sw.owner_id = ?
      ORDER BY sw.date_stored DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single stored wine
app.get('/stored-wines/detail/:storedId', async (req, res) => {
  const { storedId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT 
        sw.*,
        l.display_name,
        s.name as storage_name,
        vi.current_drink_state,
        vi.drink_by_date,
        vi.ratings,
        vi.awards
      FROM stored_wines sw
      LEFT JOIN lwin l ON sw.lwin = l.lwin
      LEFT JOIN storage s ON sw.storage_id = s.id
      LEFT JOIN vintage_info vi ON sw.full_lwin = vi.full_lwin
      WHERE sw.storedID = ?
    `, [storedId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - add wine to collection
app.post('/stored-wines', async (req, res) => {
  const { owner_id, lwin, vintage, size, date_purchased, purchased_from, date_stored, storage_id, notes } = req.body;
  const full_lwin = `${lwin}${vintage}${size}`;
  try {
    const [result] = await db.query(
      'INSERT INTO stored_wines (owner_id, lwin, vintage, size, full_lwin, date_purchased, purchased_from, date_stored, storage_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [owner_id, lwin, vintage, size, full_lwin, date_purchased, purchased_from, date_stored, storage_id, notes]
    );
    res.json({ storedID: result.insertId, full_lwin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update stored wine
app.put('/stored-wines/:storedId', async (req, res) => {
  const { storedId } = req.params;
  const { date_purchased, purchased_from, storage_id, notes, vintage, size, lwin } = req.body;
  const full_lwin = `${lwin}${vintage}${size}`;
  try {
    await db.query(
      'UPDATE stored_wines SET date_purchased = ?, purchased_from = ?, storage_id = ?, notes = ?, full_lwin = ? WHERE storedID = ?',
      [date_purchased, purchased_from, storage_id, notes, full_lwin, storedId]
    );
    res.json({ message: 'Stored wine updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE stored wine
app.delete('/stored-wines/:storedId', async (req, res) => {
  const { storedId } = req.params;
  try {
    await db.query('DELETE FROM stored_wines WHERE storedID = ?', [storedId]);
    res.json({ message: 'Stored wine deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== VINTAGE INFO ENDPOINTS =====

// GET vintage info
app.get('/vintage-info/:fullLwin', async (req, res) => {
  const { fullLwin } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM vintage_info WHERE full_lwin = ?', [fullLwin]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - add/create vintage info
app.post('/vintage-info', async (req, res) => {
  const { full_lwin, drink_by_date, current_drink_state, ratings, awards, notes } = req.body;
  try {
    await db.query(
      'INSERT INTO vintage_info (full_lwin, drink_by_date, current_drink_state, ratings, awards, notes) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE drink_by_date = ?, current_drink_state = ?, ratings = ?, awards = ?, notes = ?',
      [full_lwin, drink_by_date, current_drink_state, ratings, awards, notes, drink_by_date, current_drink_state, ratings, awards, notes]
    );
    res.json({ full_lwin, drink_by_date, current_drink_state, ratings, awards, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update vintage info
app.put('/vintage-info/:fullLwin', async (req, res) => {
  const { fullLwin } = req.params;
  const { drink_by_date, current_drink_state, ratings, awards, notes } = req.body;
  try {
    await db.query(
      'UPDATE vintage_info SET drink_by_date = ?, current_drink_state = ?, ratings = ?, awards = ?, notes = ? WHERE full_lwin = ?',
      [drink_by_date, current_drink_state, ratings, awards, notes, fullLwin]
    );
    res.json({ message: 'Vintage info updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vintage info
app.delete('/vintage-info/:fullLwin', async (req, res) => {
  const { fullLwin } = req.params;
  try {
    await db.query('DELETE FROM vintage_info WHERE full_lwin = ?', [fullLwin]);
    res.json({ message: 'Vintage info deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;