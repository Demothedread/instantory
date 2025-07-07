import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from quart import Quart, request, Response

from backend.middleware import setup_middleware
from backend.middleware.cors import setup_cors
from backend.middleware.error_handlers import setup_error_handlers
from backend.middleware.request_logger import setup_request_logger
from backend.middleware.auth_security import setup_auth_security

pytestmark = pytest.mark.asyncio

class TestMiddlewareSetup:
    def test_middleware_configuration(self):
        app = Quart(__name__)
        config = {
            'rate_limit': 100,
            'rate_window': 60,
            'max_body_size': 16 * 1024 * 1024,
            'log_request_body': True
        }
        
        setup_middleware(app, config)
        
        assert app.config['MAX_CONTENT_LENGTH'] == config['max_body_size']
        assert 'CORS_ENABLED' in app.config
        assert 'RATE_LIMIT' in app.config
        assert 'RATE_WINDOW' in app.config

class TestCorsMiddleware:
    async def test_cors_headers(self):
        app = Quart(__name__)
        setup_cors(app)
        
        @app.route('/test')
        async def test_route():
            return {'message': 'test'}
        
        async with app.test_client() as client:
            response = await client.get(
                '/test',
                headers={'Origin': 'https://bartleby.vercel.app'}
            )
            
            assert response.headers.get('Access-Control-Allow-Origin') == 'https://bartleby.vercel.app'
            assert 'Access-Control-Allow-Credentials' in response.headers
            assert 'Access-Control-Allow-Methods' in response.headers
            assert 'Access-Control-Allow-Headers' in response.headers

    async def test_cors_preflight(self):
        app = Quart(__name__)
        setup_cors(app)
        
        async with app.test_client() as client:
            response = await client.options(
                '/test',
                headers={
                    'Origin': 'https://bartleby.vercel.app',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            )
            
            assert response.status_code == 200
            assert response.headers.get('Access-Control-Allow-Methods')
            assert 'Content-Type' in response.headers.get('Access-Control-Allow-Headers', '')

    async def test_cors_invalid_origin(self):
        app = Quart(__name__)
        setup_cors(app)
        
        async with app.test_client() as client:
            response = await client.get(
                '/test',
                headers={'Origin': 'https://malicious-site.com'}
            )
            
            assert 'Access-Control-Allow-Origin' not in response.headers

class TestSecurityMiddleware:
    async def test_rate_limiting(self):
        app = Quart(__name__)
        setup_auth_security(app, rate_limit=2, rate_window=1)
        
        @app.route('/test')
        async def test_route():
            return {'message': 'test'}
        
        async with app.test_client() as client:
            # First two requests should succeed
            response1 = await client.get('/test')
            response2 = await client.get('/test')
            assert response1.status_code == 200
            assert response2.status_code == 200
            
            # Third request should be rate limited
            response3 = await client.get('/test')
            assert response3.status_code == 429

    async def test_max_body_size(self):
        app = Quart(__name__)
        max_size = 1024  # 1KB
        setup_auth_security(app, max_body_size=max_size)
        
        @app.route('/test', methods=['POST'])
        async def test_route():
            return {'message': 'test'}
        
        async with app.test_client() as client:
            # Request with body size > max_size
            large_data = 'x' * (max_size + 1)
            response = await client.post('/test', json={'data': large_data})
            assert response.status_code == 413

    async def test_security_headers(self):
        app = Quart(__name__)
        setup_auth_security(app)
        
        @app.route('/test')
        async def test_route():
            return {'message': 'test'}
        
        async with app.test_client() as client:
            response = await client.get('/test')
            
            assert response.headers.get('X-Content-Type-Options') == 'nosniff'
            assert response.headers.get('X-Frame-Options') == 'DENY'
            assert response.headers.get('X-XSS-Protection') == '1; mode=block'
            assert 'Content-Security-Policy' in response.headers

class TestRequestLogger:
    async def test_request_logging(self):
        app = Quart(__name__)
        
        with patch('backend.middleware.request_logger.logger') as mock_logger:
            setup_request_logger(app, log_request_body=True)
            
            @app.route('/test', methods=['POST'])
            async def test_route():
                return {'message': 'test'}
            
            async with app.test_client() as client:
                await client.post('/test', json={'test': 'data'})
                
                # Verify request was logged
                mock_logger.info.assert_called()
                log_call = mock_logger.info.call_args[0][0]
                assert 'POST /test' in log_call
                assert '"test": "data"' in log_call

    async def test_sensitive_data_masking(self):
        app = Quart(__name__)
        
        with patch('backend.middleware.request_logger.logger') as mock_logger:
            setup_request_logger(app, log_request_body=True)
            
            @app.route('/login', methods=['POST'])
            async def login_route():
                return {'message': 'success'}
            
            async with app.test_client() as client:
                await client.post(
                    '/login',
                    json={
                        'email': 'test@example.com',
                        'password': 'secret123'
                    }
                )
                
                # Verify password was masked in logs
                log_call = mock_logger.info.call_args[0][0]
                assert 'secret123' not in log_call
                assert '********' in log_call

class TestErrorHandlers:
    async def test_404_handler(self):
        app = Quart(__name__)
        setup_error_handlers(app)
        
        async with app.test_client() as client:
            response = await client.get('/nonexistent')
            assert response.status_code == 404
            data = await response.get_json()
            assert 'error' in data
            assert 'not found' in data['error'].lower()

    async def test_500_handler(self):
        app = Quart(__name__)
        setup_error_handlers(app)
        
        @app.route('/error')
        async def error_route():
            raise Exception('Test error')
        
        async with app.test_client() as client:
            response = await client.get('/error')
            assert response.status_code == 500
            data = await response.get_json()
            assert 'error' in data
            assert 'internal server error' in data['error'].lower()

    async def test_validation_error_handler(self):
        app = Quart(__name__)
        setup_error_handlers(app)
        
        @app.route('/validate', methods=['POST'])
        async def validate_route():
            data = await request.get_json()
            if 'required_field' not in data:
                raise ValueError('Missing required field')
            return {'message': 'success'}
        
        async with app.test_client() as client:
            response = await client.post('/validate', json={})
            assert response.status_code == 400
            data = await response.get_json()
            assert 'error' in data
            assert 'required field' in data['error'].lower()

class TestMiddlewareIntegration:
    async def test_middleware_chain(self):
        app = Quart(__name__)
        
        # Setup all middleware
        config = {
            'rate_limit': 100,
            'rate_window': 60,
            'max_body_size': 16 * 1024 * 1024,
            'log_request_body': True
        }
        setup_middleware(app, config)
        
        @app.route('/test')
        async def test_route():
            return {'message': 'test'}
        
        async with app.test_client() as client:
            response = await client.get(
                '/test',
                headers={'Origin': 'https://bartleby.vercel.app'}
            )
            
            # Verify all middleware was applied
            assert response.status_code == 200
            assert 'Access-Control-Allow-Origin' in response.headers
            assert 'X-Content-Type-Options' in response.headers
            assert 'Content-Security-Policy' in response.headers

    async def test_middleware_error_handling(self):
        app = Quart(__name__)
        config = {
            'rate_limit': 1,
            'rate_window': 60,
            'max_body_size': 1024,
            'log_request_body': True
        }
        setup_middleware(app, config)
        
        async with app.test_client() as client:
            # Test rate limiting
            await client.get('/test')
            response = await client.get('/test')
            assert response.status_code == 429
            
            # Test max body size
            large_data = 'x' * 2048
            response = await client.post('/test', json={'data': large_data})
            assert response.status_code == 413
