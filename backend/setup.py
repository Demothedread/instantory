"""
This script sets up the backend package and runs the Quart application.

It configures CORS, registers blueprints, and defines package metadata
for installation using setuptools.
"""
import os
from setuptools import setup
from quart import Quart
from backend.routes.auth_routes import auth_bp

app= Quart(__name__)
from quart_cors import cors
app = cors(app, allow_origin="*")
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
        "asyncpg",
        "openai",
        "python-dotenv",
        "pydantic",
    ],
    python_requires=">=3.8",
)
app.register_blueprint(auth_bp, url_prefix='/api/auth')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
