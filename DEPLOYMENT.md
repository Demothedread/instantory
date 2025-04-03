# Bartleby Deployment Guide

This guide provides comprehensive step-by-step instructions for deploying the Bartleby application on Render (backend) and Vercel (frontend).

## Architecture Overview

Bartleby uses a split deployment architecture:

- **Frontend**: React.js application deployed on Vercel
- **Backend**: Python/Quart application deployed on Render
- **Database**: PostgreSQL database hosted on Render
- **Vector Database**: (Optional) PostgreSQL with vector extension on Neon
- **Storage**: Vercel Blob Storage or AWS S3

## Deployment Checklist

Before beginning the deployment process, ensure you have:

- [ ] GitHub repository with your Bartleby code
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] Google Cloud Platform account (for Google Sign-In)
- [ ] OpenAI API key
- [ ] Vercel Blob Storage token (or AWS S3 credentials)

## Backend Deployment (Render)

### 1. Create a PostgreSQL Database

1. Log in to your Render dashboard
2. Navigate to "Databases" in the left menu
3. Click "New PostgreSQL"
4. Configure your database:
   - Name: `bartlebySQL`
   - Database: `instantory_db` (or your preferred name)
   - User: Will be auto-generated
   - Region: Choose the closest to your users
5. Click "Create Database"
6. After creation, note the following information:
   - Internal Database URL
   - External Database URL
   - Username and Password

### 2. Deploy the Backend Services

Bartleby uses a render.yaml file to define three services:

1. **Main Web Service (instantory)**:
   - Handles API requests and core functionality
   
2. **Database Initialization Service (instantory-db-init)**:
   - Initializes database schema and tables
   
3. **Background Worker (instantory-worker)**:
   - Handles asynchronous processing tasks

#### Setup with render.yaml (Recommended)

1. Fork or clone the Bartleby GitHub repository
2. In your Render dashboard, click "New" and select "Blueprint"
3. Connect your GitHub account and select the repository
4. Render will automatically detect the render.yaml file
5. Configure environment variables (see Environment Variables section below)
6. Click "Apply" to create all services defined in the render.yaml file

#### Manual Setup (Alternative)

If you prefer to set up services manually:

1. **Main Web Service**:
   - In Render dashboard, click "New" → "Web Service"
   - Connect to your GitHub repository
   - Name: `instantory`
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt && cd backend && npm install --production`
   - Start Command: `PYTHONPATH=$PYTHONPATH: python -m backend.server`
   - Configure environment variables (see below)

2. **Database Initialization Service**:
   - Click "New" → "Web Service"
   - Name: `instantory-db-init`
   - Runtime: Node
   - Build Command: `cd backend && npm install --production`
   - Start Command: `cd backend && npm run start`
   - Configure environment variables (see below)

3. **Background Worker**:
   - Click "New" → "Background Worker"
   - Name: `instantory-worker`
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `PYTHONPATH=$PYTHONPATH:. python -m backend.scripts.setup_user_storage`
   - Configure environment variables (see below)

### 3. Environment Variables Configuration

Set the following environment variables for all services:

#### Essential Variables

```
# Database configuration
DATABASE_URL=postgresql://instantory_db_user:password@host.render.com/instantory_db

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Authentication
JWT_SECRET=generate_a_secure_random_string
GOOGLE_CLIENT_ID=your_google_client_id

# Storage
STORAGE_BACKEND=vercel
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# URLs
PUBLIC_BACKEND_URL=https://instantory.onrender.com
VERCEL_URL=https://instantory.vercel.app
```

#### Optional Variables (Vector Database)

```
# Neon Vector Database (optional)
NEON_DATABASE_URL=postgres://username:password@host.neon.tech/neondb
```

#### Optional Variables (AWS S3)

```
# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_EXPRESS_BUCKET=your_bucket_name
AWS_REGION=us-west-2
```

### 4. Update Database Schema

After deployment, update the database schema with:

```bash
# Connect to the PostgreSQL database
PGPASSWORD=your_password psql -h your_host.render.com -U instantory_db_user -d instantory_db -f backend/update_users_schema.sql
```

You can run this command locally, or use Render's shell access feature.

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment

1. Ensure your frontend/.env.production file is configured correctly:
   ```
   REACT_APP_BACKEND_URL=https://instantory.onrender.com
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_API_VERSION=v1
   REACT_APP_STORAGE_PROVIDER=vercel
   ```

2. Commit and push these changes to your repository

### 2. Deploy to Vercel

1. Log in to your Vercel dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: `frontend` (if your repo has both frontend and backend)
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Configure environment variables (same as in frontend/.env.production)
6. Click "Deploy"

### 3. Configure Custom Domain (Optional)

1. In your Vercel project, go to "Settings" → "Domains"
2. Add your custom domain and follow the instructions to configure DNS

## Google Sign-In Integration

### 1. Create OAuth 2.0 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Configure the OAuth consent screen:
   - User Type: External
   - App Information: Fill in app name, user support email, etc.
   - Scopes: Add "email" and "profile"
6. Create OAuth client ID:
   - Application Type: Web application
   - Name: Bartleby Web Client
   - Authorized JavaScript Origins: 
     - `https://your-frontend-domain.vercel.app` 
     - `http://localhost:3000` (for local development)
   - Authorized Redirect URIs:
     - `https://your-frontend-domain.vercel.app/auth/google/callback`
     - `http://localhost:3000/auth/google/callback` (for local development)
