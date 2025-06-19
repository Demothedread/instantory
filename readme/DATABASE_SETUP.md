# Database & Storage Configuration Guide

This guide provides detailed instructions for setting up and managing the database and storage components of the Bartleby application.

## Architecture Overview

Bartleby uses a multi-database architecture for optimal performance and scalability:

```
┌─────────────────────────────┐
│         Application         │
└───────────┬─────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌───────────┐
│ Metadata│   │  Vector   │
│ Database│   │ Database  │
│ (Render)│   │  (Neon)   │
└─────────┘   └───────────┘
    │               │
    │               │
┌───┴───────────────┴───┐
│    Storage Services   │
├───────────┬───────────┤
│Vercel Blob│  AWS S3   │
│ (Images)  │  (Docs)   │
└───────────┴───────────┘
```

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

## Primary Database Setup (Render PostgreSQL)

### 1. Create Database on Render

1. Log in to your Render dashboard
2. Navigate to "Databases" in the left menu
3. Click "New PostgreSQL"
4. Configure your database:
   - Name: `bartlebySQL`
   - Database: `instantory_db` (or your preferred name)
   - User: Will be auto-generated
   - Region: Choose the closest to your users
5. Click "Create Database"
6. After creation, note the connection string (will be used as `DATABASE_URL`)

### 2. Initialize Database Schema

The initialization process is handled in three ways:

1. **Automatic Initialization** (via init-databases.js)
   - This script runs during deployment on Render
   - Creates required tables and indexes
   - Initializes necessary stored procedures

2. **Authentication Tables** (update_users_schema.sql)
   - Creates/updates user authentication tables
   - Adds necessary columns and indexes
   - Sets up user storage relationships

3. **Manual Schema Updates**
   - For specific updates after deployment:
   ```bash
   # Connect to the PostgreSQL database
   PGPASSWORD=your_password psql -h your_host.render.com -U instantory_db_user -d instantory_db -f backend/update_users_schema.sql
   ```

### 3. Database Schema Overview

The primary database includes these main tables:

- **users**: User accounts and authentication data
- **user_inventory**: Inventory items metadata
- **user_documents**: Document metadata and properties
- **inventory_assets**: Image assets related to inventory
- **user_storage**: Storage paths for each user
- **document_access**: Permissions for document sharing

For the complete schema, refer to the `init.sql` and `init_metadata_db.sql` files.

## Vector Database Setup (Neon PostgreSQL)

The vector database is optional but highly recommended for semantic search capabilities.

### 1. Create a Neon PostgreSQL Database

