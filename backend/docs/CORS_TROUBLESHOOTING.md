# CORS Troubleshooting Guide for Bartleby AI

## 🔍 Quick Diagnosis Checklist

### Frontend Issues

- [ ] Check browser console for CORS errors
- [ ] Verify no manual `Origin` header is being set
- [ ] Confirm `withCredentials: true` is set in API calls
- [ ] Test with browser dev tools Network tab

### Backend Issues

- [ ] Check server logs for CORS configuration output
- [ ] Verify environment variables are properly set
- [ ] Test preflight OPTIONS requests
- [ ] Check origin validation logic

## 🚨 Common CORS Errors & Solutions

### 1. "Refused to set unsafe header 'Origin'"

**Error:** Browser console shows this error when making API requests.

**Cause:** Frontend code is manually setting the `Origin` header.

**Solution:**

```javascript
// ❌ WRONG - Don't set Origin manually
axios.defaults.headers.common['Origin'] = window.location.origin;

// ✅ CORRECT - Let the browser set Origin automatically
// Remove any manual Origin header setting
```

**Files to check:**

- `frontend/src/services/api.js`
- `frontend/src/config/api.js`

### 2. "Access-Control-Allow-Origin" header missing

**Error:** Network requests fail with CORS policy errors.

**Cause:** Backend is not properly configured to handle cross-origin requests.

**Solution:**

1. Check backend environment variables:

```bash
CORS_ORIGINS=https://hocomnia.com,https://www.hocomnia.com
CORS_ENABLED=true
ALLOW_CREDENTIALS=true
```

2. Verify backend logs show CORS configuration:

```
🌐 CORS Configuration:
  - Origins: ['https://hocomnia.com', 'https://www.hocomnia.com']
  - Enabled: true
  - Allow credentials: true
```

### 3. Google OAuth login popup blocked

**Error:** Google OAuth popup fails to communicate with parent window.

**Cause:** Cross-Origin-Opener-Policy is too restrictive.

**Solution:**
In `frontend/public/index.html`, ensure:

```html
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin-allow-popups" />
```

### 4. Authentication cookies not sent

**Error:** User authentication state is not maintained across requests.

**Cause:** Cross-origin cookies are not properly configured.

**Solution:**

1. Frontend must set `withCredentials: true`:

```javascript
const api = axios.create({
  withCredentials: true, // Essential for cross-origin cookies
  // other config...
});
```

2. Backend must set proper cookie attributes:

```python
response.set_cookie(
    "access_token",
    access_token,
    httponly=True,
    secure=True,  # Must be secure for cross-origin
    samesite="None",  # Allows cross-origin
    domain=".hocomnia.com",  # Allow subdomains
)
```

### 5. Preflight OPTIONS requests failing

**Error:** Complex requests fail before the actual request is made.

**Cause:** Backend doesn't properly handle OPTIONS requests.

**Solution:**
Check that the backend middleware handles OPTIONS requests:

```python
@app.before_request
async def handle_preflight():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        if origin and is_origin_allowed(origin, clean_origins):
            headers = {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
                "Vary": "Origin",
            }
            return "", 204, headers
```

## 🔧 Debugging Tools & Techniques

### Browser Developer Tools

1. **Network Tab:**
   - Look for failed OPTIONS requests (preflight failures)
   - Check response headers for `Access-Control-Allow-Origin`
   - Verify request headers don't include forbidden headers

2. **Console Tab:**
   - Look for CORS error messages
   - Check for "Refused to set unsafe header" errors
   - Monitor authentication state logs

3. **Application Tab:**
   - Check cookies are being set correctly
   - Verify cookie attributes (Secure, SameSite, HttpOnly)

### Backend Logging

Enable debug logging in the backend to see:

```python
# In middleware/cors.py
app.logger.info(f"🌐 CORS Configuration:")
app.logger.info(f"  - Origins: {clean_origins}")
app.logger.info(f"  - Enabled: {cors_enabled}")
app.logger.info(f"  - Allow credentials: {allow_credentials}")
```

### Test Commands

1. **Test preflight request:**

```bash
curl -X OPTIONS \
  -H "Origin: https://hocomnia.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://bartleby-backend-mn96.onrender.com/api/auth/login
```

2. **Test actual request:**

```bash
curl -X POST \
  -H "Origin: https://hocomnia.com" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://bartleby-backend-mn96.onrender.com/api/auth/login
```

## 🌐 Environment-Specific Configuration

### Production (Render + Vercel)

**Backend Environment Variables:**

