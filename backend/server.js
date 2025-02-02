const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT;

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

// Configure database connection with optimized pool settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Add error handling for database connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Refresh materialized view
async function refreshInventoryView() {
  const client = await pool.connect();
  try {
    await client.query('REFRESH MATERIALIZED VIEW inventory_summary');
    console.log('Refreshed inventory_summary view');
  } catch (err) {
    console.error('Error refreshing materialized view:', err);
  } finally {
    client.release();
  }
}

// Schedule view refresh every 5 minutes
setInterval(refreshInventoryView, 5 * 60 * 1000);

// API Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const cacheKey = 'inventory_list';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    // Use materialized view for better performance
    const result = await pool.query(`
      SELECT 
        i.id,
        i.name,
        p.description,
        p.image_url,
        i.category,
        i.material,
        i.color,
        p.dimensions,
        i.origin_source,
        i.import_cost,
        i.retail_price,
        p.key_tags
      FROM inventory_summary i
      LEFT JOIN products p ON i.id = p.id
      ORDER BY i.created_at DESC
      LIMIT 1000
    `);

    cache.set(cacheKey, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Search endpoint with optimized query
app.get('/api/inventory/search', async (req, res) => {
  try {
    const { query, category } = req.query;
    const searchQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.image_url,
        p.category,
        p.material,
        p.color,
        p.dimensions,
        p.origin_source,
        p.import_cost,
        p.retail_price,
        p.key_tags
      FROM products p
      WHERE 
        ($1::text IS NULL OR p.category = $1)
        AND (
          $2::text IS NULL 
          OR p.name ILIKE $3 
          OR p.description ILIKE $3
          OR p.material ILIKE $3
          OR p.origin_source ILIKE $3
        )
      ORDER BY p.created_at DESC
      LIMIT 100
    `;
    
    const result = await pool.query(searchQuery, [
      category || null,
      query || null,
      query ? `%${query}%` : null
    ]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Clear cache when inventory is updated
app.post('/api/inventory/cache/clear', (req, res) => {
  cache.del('inventory_list');
  res.status(200).send('Cache cleared');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // Initial refresh of materialized view
  refreshInventoryView();
});