1. Sign up for [Neon](https://neon.tech) if you don't have an account
2. Create a new project
3. Create a new database
4. Note the connection string (will be used as `NEON_DATABASE_URL`)

### 2. Enable the Vector Extension

Neon has built-in support for the vector extension:

1. Go to your Neon dashboard
2. Navigate to the SQL Editor
3. Run the following command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 3. Initialize Vector Tables

Vector database initialization happens automatically through the init-databases.js script. It:

1. Creates document_vectors table with vector(1536) columns
2. Sets up indexes for vector similarity search
3. Creates functions for vector search operations

If you need to manually initialize, use:

```bash
psql "postgres://your_neon_connection_string" -f backend/init_vector_db.sql
```

### 4. Vector Database Configuration

In your backend services on Render, set:

```
NEON_DATABASE_URL=postgres://username:password@host.neon.tech/neondb
```

The application will automatically detect and use the vector database when available.

### 5. Fallback Mechanism

If the Neon vector database is unavailable, the application has a fallback mechanism:
- Vector operations will be disabled
- Standard text search will be used instead
- The app will continue to function with reduced search capabilities

## Vercel Blob Storage (for Images)

### 1. Set Up Vercel Blob Storage

1. Set up a [Vercel](https://vercel.com) account if you don't have one
2. Create a new project or use an existing one
3. Navigate to Storage → Blob
4. Create a new Blob store
5. Generate a Read/Write token
6. Note this token (will be used as `BLOB_READ_WRITE_TOKEN`)

### 2. Configure Environment Variables

In your backend services on Render, set:

```
STORAGE_BACKEND=vercel
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

In your frontend deployment on Vercel, set:

```
REACT_APP_STORAGE_PROVIDER=vercel
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 3. Storage Path Structure

Vercel Blob uses the following path structure:

```
/users/{user_id}/inventory/{item_id}.{extension}
/users/{user_id}/uploads/{unique_filename}.{extension}
/users/{user_id}/thumbnails/{item_id}_thumb.{extension}
```

### 4. Monitoring Blob Storage

1. Go to your Vercel dashboard
2. Navigate to Storage → Blob
3. Monitor storage usage and costs
4. Set up alerts for quota usage

## AWS S3 Storage (for Documents)

### 1. Create an AWS S3 Bucket

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/)
2. Navigate to S3 service
3. Click "Create bucket"
4. Configure your bucket:
   - Name: `your-bartleby-documents` (globally unique name)
   - Region: Choose the closest to your users
   - Block Public Access: Keep all blocks enabled (recommended)
5. Create the bucket

### 2. Create IAM Credentials

1. Go to IAM service in AWS console
2. Create a new policy with the following permissions:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject",
                   "s3:ListBucket"
               ],
               "Resource": [
                   "arn:aws:s3:::your-bucket-name",
                   "arn:aws:s3:::your-bucket-name/*"
               ]
           }
       ]
   }
   ```
3. Create a new IAM user
4. Attach the policy to the user
5. Create an access key
6. Note the Access Key ID and Secret Access Key

### 3. Configure Environment Variables

In your backend services on Render, set:

```
STORAGE_BACKEND=s3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_EXPRESS_BUCKET=your_bucket_name
AWS_REGION=us-west-2  # or your chosen region
```

### 4. S3 Directory Structure

The S3 storage uses the following structure:

```
/users/{user_id}/documents/{document_id}.{extension}
/users/{user_id}/exports/{export_id}.{extension}
```

### 5. Monitoring S3 Usage

1. In AWS console, go to S3
2. Select your bucket
3. Go to "Metrics" tab
4. Monitor storage usage and request metrics
5. Set up CloudWatch alarms for cost management

## Local Fallback Storage

The application includes fallback mechanisms for resilience:

1. If Vercel Blob is unavailable, images will be stored locally in:
   ```
   ./data/images/
   ```

2. If AWS S3 is unavailable, documents will be stored locally in:
   ```
   ./data/documents/
   ```

The local storage paths are configurable through environment variables:

```
DATA_DIR=./data
UPLOADS_DIR=./data/uploads
INVENTORY_IMAGES_DIR=./data/images/inventory
EXPORTS_DIR=./data/exports
DOCUMENT_DIRECTORY=./data/documents
```

## Database Backup and Recovery

### Render PostgreSQL Backup

1. **Automatic Backups**:
   - Render automatically creates daily backups for PostgreSQL
   - Backups are retained based on your plan

2. **Manual Backup**:
   ```bash
   # Export database to file
   pg_dump -h your_host.render.com -U instantory_db_user -d instantory_db > backup.sql
   ```

3. **Restore from Backup**:
   ```bash
   # Restore from file
   psql -h your_host.render.com -U instantory_db_user -d instantory_db < backup.sql
   ```

### Neon PostgreSQL Backup

1. **Built-in Backups**:
   - Neon includes point-in-time recovery
   - Access backups through Neon dashboard

2. **Manual Export**:
   ```bash
   # Export vector database
   pg_dump -h your_host.neon.tech -U username -d neondb > vector_backup.sql
   ```

## Database Maintenance

### Regular Maintenance Tasks

1. **Vacuum and Analyze**:
   ```sql
   -- Run periodically to optimize performance
   VACUUM ANALYZE;
   ```

2. **Index Maintenance**:
   ```sql
   -- Rebuild indexes
   REINDEX TABLE user_documents;
   REINDEX TABLE user_inventory;
   ```

3. **Update Statistics**:
   ```sql
   -- Update statistics for query optimizer
   ANALYZE;
   ```

### Monitoring Database Health

1. **Connection Pooling**:
   - Render provides connection pooling by default
   - The application uses connection pools configured in `config/database.py`

2. **Query Performance**:
   - Monitor slow queries in Render logs
   - Use EXPLAIN ANALYZE for troubleshooting

3. **Storage Usage**:
   - Monitor database size in Render dashboard
   - Set alerts for approaching storage limits

## User Data Isolation

The database schema enforces user data isolation:

1. All tables containing user data include a user_id foreign key
2. API routes filter queries by the authenticated user's ID
3. Storage paths are separated by user ID
4. Vector searches are scoped to the user's documents

## Troubleshooting

### Database Connection Issues

1. **Connection Failures**:
   - Verify DATABASE_URL and NEON_DATABASE_URL are correct
   - Check network rules and firewall settings
   - Ensure the database user has proper permissions

2. **Connection Pool Exhaustion**:
   - Increase max_connections in database config
   - Review code for unclosed connections
   - Check for long-running transactions

### Vector Database Issues

1. **Missing Vector Extension**:
   - Ensure the vector extension is installed on Neon
   - Check logs for extension loading errors

2. **Vector Search Errors**:
   - Verify vector dimensions match (1536 for OpenAI embeddings)
   - Ensure vector column type is configured correctly

### Storage Service Errors

1. **Vercel Blob Errors**:
   - Verify BLOB_READ_WRITE_TOKEN has both read and write permissions
   - Check for storage quota limitations
   - Ensure file sizes are within limits

2. **AWS S3 Errors**:
   - Validate AWS credentials and permissions
   - Check bucket CORS configuration
   - Verify region settings match

## Security Considerations

### Database Security

1. **Connection Security**:
   - Render and Neon provide TLS/SSL by default
   - Connection strings include SSL mode settings

2. **User Data Isolation**:
   - All queries filter by user_id
   - Row-level security policies are recommended for critical data

3. **Sensitive Data**:
   - Password hashes use bcrypt
   - Secure data (keys, tokens) are encrypted

### Storage Security

1. **Vercel Blob Security**:
   - Uses signed URLs for access control
   - Manages token permissions for read/write operations

2. **S3 Security**:
   - Bucket has public access blocked
   - IAM permissions limit access to specific operations
   - Consider enabling S3 bucket logging for auditing

## Advanced Configuration

### Multi-Region Deployments

For high availability, consider:

1. **Database Replication**:
   - Use Neon's multi-region capabilities
   - Configure read replicas for high-read workloads

2. **Global Storage**:
   - Vercel Blob has global CDN built-in
   - For S3, consider CloudFront distribution

### Performance Optimization

1. **Database Indexing**:
   - Custom indexes are defined in init.sql
   - Consider adding application-specific indexes based on query patterns

2. **Query Optimization**:
   - Use database pooling efficiently
   - Implement caching for frequent queries

3. **Vector Optimization**:
   - Adjust IVFFlat index parameters for larger collections
   - Consider using HNSW indexes for better search performance

## Migration Considerations

### Migrating Between Storage Providers

To migrate from one storage provider to another:

1. **Export Data**:
   - Use the export endpoints to download all documents/images
   - Or directly access via storage provider APIs

2. **Update Configuration**:
   - Change STORAGE_BACKEND environment variable
   - Configure new provider credentials

3. **Import Data**:
   - Use batch upload tools to import to new provider
   - Update database records to point to new locations

### Database Schema Migrations

For schema updates:

1. Create migration SQL files
2. Test migrations in a staging environment
3. Apply migrations during a maintenance window
4. Include rollback procedures for each migration

## Conclusion

This guide covers the essential aspects of setting up and managing the database and storage components of Bartleby. By following these instructions, you'll have a robust, scalable, and secure foundation for your application.

For specific issues or advanced configurations not covered here, please refer to the official documentation for Render, Neon, Vercel, and AWS.
