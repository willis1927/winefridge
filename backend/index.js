require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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
  const { search } = req.query;
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

app.listen(3000, () => console.log('Server running on port 3000'));