# Bartleby AI Deployment Guide

## 🚀 Overview

This guide covers deploying Bartleby AI with:
- **Frontend**: React app on Vercel
- **Backend**: Python/Quart API on Render
- **Database**: PostgreSQL on Render
- **Storage**: Vercel Blob Storage

## 📋 Prerequisites

- [ ] GitHub account with repository access
- [ ] Vercel account (free tier sufficient)
- [ ] Render account (free tier sufficient)
- [ ] Google Cloud Console project for OAuth
- [ ] OpenAI API key

## 🛠️ Backend Deployment (Render)

### 1. Database Setup

1. **Create PostgreSQL Database:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "PostgreSQL"
   - Configure:
     - Name: `bartleby-db`
     - Region: `Oregon (US West)`
     - Plan: `Free` (for testing)
   - Save connection details

2. **Initialize Database:**
   ```sql
   -- Run these commands in Render's psql console
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

### 2. Backend Service Setup

1. **Create Web Service:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `bartleby-backend`
     - Region: `Oregon (US West)`
     - Branch: `main`
     - Root Directory: `backend`
     - Runtime: `Python 3`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `python server.py`

2. **Environment Variables:**
   ```bash
   # Application
   ENVIRONMENT=production
   DEBUG=false
   PORT=8080
   
   # Database (from your Render PostgreSQL)
   DATABASE_URL=postgresql://username:password@host:port/database
   POSTGRES_HOST=your-postgres-host
   POSTGRES_DB=your-postgres-db
   POSTGRES_USER=your-postgres-user
   POSTGRES_PASSWORD=your-postgres-password
   POSTGRES_PORT=5432
   
   # CORS
   CORS_ORIGINS=https://hocomnia.com,https://www.hocomnia.com
   CORS_ENABLED=true
   ALLOW_CREDENTIALS=true
   
   # URLs
   FRONTEND_URL=https://hocomnia.com
   BACKEND_URL=https://your-backend-name.onrender.com
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://your-backend-name.onrender.com/api/auth/google/callback
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   
   # Security
   SECRET_KEY=your-secret-key
   JWT_SECRET=your-jwt-secret
   ENCRYPTION_KEY=your-encryption-key
   
   # Storage
   STORAGE_TYPE=vercel_blob
   VERCEL_BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
   ```

3. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://bartleby-backend-mn96.onrender.com`)

## 🌐 Frontend Deployment (Vercel)

### 1. Domain Configuration

1. **Custom Domain (Optional):**
   - Go to Vercel Dashboard
   - Add domain: `hocomnia.com`
   - Configure DNS records as instructed

### 2. Project Setup

1. **Create Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework: `Create React App`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

2. **Environment Variables:**
   ```bash
   REACT_APP_BACKEND_URL=https://bartleby-backend-mn96.onrender.com
   REACT_APP_FRONTEND_URL=https://hocomnia.com
   REACT_APP_GOOGLE_CLIENT_ID=700638306537-27jsc5c64hrjq6153mc5fll6prmgef4o.apps.googleusercontent.com
   REACT_APP_PRODUCTION_DOMAIN=hocomnia.com
   ```

3. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Test the deployed application

## 🔐 Google OAuth Setup

### 1. Google Cloud Console

1. **Create OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID

2. **Configure Authorized URLs:**
   - **Authorized JavaScript origins:**
     - `https://hocomnia.com`
     - `https://www.hocomnia.com`
   - **Authorized redirect URIs:**
     - `https://bartleby-backend-mn96.onrender.com/api/auth/google/callback`

### 2. Update Environment Variables

Update both Vercel and Render with the correct Google OAuth credentials.

## 📦 Storage Setup (Vercel Blob)

### 1. Enable Vercel Blob

1. **Create Blob Store:**
   - Go to Vercel Dashboard
   - Navigate to your project
   - Go to "Storage" tab
   - Create new Blob store
   - Note the read-write token

2. **Update Environment Variables:**
   ```bash
   # On Render backend
   STORAGE_TYPE=vercel_blob
   VERCEL_BLOB_READ_WRITE_TOKEN=your-token-here
   ```

## 🧪 Testing Deployment

### 1. Health Checks

1. **Backend Health Check:**
   ```bash
   curl https://bartleby-backend-mn96.onrender.com/api/health
   ```

2. **Frontend Loading:**
   - Visit `https://hocomnia.com`
   - Check browser console for errors
   - Verify no CORS errors

### 2. Authentication Test

1. **Google OAuth:**
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify user is logged in

2. **API Authentication:**
   - Make authenticated API requests
   - Verify tokens are properly set

### 3. File Upload Test

1. **Upload Test:**
   - Try uploading a document
   - Verify file is stored
   - Check processing pipeline

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check environment variables match
   - Verify frontend and backend URLs
   - See [CORS_TROUBLESHOOTING.md](./CORS_TROUBLESHOOTING.md)

2. **Database Connection:**
   - Verify DATABASE_URL is correct
   - Check database is running
   - Run database migrations

3. **OAuth Issues:**
   - Verify redirect URIs match exactly
   - Check Google OAuth credentials
   - Ensure domains are authorized

### Debugging Steps

1. **Check Logs:**
   - Render: Service logs in dashboard
   - Vercel: Function logs in dashboard
   - Browser: Console and Network tab

2. **Environment Variables:**
   - Verify all required variables are set
   - Check for typos in URLs
   - Ensure secrets are not exposed

## 📊 Monitoring

### 1. Uptime Monitoring

Set up monitoring for:
- Frontend availability
- Backend API health
- Database connectivity

### 2. Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for user session replay
- Google Analytics for usage metrics

## 🔄 Updates and Maintenance

### 1. Automated Deployment

Both Vercel and Render support:
- Automatic deployments on git push
- Preview deployments for pull requests
- Rollback capabilities

### 2. Database Maintenance

- Regular backups (Render provides automatic backups)
- Monitor database usage
- Plan for scaling as needed

### 3. Security Updates

- Keep dependencies updated
- Monitor for security advisories
- Regular security audits

## 📝 Environment Variables Checklist

### Backend (Render)
- [ ] `DATABASE_URL`
- [ ] `CORS_ORIGINS`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `OPENAI_API_KEY`
- [ ] `SECRET_KEY`
- [ ] `VERCEL_BLOB_READ_WRITE_TOKEN`

### Frontend (Vercel)
- [ ] `REACT_APP_BACKEND_URL`
- [ ] `REACT_APP_FRONTEND_URL`
- [ ] `REACT_APP_GOOGLE_CLIENT_ID`

## 🎯 Success Criteria

Deployment is successful when:
- [ ] Frontend loads without errors
- [ ] Backend API responds to health checks
- [ ] Google OAuth login works
- [ ] File uploads work properly
- [ ] No CORS errors in browser console
- [ ] Database connections are stable

## 📞 Support

For deployment issues:
1. Check service logs
2. Review environment variables
3. Test individual components
4. Refer to troubleshooting guides

Remember: Both Render and Vercel offer excellent documentation and support for common deployment scenarios.