```bash
CORS_ORIGINS=https://hocomnia.com,https://www.hocomnia.com
FRONTEND_URL=https://hocomnia.com
BACKEND_URL=https://bartleby-backend-mn96.onrender.com
```

**Frontend Environment Variables:**

```bash
REACT_APP_BACKEND_URL=https://bartleby-backend-mn96.onrender.com
REACT_APP_FRONTEND_URL=https://hocomnia.com
```

### Development (Local)

**Backend Environment Variables:**

```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
```

**Frontend Environment Variables:**

```bash
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_FRONTEND_URL=http://localhost:3000
```

## 🔐 Security Considerations

### Content Security Policy (CSP)

Ensure CSP allows necessary origins:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://accounts.google.com https://apis.google.com;
  connect-src 'self' https://bartleby-backend-mn96.onrender.com https://accounts.google.com;
  frame-src https://accounts.google.com;
" />
```

### Cookie Security

For production, ensure cookies are secure:

```python
# Backend cookie settings
secure=True,          # HTTPS only
samesite="None",      # Allow cross-origin
httponly=True,        # Prevent XSS
domain=".hocomnia.com"  # Allow subdomains
```

## 📋 Verification Steps

After implementing fixes, verify:

1. **Frontend loads without CORS errors**
2. **Google OAuth login works**
3. **API requests succeed with authentication**
4. **Cookies are properly set and sent**
5. **Preflight requests return 204 with correct headers**

## 🆘 Emergency Fixes

If all else fails, temporary workarounds:

1. **Disable CORS temporarily for testing:**

```python
# In backend - TEMPORARY ONLY
@app.after_request
async def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    response.headers.add('Access-Control-Allow-Methods', '*')
    return response
```

2. **Test with browser security disabled:**

```bash
# Chrome with security disabled - TESTING ONLY
google-chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=/tmp/chrome_dev_test
```

⚠️ **Never use emergency fixes in production!**

## 📞 Support

If issues persist, check:

1. Backend logs for CORS configuration output
2. Browser network tab for failed requests
3. Environment variables are correctly set
4. DNS and SSL certificates are properly configured

Remember: CORS is a browser security feature. The backend must explicitly allow cross-origin requests for them to work.

## 🔧 RESOLVED: Conflicting CORS Implementations (July 2025)

### Issue Identified: Conflicting CORS Implementations

#### Problem Description

The backend had **two conflicting CORS implementations**:

1. **quart_cors** applied directly in `server.py`
2. **Custom CORS middleware** in `middleware/cors.py` that wasn't being used

This caused CORS policy failures when the frontend (<https://hocomnia.com>) tried to access the backend (<https://bartleby-backend-mn96.onrender.com>).

#### Root Cause Analysis

**1. Conflicting CORS Setup**

- `server.py` was using `quart_cors` with basic configuration
- `middleware/cors.py` had sophisticated CORS handling but wasn't being called
- The two implementations were fighting over header management

**2. Origin Validation Issues**

- Frontend: `https://hocomnia.com`
- Backend CORS_ORIGINS: `"https://hocomnia.com,https://www.hocomnia.com,http://localhost:3000,https://accounts.google.com,https://bartleby.vercel.app"`
- The origins were correctly configured but the middleware wasn't being used

**3. Missing Middleware Integration**

- `server.py` wasn't calling `setup_middleware()`
- Custom CORS logic with credential support wasn't being applied

#### Solution Implemented

**1. Fixed CORS Implementation**

```python
# Removed from server.py:
from quart_cors import cors
app = cors(app, allow_origin=origins, ...)

# Added to server.py:
from backend.middleware.setup import setup_middleware
setup_middleware(app, settings)
```

**2. Proper Middleware Chain**

```python
# In middleware/setup.py - Order matters:
1. setup_cors(app)           # CORS must be first for preflight
2. setup_security(app, ...)  # Security headers
3. setup_error_handlers(app) # Error handling
4. setup_request_logging(app)# Request logging
```

**3. Enhanced CORS Configuration**
The middleware now properly handles:

- ✅ Dynamic origin validation
- ✅ Preflight OPTIONS requests
- ✅ Credential support for authentication
- ✅ Wildcard domain support (*.hocomnia.com)
- ✅ Google OAuth integration

#### Verification Test

```javascript
// Test from hocomnia.com console:
fetch('https://bartleby-backend-mn96.onrender.com/health', {
  method: 'GET',
  mode: 'cors',
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log('✅ CORS working:', response.status))
.catch(error => console.error('❌ CORS failed:', error));
```

Expected response headers:

```
Access-Control-Allow-Origin: https://hocomnia.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With, ...
```

---
