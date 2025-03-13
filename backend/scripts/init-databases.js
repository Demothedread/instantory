import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';

import { Pool } from 'pg';
import { WebSocket } from 'ws';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { neon } from '@neondatabase/serverless';
import path from 'path';

dotenv.config();

const isSyncOnly = process.argv.includes('--sync-only');

/**
 * Initialize and test all database and storage connections
 */
async function initializeConnections() {
  console.log('Initializing connections to all data stores...');
  const connections = {
    renderDb: null,
    neonDb: null,
    vercelBlob: null,
    s3: null
  };

  // 1. Render PostgreSQL (metadata database)
  try {
    const renderDb = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });
    
    // Test connection
    const result = await renderDb.query('SELECT NOW()');
    console.log('✅ Render PostgreSQL connected successfully:', result.rows[0].now);
    connections.renderDb = renderDb;
  } catch (error) {
    console.error('❌ Failed to connect to Render PostgreSQL:', error.message);
    throw new Error('Render PostgreSQL connection is required');
  }

  // 2. Neon PostgreSQL (vector database)
  try {
    if (process.env.NEON_DATABASE_URL) {
      const neonDb = neon(process.env.NEON_DATABASE_URL, {
        webSocketConstructor: WebSocket,
        pipelineConnect: 'auto',
        useSecureWebSocket: true
      });
      
      // Test connection
      const result = await neonDb.query('SELECT NOW()');
      console.log('✅ Neon PostgreSQL connected successfully:', result.rows[0].now);
      connections.neonDb = neonDb;
    } else {
      console.warn('⚠️ Neon PostgreSQL not configured - vector search will be unavailable');
    }
  } catch (error) {
    console.warn('⚠️ Failed to connect to Neon PostgreSQL (vector operations will be unavailable):', error.message);
  }

  // 3. Vercel Blob
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required');
    }
    
    // Test by making a request to the Vercel Blob API
    const response = await axios.get('https://api.vercel.com/v2/blobs', {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });
    
    console.log('✅ Vercel Blob connected successfully');
    connections.vercelBlob = process.env.BLOB_READ_WRITE_TOKEN;
  } catch (error) {
    console.error('❌ Failed to connect to Vercel Blob:', error.message);
    throw new Error('Vercel Blob connection is required');
  }

  // 4. AWS S3
  try {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-west-2',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      // Test connection
      const buckets = await s3.send(new ListBucketsCommand({}));
      console.log(`✅ AWS S3 connected successfully (${buckets.Buckets.length} buckets available)`);
      connections.s3 = s3;
    } else {
      console.warn('⚠️ AWS S3 not configured - S3 storage will be unavailable');
    }
  } catch (error) {
    console.warn('⚠️ Failed to connect to AWS S3 (S3 storage will be unavailable):', error.message);
  }
  
  return connections;
}

// Initialize connections before proceeding
const { renderDb: mainDb, neonDb: assetDb } = await initializeConnections();

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

async function initializeDataDirectories() {
  console.log('Initializing data directories...');
  
  // Define required data directories
  const directories = [
    'data/documents',
    'data/uploads',
    'data/exports',
    'data/images/inventory',
    'backend/data/documents',
    'backend/data/uploads',
    'backend/data/exports',
    'backend/data/images/inventory'
  ];
  
  // Create directories if they don't exist
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      // Ignore errors if directory already exists
      if (error.code !== 'EEXIST') {
        console.warn(`⚠️ Could not create directory ${dir}: ${error.message}`);
      }
    }
  }
  
  // Create README.md in the data directory if it doesn't exist
  const readmePath = path.join('backend/data', 'README.md');
  try {
    await fs.access(readmePath);
    console.log(`✅ README.md already exists in data directory`);
  } catch (error) {
    // File doesn't exist, create it
    const readmeContent = `# Data Directory Structure

This directory contains data files for the Instantory application.

## Directories

- documents/ - Stores document files (PDFs, DOCs, etc.)
- uploads/ - Temporary storage for uploaded files
- exports/ - Exported data files (CSV, Excel, etc.)
- images/ - Image files
  - inventory/ - Images for inventory items

These directories are replicated in cloud storage (Vercel Blob for images, S3 for documents)
and are used as fallbacks when cloud storage is unavailable.
`;
    await fs.writeFile(readmePath, readmeContent);
    console.log(`✅ Created README.md in data directory`);
  }
}

async function initializeDatabases() {
  try {
    console.log('Starting database initialization...');

    // Initialize data directories first
    await initializeDataDirectories();

    // Read SQL initialization files
    const mainSqlPath = path.join(__dirname, '..', 'init.sql');
    const vectorSqlPath = path.join(__dirname, '..', 'init_vector_db.sql');
    const mainSql = await fs.readFile(mainSqlPath, 'utf8');
    
    // Read vector database SQL if Neon is available
    let vectorSql = '';
    try {
      vectorSql = await fs.readFile(vectorSqlPath, 'utf8');
    } catch (error) {
      console.warn(`⚠️ Could not read vector DB SQL file: ${error.message}`);
    }

    // Split frontend-specific tables
    const frontendTables = mainSql.split('\n').filter(line => 
      line.includes('frontend_assets') || 
      line.includes('frontend_cache')
    ).join('\n');

    if (!isSyncOnly) {
      // Initialize main database (Render)
      console.log('Initializing main database on Render...');
      await mainDb.query(mainSql);
      console.log('✅ Main database initialized successfully');

      // Initialize vector database if Neon is available
      if (assetDb && vectorSql) {
        console.log('Initializing vector database on Neon...');
        try {
          await assetDb.query(vectorSql);
          console.log('✅ Vector database initialized successfully');
        } catch (error) {
          console.warn(`⚠️ Vector database initialization error: ${error.message}`);
          // Try to initialize just the basic tables without vector extension
          try {
            const basicVectorTables = vectorSql
              .replace('CREATE EXTENSION IF NOT EXISTS vector;', '')
              .replace('vector(1536)', 'TEXT') // Replace vector type with TEXT
              .replace('USING ivfflat (content_vector vector_cosine_ops)', '') // Remove index creation
              .replace('WITH (lists = 100)', '');
            
            await assetDb.query(basicVectorTables);
            console.log('✅ Basic vector tables created (without vector extension)');
          } catch (subError) {
            console.error(`❌ Could not create basic vector tables: ${subError.message}`);
          }
        }
      }

      // Initialize asset database tables
      console.log('Initializing asset database on Neon...');
      if (assetDb) {
        await assetDb.query(frontendTables);
        console.log('✅ Asset database initialized successfully');

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
        console.log('✅ Frontend assets initialized');
      } else {
        console.warn('⚠️ Asset database not available - skipping frontend asset initialization');
      }
    }

    // Sync frontend assets if both databases are available
    if (assetDb) {
      await syncFrontendAssets();
    } else {
      console.warn('⚠️ Asset database not available - skipping frontend asset sync');
    }

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
