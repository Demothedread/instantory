# Bartleby (Instantory) - AI-Powered Document & Image Management System

Bartleby is an elegant, comprehensive application for analyzing, organizing, and managing documents and images. It uses AI via OpenAI's API to extract metadata and create structured, searchable content from user uploads.

![Bartleby Logo](frontend/src/assets/NeonBartlebebyGreen.png)

## System Architecture

```
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│  Frontend (Vercel)  │◄─────►│  Backend (Render)   │
│  React Application  │  API  │  Python/Quart App   │
│                     │       │                     │
└─────────┬───────────┘       └─────────┬───────────┘
          │                             │
          │                             │
          ▼                             ▼
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│ User Authentication │       │   Data Processing   │
│ - Google OAuth      │       │   - OpenAI API      │
│ - Email/Password    │       │   - Doc Analysis    │
│                     │       │   - Image Analysis  │
└─────────────────────┘       └─────────────────────┘
          │                             │
          │                             │
          ▼                             ▼
┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │
│  Storage Services   │       │   Database Storage  │
│  - Vercel Blob      │       │   - PostgreSQL      │
│  - AWS S3 (optional)│       │   - Vector DB (Neon)│
│                     │       │                     │
└─────────────────────┘       └─────────────────────┘
```

## Key Features

- **Document Analysis**: Upload and analyze PDFs, DOCx, and text files
- **Image Processing**: Extract metadata and analyze images
- **AI-Powered**: Uses OpenAI's API for intelligent content extraction
- **Structured Data**: Organizes content into searchable tables
- **Vector Search**: Find documents by semantic similarity
- **User Authentication**: Secure login with Google OAuth or email/password
- **Exportable Data**: Download inventory in various formats
- **Responsive Design**: "Neo-deco-rococo" design principles with elegant UI

## Technology Stack

### Frontend
- React.js application
- Hosted on Vercel
- Google OAuth integration
- Modern responsive design

### Backend
- Python application using Quart (async Flask)
- Hypercorn ASGI server
- Hosted on Render
- JWT authentication

### Data Storage
- PostgreSQL on Render for structured data
- Neon PostgreSQL (optional) for vector search
- Vercel Blob Storage for images
- AWS S3 (optional) for document storage

### AI Integration
- OpenAI API for content analysis and metadata extraction
- Vector embeddings for semantic search

## Getting Started

This repository contains both the frontend and backend components of Bartleby. For detailed deployment instructions, see:

- [Deployment Guide](DEPLOYMENT.md) - Step-by-step instructions for deploying on Render and Vercel
- [Database Setup Guide](DATABASE_SETUP.md) - Configuration for PostgreSQL, Neon, and storage services

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Unix
.\venv\Scripts\activate   # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
cd backend
npm install
node scripts/init-databases.js
```

5. Start the backend server:
```bash
python -m hypercorn backend.server:app --reload --bind 0.0.0.0:5000
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp frontend/.env.example frontend/.env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000 and will connect to the backend at http://localhost:5000.

## Testing

For comprehensive testing information:

- Backend testing: See [Backend Testing Guide](backend/BACKEND_TESTING_README.md)
- Frontend testing: Run `npm test` in the frontend directory

## Security Notes

- All authentication uses JWT tokens with secure handling
- API keys and secrets are never exposed to the client
- CORS is properly configured to limit access
- Content Security Policy implemented on frontend
- User data is isolated by user ID

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please create an issue in the GitHub repository.
