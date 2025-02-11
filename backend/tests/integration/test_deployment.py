import os
import pytest
import yaml
from unittest.mock import patch
import json

pytestmark = pytest.mark.asyncio

class TestRenderDeployment:
    def test_render_yaml_structure(self):
        with open('render.yaml', 'r') as f:
            config = yaml.safe_load(f)
        
        # Verify basic structure
        assert 'services' in config
        assert 'databases' in config
        assert isinstance(config['services'], list)
        
        # Find main backend service
        backend_service = next(
            (s for s in config['services'] if s['name'] == 'instantory'),
            None
        )
        assert backend_service is not None
        
        # Verify required service configuration
        assert backend_service['type'] == 'web'
        assert backend_service['runtime'] == 'python'
        assert 'buildCommand' in backend_service
        assert 'startCommand' in backend_service
        assert 'envVars' in backend_service

    def test_render_environment_variables(self):
        with open('render.yaml', 'r') as f:
            config = yaml.safe_load(f)
        
        backend_service = next(
            s for s in config['services'] if s['name'] == 'instantory'
        )
        env_vars = {v['key']: v for v in backend_service['envVars']}
        
        # Check required environment variables
        required_vars = [
            'DATABASE_URL',
            'OPENAI_API_KEY',
            'BLOB_READ_WRITE_TOKEN',
            'FRONTEND_URL',
            'JWT_SECRET',
            'SESSION_SECRET',
            'COOKIE_SECRET'
        ]
        
        for var in required_vars:
            assert var in env_vars, f"Missing required env var: {var}"
            
        # Verify sensitive variables are properly handled
        sensitive_vars = ['OPENAI_API_KEY', 'BLOB_READ_WRITE_TOKEN', 'JWT_SECRET']
        for var in sensitive_vars:
            assert env_vars[var].get('sync') == False, f"{var} should not be synced"

    def test_render_database_config(self):
        with open('render.yaml', 'r') as f:
            config = yaml.safe_load(f)
        
        # Find database configuration
        db_config = next(
            (db for db in config['databases'] if db['name'] == 'instantory_sql'),
            None
        )
        assert db_config is not None
        
        # Verify database settings
        assert db_config['databaseName'] == 'instantory_db'
        assert 'user' in db_config
        assert 'plan' in db_config

    async def test_database_connection(self, db_pool):
        async with db_pool.acquire() as conn:
            # Test database connection with production config
            with patch.dict(os.environ, {'DATABASE_URL': 'postgresql://test:test@localhost/test_db'}):
                result = await conn.fetchval('SELECT 1')
                assert result == 1

class TestVercelDeployment:
    def test_vercel_config_structure(self):
        with open('frontend/vercel.json', 'r') as f:
            config = json.load(f)
        
        # Verify basic structure
        assert 'version' in config
        assert 'framework' in config
        assert 'buildCommand' in config
        assert 'outputDirectory' in config
        assert 'rewrites' in config
        assert 'headers' in config

    def test_vercel_build_settings(self):
        with open('frontend/vercel.json', 'r') as f:
            config = json.load(f)
        
        assert config['framework'] == 'create-react-app'
        assert config['buildCommand'] == 'npm run vercel-build'
        assert config['outputDirectory'] == 'build'

    def test_vercel_routing_config(self):
        with open('frontend/vercel.json', 'r') as f:
            config = json.load(f)
        
        # Verify rewrites
        assert any(
            r['source'] == '/(.*)'and r['destination'] == '/index.html'
            for r in config['rewrites']
        )

    def test_vercel_security_headers(self):
        with open('frontend/vercel.json', 'r') as f:
            config = json.load(f)
        
        # Find global headers
        global_headers = next(
            (h['headers'] for h in config['headers'] if h['source'] == '/(.*)'),
            None
        )
        assert global_headers is not None
        
        # Verify security headers
        header_dict = {h['key']: h['value'] for h in global_headers}
        assert 'X-Content-Type-Options' in header_dict
        assert 'X-Frame-Options' in header_dict
        assert 'X-XSS-Protection' in header_dict

    def test_vercel_cors_config(self):
        with open('frontend/vercel.json', 'r') as f:
            config = json.load(f)
        
        # Find CORS headers
        global_headers = next(
            (h['headers'] for h in config['headers'] if h['source'] == '/(.*)'),
            None
        )
        assert global_headers is not None
        
        # Verify CORS headers
        header_dict = {h['key']: h['value'] for h in global_headers}
        assert 'Access-Control-Allow-Origin' in header_dict
        assert 'Access-Control-Allow-Methods' in header_dict
        assert 'Access-Control-Allow-Headers' in header_dict
        assert 'Access-Control-Allow-Credentials' in header_dict

    def test_vercel_environment_variables(self):
        with open('frontend/vercel.json', 'r') as f:
            config = json.load(f)
        
        # Verify environment variables
        assert 'env' in config
        env_vars = config['env']
        
        required_vars = [
            'REACT_APP_BACKEND_URL',
            'REACT_APP_GOOGLE_CLIENT_ID',
            'BLOB_READ_WRITE_TOKEN'
        ]
        
        for var in required_vars:
            assert var in env_vars, f"Missing required env var: {var}"

class TestCrossServiceIntegration:
    def test_backend_frontend_urls(self):
        # Load both configs
        with open('render.yaml', 'r') as f:
            render_config = yaml.safe_load(f)
        with open('frontend/vercel.json', 'r') as f:
            vercel_config = json.load(f)
        
        # Get backend URL from Render config
        backend_service = next(
            s for s in render_config['services'] if s['name'] == 'instantory'
        )
        backend_url = next(
            v['value'] for v in backend_service['envVars']
            if v['key'] == 'PUBLIC_BACKEND_URL'
        )
        
        # Get frontend URL configuration
        frontend_url = vercel_config['env']['REACT_APP_BACKEND_URL']
        
        # Verify URLs match
        assert backend_url == 'https://instantory.onrender.com'
        assert frontend_url == 'https://instantory.onrender.com'

    def test_cors_configuration_match(self):
        # Load both configs
        with open('render.yaml', 'r') as f:
            render_config = yaml.safe_load(f)
        with open('frontend/vercel.json', 'r') as f:
            vercel_config = json.load(f)
        
        # Get CORS settings from backend
        backend_service = next(
            s for s in render_config['services'] if s['name'] == 'instantory'
        )
        backend_cors_origin = next(
            v['value'] for v in backend_service['envVars']
            if v['key'] == 'CORS_ORIGIN'
        )
        
        # Get CORS settings from frontend
        frontend_headers = next(
            h['headers'] for h in vercel_config['headers']
            if h['source'] == '/(.*)'
        )
        frontend_cors_origin = next(
            h['value'] for h in frontend_headers
            if h['key'] == 'Access-Control-Allow-Origin'
        )
        
        # Verify CORS settings match
        assert backend_cors_origin == 'https://bartleby.vercel.app'
        assert frontend_cors_origin == 'https://instantory.onrender.com'
