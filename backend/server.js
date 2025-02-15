import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import NodeCache from 'node-cache';
import { WebSocket } from 'ws';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();


const app = express();
const port = process.env.NODE_PORT || 1001;

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Configure Render PostgreSQL pool
const renderPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Configure Neon connection for read operations
// const neonConfig = {
//   webSocketConstructor: WebSocket,
//   pipelineConnect: 'auto',
//   useSecureWebSocket: true
// };

const neonDb = neon(process.env.NEON_DATABASE_URL);

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

/
// Set Cross-Origin-Resource-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Error handling middleware
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get user's inventory with caching
app.get('/api/inventory/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cacheKey = `inventory_${userId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Query Neon for read operations
    const result = await neonDb`
      SELECT i.*, p.description, p.image_url
      FROM user_inventory i
      LEFT JOIN products p ON i.id = p.id
      WHERE i.user_id = ${userId}
      ORDER BY i.created_at DESC
      LIMIT 1000
    `;
    
    // Cache the results
    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Search inventory with server-side filtering
app.get('/api/inventory/:userId/search', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { query, category } = req.query;
    
    const result = await neonDb`
      SELECT i.*, p.description, p.image_url
      FROM user_inventory i
      LEFT JOIN products p ON i.id = p.id
      WHERE i.user_id = ${userId}
      ${category ? neonDb`AND i.category = ${category}` : neonDb``}
      ${query ? neonDb`
        AND (
          i.name ILIKE ${'%' + query + '%'} OR
          p.description ILIKE ${'%' + query + '%'} OR
          i.material ILIKE ${'%' + query + '%'} OR
          i.origin_source ILIKE ${'%' + query + '%'}
        )
      ` : neonDb``}
      ORDER BY i.created_at DESC
      LIMIT 100
    `;
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create new inventory item
app.post('/api/inventory/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const item = req.body;
    
    // Use Render DB for write operations
    const result = await renderPool.query(
      `INSERT INTO user_inventory (
        user_id, name, description, category, material,
        color, dimensions, origin_source, import_cost, retail_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId, item.name, item.description, item.category,
        item.material, item.color, item.dimensions,
        item.origin_source, item.import_cost, item.retail_price
      ]
    );
    
    // Clear cache for this user
    cache.del(`inventory_${userId}`);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update inventory item
app.put('/api/inventory/:userId/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const updates = req.body;
    
    // Use Render DB for write operations
    const result = await renderPool.query(
      `UPDATE user_inventory
       SET name = $1, description = $2, category = $3,
           material = $4, color = $5, dimensions = $6,
           origin_source = $7, import_cost = $8, retail_price = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        updates.name, updates.description, updates.category,
        updates.material, updates.color, updates.dimensions,
        updates.origin_source, updates.import_cost, updates.retail_price,
        itemId, userId
      ]
    );
    
    // Clear cache for this user
    cache.del(`inventory_${userId}`);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete inventory item
app.delete('/api/inventory/:userId/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    // Use Render DB for write operations
    const result = await renderPool.query(
      'DELETE FROM user_inventory WHERE id = $1 AND user_id = $2 RETURNING *',
      [itemId, userId]
    );
    
    // Clear cache for this user
    cache.del(`inventory_${userId}`);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Clear cache endpoint
app.post('/api/cache/clear', (req, res) => {
  const userId = req.body.userId;
  if (userId) {
    cache.del(`inventory_${userId}`);
  } else {
    cache.flushAll();
  }
  res.json({ message: 'Cache cleared successfully' });
});

// Error handler for database connection
renderPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const port = process.env.NODE_PORT || 1001;
// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await renderPool.end();
  process.exit(0);
});
