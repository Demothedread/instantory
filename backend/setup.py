"""
This script sets up the backend package and runs the Quart application.

It configures CORS, registers blueprints, and defines package metadata
for installation using setuptools.
"""
import os
from setuptools import setup
from quart import Quart

# Create the app object first without CORS
app = Quart(__name__)

# Get CORS settings from environment
cors_origins = os.getenv('CORS_ORIGINS   ', 'http://localhost:3000').split(',')
cors_enabled = os.getenv('CORS_ENABLED', 'true').lower() == 'true'
allow_credentials = os.getenv('ALLOW_CREDENTIALS', 'true').lower() == 'true'

# Apply CORS conditionally
if cors_enabled:
    from quart_cors import cors
    app = cors(
        app,
        allow_origin=cors_origins,
        allow_credentials=allow_credentials
    )

from backend.routes.auth_routes import auth_bp  # Import after app is created

def find_package():
    """Helper function to find the package directory."""
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, 'backend')
 
setup(
    name="backend",
    version="0.1.0",
    packages=find_package(),
    install_requires=[
        "quart",
        "quart-cors",
        "quart-auth",
        "asyncpg",
        "openai",
        "python-dotenv",
        "pydantic",
        "bcrypt",
        "pyjwt",
        "google-auth",
        "aiohttp",
    ],
    python_requires=">=3.8",
)

app.register_blueprint(auth_bp, url_prefix='/api/auth')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
