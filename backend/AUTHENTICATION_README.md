# Authentication System Updates

This document outlines the changes made to fix the authentication system and how to deploy them.

## Changes Made

1. **Fixed Circular Import Issue**
   - Modified `auth_routes.py` to import `get_db_pool` directly from `config.database` instead of `backend.db`
   
2. **Aligned API Endpoints**
   - Changed backend Google auth route from `/google-login` to `/google` to match frontend configuration
   
3. **Fixed Parameter Mismatch**
   - Updated frontend to use consistent parameter naming for Google authentication

4. **Added User Storage Integration**
   - Created user storage table to link users with their storage locations
   - Enhanced auth routes to create and retrieve user-specific storage paths
   - Added storage information to authentication responses

## How to Deploy

Follow these steps to implement the authentication fixes:

### 1. Update Database Schema

Run the user schema update script to add missing columns and create the storage table:

```bash
# Connect to the PostgreSQL database
PGPASSWORD=dOnjIofuc6rPHqSCPQ3Pi5btjBcizIPu psql -h dpg-ctbqgrrtq21c73deq7ng-a.oregon-postgres.render.com -U instantory_db_user -d instantory_db -f backend/update_users_schema.sql
```

### 2. Set Environment Variables

Ensure these environment variables are set on the Render server:

```
DATABASE_URL=postgresql://instantory_db_user:dOnjIofuc6rPHqSCPQ3Pi5btjBcizIPu@dpg-ctbqgrrtq21c73deq7ng-a.oregon-postgres.render.com/instantory_db
JWT_SECRET=<your-secure-jwt-secret>
GOOGLE_CLIENT_ID=700638306537-27jsc5c64hrjq6153mc5fll6prmgef4o.apps.googleusercontent.com
STORAGE_BACKEND=vercel  # or s3, depending on preferred storage
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>  # if using Vercel
```

### 3. Setup User Storage

Run the storage setup script to ensure all users have storage paths configured:

```bash
# Run from project root
python backend/scripts/setup_user_storage.py
```

### 4. Restart Backend Service

After deploying the updated code, restart the backend service on Render:

1. Go to the Render dashboard
2. Navigate to the instantory backend service
3. Click the "Manual Deploy" button, then "Deploy latest commit"

## Verifying the Fix

To verify that authentication is working correctly:

1. Open the frontend application
2. Try logging in with Google OAuth
3. Check that user-specific storage information is available in the login response
4. Verify that users can upload files to their storage path

## Troubleshooting

If authentication issues persist, check:

1. **Database Connection**: Ensure the database URL is correct and the server can connect
2. **JWT Secret**: Verify the JWT_SECRET is set correctly
3. **Google Client ID**: Confirm the Google Client ID matches in both frontend and backend
4. **Logs**: Review the backend logs for any authentication errors
