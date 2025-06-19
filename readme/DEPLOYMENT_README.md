# Deployment and Database Configuration Guide

This guide explains how to deploy the Instantory application and ensure proper integration with all required storage and database services.

## Storage and Database Architecture

Instantory uses a multi-database architecture for optimal performance and scalability:

1. **Render PostgreSQL** - Main metadata database
   - Stores user accounts, inventory data, and document metadata
   - Required for all deployments
   - Deployed on Render.com

2. **Neon PostgreSQL** - Vector database (optional but recommended)
   - Enables vector search capabilities and semantic document queries
   - Uses PostgreSQL with vector extension
   - Provides high-performance vector search

3. **Vercel Blob Storage** - Image storage
   - Stores all images (user uploads, inventory images, thumbnails)
   - Required for production deployments
   - Built-in CDN for fast image loading

4. **AWS S3** - Document storage (optional)
   - Stores document files (PDFs, DOC files, etc.)
   - Falls back to local storage if not configured

## Deployment Steps

### 1. Database and Storage Setup

#### Render PostgreSQL (Required)
1. Create a PostgreSQL instance on Render.com
2. Save the connection string as `DATABASE_URL` in your environment variables
3. The initialization script (`init-databases.js`) will create the necessary tables

#### Neon PostgreSQL (Optional but Recommended)
1. Create a PostgreSQL database on Neon.tech
2. Save the connection string as `NEON_DATABASE_URL` in your environment variables
3. Our initialization scripts will attempt to enable the vector extension
4. If the vector extension is not available, the script will create basic tables with TEXT type instead

#### Vercel Blob Storage (Required)
1. Set up Vercel Blob Storage in your Vercel project
2. Generate a Read/Write token and save it as `BLOB_READ_WRITE_TOKEN` in your environment variables
3. The storage manager will automatically use Vercel Blob for image storage

#### AWS S3 (Optional)
1. Create an S3 bucket for document storage
2. Set up IAM credentials with access to this bucket
3. Save the following environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_EXPRESS_BUCKET` (bucket name)
   - `AWS_REGION` (defaults to 'us-west-2')

### 2. Environment Variables

Ensure the following environment variables are set in your Render service:

```
# Database connections
DATABASE_URL=postgresql://user:password@host:port/database
NEON_DATABASE_URL=postgres://user:password@host/neondb

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_token
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_EXPRESS_BUCKET=your_bucket_name
AWS_REGION=us-west-2

# Auth
JWT_SECRET=secure_random_string
GOOGLE_CLIENT_ID=your_google_client_id

# OpenAI (for vector embeddings)
OPENAI_API_KEY=your_openai_key
```

### 3. Deployment Process

1. **Initialize Backend**:
   ```bash
   cd backend
   npm install
   
   # Initialize both databases (metadata and vector)
   node scripts/init-databases.js
   
   # If you have issues with vector database setup
   DEBUG=true node scripts/init-databases.js
   
   # Or to only test connections without creating tables
   node scripts/init-databases.js --sync-only
   ```

2. **Deploy on Render**:
   - Connect your GitHub repository to Render
   - Configure the environment variables
   - Set the build command to `pip install -r requirements.txt && cd backend && node scripts/init-databases.js --sync-only`
   - Set the start command to `PYTHONPATH=$PYTHONPATH:. python -m backend.server`

3. **Configure Frontend**:
   - In `.env.production` in your frontend directory, set:
     ```
     REACT_APP_BACKEND_URL=https://your-render-app.onrender.com
     REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
     REACT_APP_BLOB_READ_WRITE_TOKEN=vercel_blob_token
     ```

4. **Deploy Frontend on Vercel**:
   - Connect your GitHub repository to Vercel
   - Set the build command to `cd frontend && npm install && npm run build`
   - Configure the environment variables

## Fallback Mechanisms

The application includes fallback mechanisms for resilience:

1. **Database Fallbacks**:
   - If Neon PostgreSQL (vector database) is unavailable, vector search operations will be disabled but the app will continue to function with regular text search
   - All document data is primarily stored in the main Render PostgreSQL database with vector embeddings stored separately in Neon
   - The main Render PostgreSQL database is required and has no fallback

2. **Storage Fallbacks**:
   - If Vercel Blob is unavailable, images will be stored locally in the `data/images` directory
   - If AWS S3 is unavailable, documents will be stored locally in the `data/documents` directory

3. **Directory Structure**:
   - The initialization script creates the necessary directory structure in both the project root and the backend directory
   - This ensures that local storage works correctly whether running from the project root or the backend directory

## Troubleshooting

### Database Connectivity Issues
1. Check that database connection strings are correctly formatted
2. Ensure firewall rules allow connections from Render
3. Run the init-databases.js script with `--sync-only` to test connections without modifying the database

### Storage Issues
1. Verify that the BLOB_READ_WRITE_TOKEN is valid and has both read and write permissions
2. Check S3 bucket permissions and IAM policies
3. Ensure the application has write permissions to the local data directories

### Initialization Script Failures
1. Run with `DEBUG=true node scripts/init-databases.js` for more detailed logs
2. Check that the vector extension is available on your Neon database
3. If vector extension isn't available, the script will automatically create tables with TEXT fields instead

## Vector Search Implementation

The application uses a dual-database approach for document search:

1. **Vector Search** (Primary method when Neon DB is available)
   - Documents are stored in the main Render PostgreSQL database with their metadata
   - When documents are uploaded, text is extracted and sent to OpenAI's embedding API
   - The resulting vector embeddings are stored in Neon PostgreSQL
   - Search queries are converted to vectors and compared using cosine similarity
   - This enables semantic search that understands concepts, not just keywords

2. **Text Search** (Fallback method)
   - If vector search is unavailable (Neon DB unreachable or OpenAI API issues)
   - Uses PostgreSQL's ILIKE operator for simple text matching
   - Still provides basic search functionality even when advanced features are down

This hybrid approach ensures the application remains functional even if some components fail, while providing advanced semantic search capabilities when all systems are operational.

## Monitoring

Monitor your application's database and storage usage through:
1. Render dashboard for PostgreSQL usage (metadata database)
2. Neon dashboard for vector database performance (vector search)
3. Vercel dashboard for Blob storage usage (image/document storage)
4. AWS CloudWatch for S3 usage and metrics (alternative document storage)
5. OpenAI dashboard for embedding API usage (vector generation)
