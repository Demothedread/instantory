
Instantory is a modern, AI-powered inventory management system that helps businesses catalog and manage their products efficiently. It features automatic image processing, smart categorization, and flexible data management capabilities.

## Features

- 🤖 AI-powered product categorization and description
- 📸 Automatic image processing and organization
- 📊 Multiple inventory table support
- 📤 Export data in multiple formats (CSV, XML, SQL)
- 🔄 Automatic folder maintenance
- 🔒 Secure file handling
- 📱 Responsive web interface

## Prerequisites

- Python 3.8+
- Node.js 14+
- SQLite3

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/instantory.git
cd instantory
```

2. Set up the Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Configuration

1. Create necessary directories:
```bash
mkdir -p data/images/{inventory,uploads} data/exports
```

2. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

## Running the Application

1. Start the backend server:
```bash
cd backend
python server.py
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:5000`or else set your web service address as ${process.env.PUBLIC_BACKEND_URL}

## Deployment

### Option 1: Deploy to Heroku (Free Tier)

1. Create a Heroku account
2. Install Heroku CLI
3. Deploy using:
```bash
heroku create instantory-app
git push heroku main
```

### Option 2: Deploy to Vercel (Free Tier)

1. Create a Vercel account
2. Install Vercel CLI
3. Deploy using:
```bash
vercel
```

### Option 3: Deploy to Netlify (Free Tier)

1. Create a Netlify account
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`

## Integration with Personal Website

### Method 1: Subdomain (Recommended)
1. Create a CNAME record in your domain's DNS settings:
   ```
   inventory.yourdomain.com -> your-deployment-url
   ```

### Method 2: Path-based Routing
1. Add a reverse proxy rule to your web server:
   ```nginx
   location /inventory {
       proxy_pass https://your-deployment-url;
   }
   ```

## API Documentation

### Endpoints

- `GET /api/inventory` - Get all inventory items
- `POST /process-images` - Process and categorize new images
- `POST /api/inventory/reset` - Reset or create new inventory table
- `GET /export-inventory` - Export inventory data
- `GET /images/<filename>` - Serve inventory images

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yourdomain.com or open an issue in the GitHub repository.
