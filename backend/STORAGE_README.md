# Instantory Storage System

This document describes the storage architecture used in the Instantory application.

## Overview

Instantory uses a hybrid storage approach:

1. **PostgreSQL (Render)**: Used for metadata storage and database operations
2. **Vercel Blob Storage**: Primary storage for files (documents, images, etc.)
3. **Local Filesystem**: Used as fallback and for temporary storage

## Architecture

The storage system follows a layered approach:

```
┌─────────────────────────────────────────────┐
│              Application Layer              │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│           Storage Manager Interface         │
└─────┬─────────────┬─────────────────────┬───┘
      │             │                     │
┌─────▼────┐   ┌────▼─────┐         ┌────▼────┐
│ Vercel   │   │   S3     │         │  Local  │
│   Blob   │   │ Service  │         │ Storage │
└──────────┘   └──────────┘         └─────────┘
```

## Storage Selection Logic

1. **Default**: Vercel Blob Storage is the primary storage backend
2. **Fallback**: If Vercel is unavailable, the system tries S3 (if configured)
3. **Local Storage**: Used as last resort or for temporary files

## Configuration

Storage configuration is controlled by:

1. Environment variables (primary control)
2. `storage_settings.py` for defaults and behaviors
3. `storage.py` for implementation of the storage system

### Key Environment Variables

- `STORAGE_BACKEND`: Set to "vercel" by default; can be "s3" or "local"
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob API token 
- `DATABASE_URL`: PostgreSQL database for metadata
- `VECTOR_DATABASE_URL` or `NEON_DATABASE_URL`: Vector database for embeddings (optional)

## Database Schema

The storage system interacts with several database tables:

1. `user_inventory`: Stores inventory metadata with image URLs
2. `user_documents`: Stores document metadata with file paths
3. `document_vectors`: Stores document embeddings for semantic search
4. `upload_tracking`: Tracks file uploads from temporary to permanent storage

## Monitoring

Storage system health can be monitored via the `/api/health/storage` endpoint, which checks:

1. Vercel Blob connectivity and operations
2. S3 connectivity (if configured)
3. Local storage accessibility

## Usage

The storage system is designed to be used through the `storage_manager` instance:

```python
from backend.services.storage.manager import storage_manager

# Store a file
file_url = await storage_manager.store_file(user_id, file_data, filename, content_type)

# Retrieve a file
content = await storage_manager.get_file(file_url)

# Delete a file
success = await storage_manager.delete_file(file_url)
```

## Transactions and Consistency

The storage system maintains consistency by:

1. Using database transactions when updating metadata
2. Tracking upload status during file transfers
3. Providing flexible fallback mechanisms

## Recommendations

1. Always configure Vercel Blob Storage for production environments
2. Set up proper environment variables in development and testing
3. Use the health endpoints to monitor storage system status
