require('dotenv').config();
const { randomUUID } = require('crypto');
const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const {createClient} = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const app = express();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
}

app.get('/', async (req, res) => {  
  let lwinCount = await prisma.lwin.count();
  
  res.send(`Welcome to the Wine Cellar API!, we currently have ${lwinCount} lwin${lwinCount !== 1 ? 's' : ''}`); });

// ===== AUTH ENDPOINTS =====

app.post('/auth/sync', requireAuth, async (req, res) => {
  const { id, email, user_metadata } = req.user;
  try {
    const user = await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        name: user_metadata?.full_name ?? null
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//update to force vetcel sync
console.log("Backend server starting...");
// ===== USER ENDPOINTS =====

// POST - create a user
// app.post('/users', async (req, res) => {
//   const { name, email } = req.body;
//   const id = uuid();
//   try {
//     const user = await prisma.user.create({
//       data:{
//         name : name,
//         email : email,  
//         id : id
//       }
//     })
    
    
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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
//Get all storage locations
app.get('/storage', async (req, res) => {
  try {
    let storage = await prisma.storage.findMany();
    console.log("Storage",storage);
    res.json(storage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      take: 50
    });
    res.json(wines.map(wine => ({
      lwin: wine.lwin,
      display_name: wine.displayName,
      producer_name: wine.producerName,
      country: wine.country,
      region: wine.region,
      sub_region: wine.subRegion,
      colour: wine.colour,
      classification: wine.classification,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - create a user-defined wine
// Uses Option 1: insert into lwin table with USR_ prefix and status='user_defined'
// TODO Option 3: replace body of this handler to write to a dedicated wines table instead
app.post('/wines/custom', async (req, res) => {
  const { display_name, producer_name, country, region, sub_region, colour, classification } = req.body;

  if (!display_name?.trim()) {
    return res.status(400).json({ error: 'display_name is required' });
  }

  const lwin = `USR_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  try {
    const wine = await prisma.lwin.create({
      data: {
        lwin,
        status: 'user_defined',
        displayName: display_name.trim(),
        producerName: producer_name?.trim() ?? null,
        country: country?.trim() ?? null,
        region: region?.trim() ?? null,
        subRegion: sub_region?.trim() ?? null,
        colour: colour?.trim() ?? null,
        classification: classification?.trim() ?? null,
      }
    });
    res.status(201).json({
      lwin: wine.lwin,
      display_name: wine.displayName,
      producer_name: wine.producerName,
      country: wine.country,
      region: wine.region,
      sub_region: wine.subRegion,
      colour: wine.colour,
      classification: wine.classification,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STORED WINES ENDPOINTS =====

// GET all stored wines (temporary — no auth filter yet)
app.get('/stored-wines', async (req, res) => {
  try {
    const wines = await prisma.storedWine.findMany({
      include: {
        wineRef: {
          select: {
            displayName: true,
            producerName: true,
            country: true,
            region: true,
            colour: true,
          }
        },
        storage: { select: { name: true } },
        owner:   { select: { name: true, email: true } },
      },
      orderBy: { dateStored: 'desc' },
    });
    res.json(wines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all stored wines for a user
app.get('/stored-wines/:userId', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});


// GET single stored wine
app.get('/stored-wines/detail/:storedId', async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST - add wine to collection
// quantity > 1 creates multiple rows (one per bottle) — no quantity column in schema
app.post('/stored-wines', async (req, res) => {
  const { owner_id, lwin, vintage, size, storage_id, purchased_from, date_purchased, date_stored, quantity, notes } = req.body;

  if (!owner_id || !lwin) {
    return res.status(400).json({ error: 'owner_id and lwin are required' });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(owner_id)) {
    return res.status(400).json({ error: 'invalid owner_id' });
  }

  const count = parseInt(quantity, 10);
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return res.status(400).json({ error: 'quantity must be between 1 and 100' });
  }

  const sizeML = (size != null && size !== '') ? parseFloat(size) : null;
  if (sizeML !== null && (isNaN(sizeML) || sizeML <= 0)) {
    return res.status(400).json({ error: 'size must be a positive number in ml' });
  }

  const parsedStorageId = storage_id ? parseInt(storage_id, 10) : null;
  if (storage_id && (!Number.isInteger(parsedStorageId) || parsedStorageId <= 0)) {
    return res.status(400).json({ error: 'invalid storage_id' });
  }

  try {
    const rows = [];
    for (let i = 0; i < count; i++) {
      const row = await prisma.storedWine.create({
        data: {
          ownerId: owner_id,
          lwinCode: lwin,
          vintage: vintage || null,
          size: sizeML,
          storageId: parsedStorageId,
          purchasedFrom: purchased_from || null,
          datePurchased: date_purchased ? new Date(date_purchased) : null,
          dateStored: date_stored ? new Date(date_stored) : null,
          notes: notes || null,
        }
      });
      rows.push(row);
    }
    res.status(201).json(rows.length === 1 ? rows[0] : rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update stored wine
app.put('/stored-wines/:storedId', async (req, res) => {
  const storedId = parseInt(req.params.storedId, 10);
  if (!Number.isInteger(storedId) || storedId <= 0) {
    return res.status(400).json({ error: 'invalid storedId' });
  }

  const { vintage, size, storage_id, date_stored } = req.body;

  const sizeML = (size != null && size !== '') ? parseFloat(size) : null;
  if (sizeML !== null && (isNaN(sizeML) || sizeML <= 0)) {
    return res.status(400).json({ error: 'size must be a positive number in ml' });
  }

  const parsedStorageId = storage_id ? parseInt(storage_id, 10) : null;
  if (storage_id && (!Number.isInteger(parsedStorageId) || parsedStorageId <= 0)) {
    return res.status(400).json({ error: 'invalid storage_id' });
  }

  try {
    const updated = await prisma.storedWine.update({
      where: { storedId },
      data: {
        vintage: vintage || null,
        size: sizeML,
        storageId: parsedStorageId,
        dateStored: date_stored ? new Date(date_stored) : null,
      },
      include: {
        wineRef: { select: { displayName: true, producerName: true, country: true, region: true, colour: true } },
        storage: { select: { name: true } },
        owner:   { select: { name: true, email: true } },
      },
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Stored wine not found' });
    res.status(500).json({ error: err.message });
  }
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