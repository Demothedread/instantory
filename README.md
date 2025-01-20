                  # Instantory - Inventory Management System

A full-stack inventory management system with AI-powered image and document analysis.

## Project Structure

```
instantory/
├── backend/              # Python/Quart backend
│   ├── server.py        # Main server file
│   ├── config.py        # Configuration
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend
│   ├── src/            # React source code
│   └── package.json    # Node.js dependencies
└── data/               # Data storage
    ├── images/         # Image storage
    └── exports/        # Export files
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database
- OpenAI API key

## Local Development

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

2. Set up PostgreSQL database:
- Run the initialization script:
```bash
psql -d your_database_name -f backend/init.sql
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update with your settings

## Development

1. Start the backend:
```bash
python -m hypercorn backend/server:app --reload
```

2. Start the frontend:
```bash
cd frontend
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm start
```

## Deployment

### Backend (Render)

1. Connect your GitHub repository
2. Create a new Web Service
3. Use the following settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `hypercorn server:app --bind 0.0.0.0:$PORT --access-log -`
   - Environment Variables: Copy from `.env.example`

### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the following:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variables: Copy from `.env.example`

### Environment Variables

#### Backend (.env)
- `FLASK_ENV`: Set to 'production' for deployment
- `FLASK_APP`: Main application file
- `DATABASE_URL`: PostgreSQL connection URL from Render
- `PORT`: Application port (set by Render)
- `CORS_ORIGIN`: Frontend URL (Vercel)
- `OPENAI_API_KEY`: Your OpenAI API key
- `PUBLIC_BACKEND_URL`: Backend URL (Render)

#### Frontend (.env)
- `REACT_APP_BACKEND_URL`: Backend API URL (Render)
- `NODE_ENV`: Set to 'production' for deployment

## Database Setup

The application uses PostgreSQL. The database schema will be automatically created on first run. Make sure to set up a PostgreSQL database on Render and configure the `DATABASE_URL` environment variable.
### Document Search
```
POST /api/documents/search
Content-Type: application/json

{
    "query": "your search query"
}
```

Response:
```json
{
    "results": [
        {
            "id": 1,
            "title": "Document Title",
            "summary": "Document Summary",
            "category": "Category",
            "field": "Field",
            "similarity": 0.95
        }
    ]
}
```
## Security Notes

- Never commit `.env` files
- Keep your OpenAI API key secure
- Enable CORS only for trusted domains
- Use SSL/TLS in production (handled by Render/Vercel)

## Error Handling

The application includes comprehensive error handling:
- API endpoint error responses
- File processing error logging
- Database connection error handling
- Image processing error recovery
- OpenAI API error retries

## Monitoring

- Application logs available in Render dashboard
- Frontend performance monitoring in Vercel
- Database monitoring in Render PostgreSQL dashboard

## Support

For issues and feature requests, please create an issue in the GitHub repository.

## License

See LICENSE file for details.
