# Instantory Storage System Deployment Guide

This guide covers how to deploy and configure the Instantory storage system, which uses PostgreSQL for metadata and Vercel Blob Storage for files.

## Prerequisites

- A Render PostgreSQL database instance
- A Vercel account for Blob Storage
- Environment variables configuration

## Step 1: Set Up PostgreSQL on Render

1. Create a new PostgreSQL database on Render:
   - Login to your Render dashboard
   - Go to "New" → "PostgreSQL"
   - Name your database (e.g., `instantory-metadata-db`)
   - Choose the plan that fits your needs
   - Click "Create Database"

2. Once created, note the following connection details:
   - Internal Database URL
   - External Database URL
   - Database Name
   - Username
   - Password

3. (Optional) Create a separate PostgreSQL database for vector storage:
   - Consider using Neon's PostgreSQL with pgvector extension
   - Follow the same process as above

## Step 2: Set Up Vercel Blob Storage

1. Create or log in to a Vercel account
2. Navigate to your project dashboard
3. Go to "Storage" → "Blob"
4. Create a new Blob storage instance
5. Obtain a Read/Write Token:
   - Go to Settings → Tokens
   - Create a new token with read/write permissions
   - Save the token securely; you'll need it for environment variables

## Step 3: Configure Environment Variables

Set the following environment variables in your deployment environment:

### Database Configuration
```
DATABASE_URL=postgres://username:password@host:port/database_name
NEON_DATABASE_URL=postgres://username:password@host:port/vector_database_name (optional)
```

### Storage Configuration
```
STORAGE_BACKEND=vercel
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Optional S3 Fallback
```
AWS_S3_EXPRESS_BUCKET=your_bucket_name
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Step 4: Initialize Database Schema

When the application first starts, it will automatically initialize the database schema using:

1. `init_metadata_db.sql` for the main database
2. `init_vector_db.sql` for the vector database (if separate)
3. `upload_tracking_schema.sql` for file upload tracking

You can also manually initialize them:

```bash
psql -d your_database_name -f backend/init_metadata_db.sql
psql -d your_database_name -f backend/upload_tracking_schema.sql
psql -d your_vector_database_name -f backend/init_vector_db.sql
```

## Step 5: Deploy the Application

Deploy the application to your chosen platform (e.g., Render, Vercel, Heroku) with the configured environment variables.

## Step 6: Validate the Deployment

1. Check that the application started correctly by reviewing logs
2. Visit `/api/health` to check the overall system health
3. Visit `/api/health/storage` to validate storage systems are working properly
4. Try uploading a file through the application to test the full flow

## Troubleshooting

### Storage Issues

- Check that `BLOB_READ_WRITE_TOKEN` is correctly set and valid
- Verify network connectivity to Vercel Blob services
- Examine logs for specific error messages

### Database Issues

- Verify database connection string format
- Check database credentials
- Ensure the database server is accessible from your application
- Confirm that required tables have been created

### Permission Issues

- Verify that your application has write permissions to temporary directories
- Check database user permissions

## Maintenance

- Monitor storage usage through the Vercel dashboard
- Set up backup policies for the PostgreSQL database
- Consider implementing cleanup jobs for temporary files

## Security Considerations

- Never expose your Vercel Blob token or database credentials
- Ensure all user-uploaded content is properly scanned for malware
- Implement rate limiting for file uploads to prevent abuse

## Scaling Considerations

- For high-volume applications, consider:
  - Setting up a CDN in front of Vercel Blob Storage
  - Implementing caching for frequently accessed files
  - Using read replicas for the PostgreSQL database
