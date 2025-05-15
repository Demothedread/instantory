"""
ASGI entry point for the Bartleby application.
Used for gunicorn and other ASGI servers.
"""
from backend.server import app

# This is the ASGI application to be used by gunicorn
application = app
