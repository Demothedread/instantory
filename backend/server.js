import NodeCache from 'node-cache';
import { WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { neon } from '@neondatabase/serverless';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;  // Fallback to 3000 if PORT is undefined
app.listen(port, () => console.log(`Server running on port ${port}`));

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Configure Render PostgreSQL pool for core data
const mainDb = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Configure Neon connection for frontend assets and caching
const assetDb = neon(process.env.NEON_DATABASE_URL, {
  webSocketConstructor: WebSocket,
  pipelineConnect: 'auto',
  useSecureWebSocket: true
});

// Initialize Vercel Blob client for asset storage
const { put: putBlob, list: listBlobs, del: deleteBlob } = require('@vercel/blob');

// Configure CORS with multiple origins
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Enhanced security headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Initialize MessagePort handlers
const messageHandlers = new Map();
const initMessageHandlers = () => {
  if (typeof MessagePort !== 'undefined') {
    MessagePort.prototype.k = function(event) {
      const handler = messageHandlers.get(event.data.type);
      if (handler) {
        handler(event.data);
      }
    };
  }
};
initMessageHandlers();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get user's inventory
app.get('/api/inventory/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cacheKey = `inventory_${userId}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Query main database for inventory data
    const result = await mainDb.query(
      `SELECT i.*, a.asset_url
       FROM user_inventory i
       LEFT JOIN inventory_assets a ON i.id = a.inventory_id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC
       LIMIT 1000`,
      [userId]
    );
    
    // Cache the results
    cache.set(cacheKey, result.rows);
    res.json(result.rows);
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
    
    let queryText = `
      SELECT i.*, a.asset_url
      FROM user_inventory i
      LEFT JOIN inventory_assets a ON i.id = a.inventory_id
      WHERE i.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 2;
    
    if (category) {
      queryText += ` AND i.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }
    
    if (query) {
      queryText += ` AND (
        i.name ILIKE $${paramCount} OR
        i.description ILIKE $${paramCount} OR
        i.material ILIKE $${paramCount} OR
        i.origin_source ILIKE $${paramCount}
      )`;
      queryParams.push(`%${query}%`);
    }
    
    queryText += ` ORDER BY i.created_at DESC LIMIT 100`;
    
    const result = await mainDb.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create new inventory item
app.post('/api/inventory/:userId', async (req, res) => {
  const client = await mainDb.connect();
  try {
    const userId = req.params.userId;
    const { item, asset } = req.body;
    
    await client.query('BEGIN');
    
    // Insert inventory item
    const inventoryResult = await client.query(
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
    
    let assetUrl = null;
    if (asset && asset.data) {
      // Upload asset to Vercel Blob
      const blob = await putBlob(
        `inventory/${userId}/${inventoryResult.rows[0].id}/${asset.name}`,
        asset.data,
        { access: 'public' }
      );
      
      // Store asset metadata
      await client.query(
        `INSERT INTO inventory_assets (inventory_id, asset_url, asset_type)
         VALUES ($1, $2, $3)`,
        [inventoryResult.rows[0].id, blob.url, asset.type]
      );
      
      assetUrl = blob.url;
    }
    
    await client.query('COMMIT');
    
    const result = {
      ...inventoryResult.rows[0],
      asset_url: assetUrl
    };
    
    // Clear cache for this user
    cache.del(`inventory_${userId}`);
    
    res.json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});

// Update inventory item
app.put('/api/inventory/:userId/:itemId', async (req, res) => {
  const client = await mainDb.connect();
  try {
    const { userId, itemId } = req.params;
    const { item, asset } = req.body;
    
    await client.query('BEGIN');
    
    // Update inventory item
    const result = await client.query(
      `UPDATE user_inventory
       SET name = $1, description = $2, category = $3,
           material = $4, color = $5, dimensions = $6,
           origin_source = $7, import_cost = $8, retail_price = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        item.name, item.description, item.category,
        item.material, item.color, item.dimensions,
        item.origin_source, item.import_cost, item.retail_price,
        itemId, userId
      ]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Handle asset update if provided
    if (asset && asset.data) {
      // Upload new asset to Vercel Blob
      const blob = await putBlob(
        `inventory/${userId}/${itemId}/${asset.name}`,
        asset.data,
        { access: 'public' }
      );
      
      // Update or insert asset metadata
      await client.query(
        `INSERT INTO inventory_assets (inventory_id, asset_url, asset_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (inventory_id) DO UPDATE
         SET asset_url = $2, asset_type = $3`,
        [itemId, blob.url, asset.type]
      );
      
      result.rows[0].asset_url = blob.url;
    }
    
    await client.query('COMMIT');
    
    // Clear cache for this user
    cache.del(`inventory_${userId}`);
    
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});

// Delete inventory item
app.delete('/api/inventory/:userId/:itemId', async (req, res) => {
  const client = await mainDb.connect();
  try {
    const { userId, itemId } = req.params;
    
    await client.query('BEGIN');
    
    // Get asset info before deletion
    const assetResult = await client.query(
      'SELECT asset_url FROM inventory_assets WHERE inventory_id = $1',
      [itemId]
    );
    
    // Delete from inventory (will cascade to inventory_assets)
    const result = await client.query(
      'DELETE FROM user_inventory WHERE id = $1 AND user_id = $2 RETURNING *',
      [itemId, userId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete asset from Vercel Blob if it exists
    if (assetResult.rows.length > 0) {
      await deleteBlob(assetResult.rows[0].asset_url);
    }
    
    await client.query('COMMIT');
    
    // Clear cache for this user
    cache.del(`inventory_${userId}`);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Server error');
  } finally {
    client.release();
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
mainDb.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mainDb.end();
  process.exit(0);
});
