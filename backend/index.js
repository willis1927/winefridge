require('dotenv').config();
const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const express = require('express');
const cors = require('cors');
const app = express();
const uuid = require('uuid').v4;
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean)
);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  try {
    const { protocol, hostname } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());

app.get('/', async (req, res) => {  
  let lwinCount = await prisma.lwin.count();
  
  res.send(`Welcome to the Wine Cellar API!, we currently have ${lwinCount} lwin${lwinCount !== 1 ? 's' : ''}`); });

// ===== USER ENDPOINTS =====

// POST - create a user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const id = uuid();
  try {
    const user = await prisma.user.create({
      data:{
        name : name,
        email : email,  
        id : id
      }
    })
    
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    let users = await prisma.user.findMany();
    console.log("Users",users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update user
app.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      }
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STORAGE ENDPOINTS =====

// POST - create a storage location
app.post('/storage', async (req, res) => {
  const { name, capacity, owner_id } = req.body;
  try {
    const result = await prisma.storage.create({
      data: {
        name,
        capacity,
        owner: {
          connect: { id: owner_id }
        }
      }
    });
    res.json({ id: result.id, name: result.name, capacity: result.capacity, owner_id: result.ownerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// GET all storage locations for a user
app.get('/storage/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const storageRows = await prisma.storage.findMany({
      where: { ownerId: userId },
      orderBy: { id: 'asc' }
    });

    const rows = storageRows.map((storage) => ({
      id: storage.id,
      name: storage.name,
      capacity: storage.capacity,
      owner_id: storage.ownerId
    }));

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update storage location
app.put('/storage/:storageId', async (req, res) => {
  const { storageId } = req.params;
  const { name, capacity } = req.body;
  const parsedStorageId = Number(storageId);

  if (!Number.isInteger(parsedStorageId)) {
    return res.status(400).json({ error: 'Invalid storageId' });
  }

  try {
    await prisma.storage.update({
      where: { id: parsedStorageId },
      data: {
        name,
        capacity
      }
    });
    res.json({ message: 'Storage updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE storage location
app.delete('/storage/:storageId', async (req, res) => {
  const { storageId } = req.params;
  const parsedStorageId = Number(storageId);

  if (!Number.isInteger(parsedStorageId)) {
    return res.status(400).json({ error: 'Invalid storageId' });
  }

  try {
    await prisma.storage.delete({
      where: { id: parsedStorageId }
    });
    res.json({ message: 'Storage deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== WINE ENDPOINTS =====

//GET 1st 20 Wines 
app.get('/wines', async (req, res) => {
  const { search } = req.query;
  try {

    const wines = await prisma.lwin.findMany({
      take: 20,
    });
    
    res.json(wines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wine search endpoint
app.get('/wines/search', async (req, res) => {
  const name =  req.query.name ?? '';
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  if (!trimmedName) {
    return res.json([]);
  }

  try {
    const wines = await prisma.lwin.findMany({
      where: {
        displayName: {
          contains: trimmedName,
          mode: 'insensitive'
        }
      },
      orderBy: { displayName: 'asc' },
      take: 20
    });
    res.json(wines.map(wine => ({
      lwin: wine.lwin,
      display_name: wine.displayName,
      region: wine.region,
      producerName: wine.producerName
      
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STORED WINES ENDPOINTS =====

// GET all stored wines for a user
app.get('/stored-wines/:userId', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET single stored wine
app.get('/stored-wines/detail/:storedId', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST - add wine to collection
app.post('/stored-wines', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PUT - update stored wine
app.put('/stored-wines/:storedId', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// DELETE stored wine
app.delete('/stored-wines/:storedId', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// ===== VINTAGE INFO ENDPOINTS =====

// GET vintage info
app.get('/vintage-info/:fullLwin', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST - add/create vintage info
app.post('/vintage-info', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PUT - update vintage info
app.put('/vintage-info/:fullLwin', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// DELETE vintage info
app.delete('/vintage-info/:fullLwin', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;