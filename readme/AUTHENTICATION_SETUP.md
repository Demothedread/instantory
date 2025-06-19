# Authentication System Setup

This document provides step-by-step instructions for setting up the authentication system for Bartleby, including database setup, Google Sign-In integration, and deployment configuration.

## Database Schema Update

Run the following command to update your PostgreSQL database schema with the required authentication tables and fields:

```bash
# If using psql locally:
psql -d bartlebySQL -f backend/update_admin_schema.sql

# If using Render's PostgreSQL:
psql "postgres://[YOUR_CONNECTION_STRING]" -f backend/update_admin_schema.sql
```

## Environment Variables

### Backend (Render)
 
Make sure the following environment variables are set in your Render dashboard:

```
JWT_SECRET=your_secure_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
ADMIN_PASSWORD_OVERRIDE=your_admin_override_password
```

You can generate secure random values for JWT_SECRET and ADMIN_PASSWORD_OVERRIDE using:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate admin password
openssl rand -base64 16
```

### Frontend (Vercel)

Set the following environment variables in your Vercel project settings:

```
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Google Sign-In Integration

Follow these steps to set up Google Sign-In:

1. **Create a Google OAuth 2.0 Client**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Set the application type to "Web application"
   - Add your authorized JavaScript origins (e.g., `https://bartleby.vercel.app`)
   - Add authorized redirect URIs (e.g., `https://bartleby.vercel.app/auth/google/callback`)
   - Click "Create" and note your Client ID and Client Secret

2. **Configure Backend**:
   - Set the `GOOGLE_CLIENT_ID` environment variable on Render

3. **Configure Frontend**:
   - Set the `REACT_APP_GOOGLE_CLIENT_ID` environment variable on Vercel

## Admin Access

To set up an admin user:

1. **Option 1: Admin Override Login**:
   - Set the `ADMIN_PASSWORD_OVERRIDE` environment variable
   - Use the admin login option in the login overlay
   - Enter your email and the admin override password

2. **Option 2: Database Update**:
   - Uncomment and modify the admin user creation section in `update_admin_schema.sql`
   - Run the SQL script again

## User Isolation

The authentication system now enforces user isolation by:

1. Creating user-specific storage paths with unique identifiers
2. Using authentication middleware to enforce user permissions
3. Filtering database queries by user_id
4. Associating all user data with the authenticated user

## Deployment Instructions

### Frontend (Vercel)

1. Push your changes to your GitHub repository
2. Vercel will automatically deploy the updated frontend
3. Make sure the environment variables are set correctly in Vercel

### Backend (Render)

1. Push your changes to your GitHub repository
2. In the Render dashboard, go to your Bartleby service
3. Navigate to the "Environment" tab
4. Ensure all required environment variables are set
5. Trigger a manual deploy or let Render automatically deploy the changes

## Testing Authentication

1. **Regular User Registration**:
   - Go to the application
   - Click "Create Account"
   - Enter name, email, and password
   - User should be logged in with regular permissions

2. **Email + Password Login**:
   - Go to the application
   - Enter email and password
   - User should be logged in with their permissions

3. **Google Sign-In**:
   - Go to the application
   - Click the Google Sign-In button
   - Authorize the application
   - User should be logged in with their permissions

4. **Admin Login**:
   - Go to the application
   - Click "Admin" link
   - Enter admin email and override password
   - User should be logged in with admin permissions

## Troubleshooting

### Google Sign-In Issues

- Check that your Client ID is correctly set on both frontend and backend
- Verify that your authorized JavaScript origins match your actual domains
- Ensure cookies are being properly set (check browser developer tools)

### Database Issues

- Run the SQL script to ensure all necessary tables and columns exist
- Check the database connection string in your Render environment variables

### Token/Cookie Issues

- Make sure your frontend and backend domains match what's in the CORS configuration
- Check that your JWT_SECRET is properly set
- Verify that secure cookies are being set correctly
