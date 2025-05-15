"""
This script sets up the backend package and runs the Quart application.

It configures CORS, registers blueprints, and defines package metadata
for installation using setuptools.
"""
import os
4  from setuptools import setup, find_packages
from quart import Quart

# Create the app object first without CORS
app = Quart(__name__)

# Get CORS settings from environment - fix whitespace in key
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
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

# Import after app is created, but before registering blueprints
from backend.routes.auth_routes import auth_bp, setup_auth

# Set up authentication
setup_auth(app)

# Register blueprint
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Package configuration
setup(
    name="backend",
    version="0.1.0",
    packages=find_packages(),  # Use find_packages instead of custom function
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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
