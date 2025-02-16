import { Pool } from 'pg';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { neon } from '@neondatabase/serverless';
import path from 'path';

dotenv.config();

const isSyncOnly = process.argv.includes('--sync-only');

// Initialize database connections
const mainDb = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const assetDb = neon(process.env.NEON_DATABASE_URL, {
  webSocketConstructor: WebSocket,
  pipelineConnect: 'auto',
  useSecureWebSocket: true
});

async function syncFrontendAssets() {
  console.log('Syncing frontend assets...');
  
  // Get list of frontend assets from main database
  const assets = await mainDb.query(`
    SELECT asset_url, asset_type, category, description 
    FROM frontend_assets 
    ORDER BY created_at DESC
  `);

  // Sync to Neon database
  for (const asset of assets.rows) {
    await assetDb.query(`
      INSERT INTO frontend_assets (asset_url, asset_type, category, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (asset_url) DO UPDATE 
      SET asset_type = $2, category = $3, description = $4
    `, [asset.asset_url, asset.asset_type, asset.category, asset.description]);
  }

  console.log(`Synced ${assets.rows.length} frontend assets`);
}

async function verifyDatabases() {
  // Verify database state
  if (!isSyncOnly) {
    const mainDbResult = await mainDb.query('SELECT COUNT(*) FROM users');
    console.log(`Main database users table exists with count: ${mainDbResult.rows[0].count}`);
  }

  const assetDbResult = await assetDb.query('SELECT COUNT(*) FROM frontend_assets');
  console.log(`Asset database frontend_assets table exists with count: ${assetDbResult.rows[0].count}`);

  console.log(`Database ${isSyncOnly ? 'sync' : 'initialization'} completed successfully`);
}

async function initializeDatabases() {
  try {
    console.log('Starting database initialization...');

    // Read SQL initialization files
    const mainSqlPath = path.join(__dirname, '..', 'init.sql');
    const mainSql = await fs.readFile(mainSqlPath, 'utf8');

    // Split frontend-specific tables
    const frontendTables = mainSql.split('\n').filter(line => 
      line.includes('frontend_assets') || 
      line.includes('frontend_cache')
    ).join('\n');

    if (!isSyncOnly) {
      // Initialize main database (Render)
      console.log('Initializing main database on Render...');
      await mainDb.query(mainSql);
      console.log('Main database initialized successfully');

      // Initialize asset database (Neon)
      console.log('Initializing asset database on Neon...');
      await assetDb.query(frontendTables);
      console.log('Asset database initialized successfully');

      // Create frontend asset categories
      console.log('Creating frontend asset categories...');
      await assetDb.query(`
        INSERT INTO frontend_assets (asset_type, asset_url, category, description)
        VALUES 
          ('image', '/assets/background/BG_BkGldDiscs.heic', 'background', 'Dark gold discs background'),
          ('image', '/assets/background/BG_Deco_Bulbs.heic', 'background', 'Art deco bulbs pattern'),
          ('image', '/assets/borders/artdeco_goldBottom.jpeg', 'border', 'Gold bottom border'),
          ('image', '/assets/borders/artdeco_goldTop.jpeg', 'border', 'Gold top border')
        ON CONFLICT DO NOTHING;
      `);
      console.log('Frontend assets initialized');
    }

    // Sync frontend assets
    await syncFrontendAssets();

    // Verify databases
    await verifyDatabases();

  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  } finally {
    await mainDb.end();
  }
}

// Run initialization
initializeDatabases().catch(console.error);