7. Click "Create" and note your Client ID and Client Secret

### 2. Update Environment Variables

1. Update the backend environment variables in Render:
   - `GOOGLE_CLIENT_ID=your_client_id`

2. Update the frontend environment variables in Vercel:
   - `REACT_APP_GOOGLE_CLIENT_ID=your_client_id`

## Verifying Deployment

### Backend Verification

1. Visit `https://your-backend-domain.onrender.com/health`
2. You should see a JSON response: `{"status": "ok", "message": "Server is running"}`

### Frontend Verification

1. Visit your frontend URL (`https://your-frontend-domain.vercel.app`)
2. The application should load without errors
3. Try logging in with Google OAuth
4. Test uploading a file and processing it

## Troubleshooting

### Common Backend Issues

1. **Database Connection Errors**:
   - Verify your DATABASE_URL is correct
   - Check that the database is accessible from Render
   - Ensure the database user has proper permissions

2. **OpenAI API Issues**:
   - Verify your OPENAI_API_KEY is correct and has sufficient quota
   - Check backend logs for specific error messages

3. **Storage Configuration Issues**:
   - If using Vercel Blob: Verify BLOB_READ_WRITE_TOKEN has both read and write permissions
   - If using AWS S3: Check all AWS_ environment variables are set correctly

4. **Google Authentication Issues**:
   - Ensure GOOGLE_CLIENT_ID matches in both frontend and backend
   - Verify the authorized origins in Google Cloud Console match your domains

### Common Frontend Issues

1. **API Connection Errors**:
   - Check that REACT_APP_BACKEND_URL is correctly set
   - Verify CORS settings in backend to allow your frontend domain
   - Check browser console for specific error messages

2. **Content Security Policy Issues**:
   - Review the CSP header in vercel.json
   - Add any missing domains to the appropriate CSP directives

3. **Authentication Flow Problems**:
   - Verify cookies are being set properly
   - Check browser console for JWT or authentication errors

### Viewing Logs

1. **Backend Logs (Render)**:
   - Go to your service in Render dashboard
   - Click "Logs" tab
   - Filter by severity if needed

2. **Frontend Logs (Vercel)**:
   - Go to your deployment in Vercel dashboard
   - Click "Runtime Logs"
   - Check browser console for client-side errors

## Scaling Considerations

### Backend Scaling (Render)

1. Upgrade your Render plan for more resources
2. Consider increasing the number of instances for high traffic
3. Configure auto-scaling if available on your plan

### Database Scaling

1. Monitor database performance in Render dashboard
2. Upgrade your database plan if experiencing high load
3. Consider implementing caching strategies for frequently accessed data

### Storage Scaling

1. Vercel Blob has built-in scalability, but monitor usage costs
2. For AWS S3, set up lifecycle policies for cost management

## Maintenance Tasks

### Regular Updates

1. Keep dependencies updated
2. Apply security patches promptly
3. Monitor usage metrics and performance

### Database Maintenance

1. Regularly backup your database
2. Periodically run vacuum and analyze commands
3. Monitor storage usage and plan for growth

### Monitoring

1. Set up uptime monitoring for backend and frontend
2. Configure error alerting
3. Track API response times and database performance

## Deployment Rollback

### Render Rollback

1. Go to your service in Render dashboard
2. Navigate to "Manual Deploy" tab
3. Select a previous successful deploy
4. Click "Deploy selected deploy"

### Vercel Rollback

1. Go to your project in Vercel dashboard
2. Navigate to "Deployments" tab
3. Find the working deployment
