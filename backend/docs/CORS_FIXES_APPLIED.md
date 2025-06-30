# CORS Policy Fixes Applied

## Issues Identified and Fixed

### 1. Manual Origin Header Setting (NEW FIX)
**File:** `frontend/src/config/index.js`

**Problem:** The frontend was manually setting the `Origin` header in API requests, which browsers reject and causes "Refused to set unsafe header 'Origin'" errors.

**Fix Applied:**
- Removed `'Origin': window.location.origin` from the default API headers
- Added comment explaining that browsers set the Origin header automatically

### 2. Content Security Policy for Google OAuth (NEW FIX)
**File:** `backend/config/security.py`

**Problem:** The CSP was blocking Google's stylesheets and the Cross-Origin-Opener-Policy was blocking OAuth postMessage calls.

**Fix Applied:**
- Updated CSP to allow `accounts.google.com *.googleapis.com` for styles
- Added support for Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`)
- Changed Cross-Origin-Opener-Policy from `same-origin-allow-popups` to `unsafe-none` to allow OAuth flows

### 3. Origin Header in CORS Configuration (NEW FIX)
**Files:** `backend/middleware/cors.py` and `backend/config/security.py`

**Problem:** The CORS configuration was including "Origin" in the allowed headers list, which can cause issues since browsers set this automatically.

**Fix Applied:**
- Removed "Origin" from the allowed headers list in both CORS middleware and security config
- Added comments explaining why Origin should not be manually specified

### 4. Origin Validation Logic Enhancement
**File:** `backend/middleware/cors.py` and `backend/config/security.py`

**Problem:** The original origin validation was too restrictive and didn't properly handle:
- Subdomain variations of hocomnia.com
- Vercel preview deployments
- Localhost development environments

**Fix Applied:**
- Enhanced `is_origin_allowed()` function to support:
  - Exact matches for `https://hocomnia.com` and `https://www.hocomnia.com`
  - All subdomains of hocomnia.com (e.g., `app.hocomnia.com`, `api.hocomnia.com`)
  - Vercel preview deployments with `.vercel.app` domain
  - Localhost development (`http://localhost` and `https://localhost`)

### 5. Google OAuth Callback CORS Headers
**File:** `backend/routes/auth_routes.py`

**Problem:** The Google OAuth callback endpoint didn't properly handle CORS preflight requests (OPTIONS method).

**Fix Applied:**
- Added explicit OPTIONS method support to `/google/callback` route
- Added custom CORS header handling for preflight requests
- Enhanced origin validation specifically for OAuth flows

### 6. Cross-Origin Cookie Settings
**File:** `backend/routes/auth_routes.py`

**Problem:** Authentication cookies weren't properly configured for cross-origin use.

**Fix Applied:**
- Ensured all authentication cookies use:
  - `secure=True` (required for cross-origin)
  - `samesite="None"` (allows cross-origin while being secure)
  - `httponly=True` (security best practice)

### 7. Wildcard Domain Support
**File:** `backend/middleware/cors.py` and `backend/config/security.py`

**Problem:** Wildcard domain matching was inconsistent.

**Fix Applied:**
- Improved wildcard domain matching logic
- Added support for `https://*.vercel.app` and `https://*.hocomnia.com`
- Fixed edge case where wildcard matching wasn't working correctly

## Code Changes Summary

### Enhanced Origin Validation
```python
# Enhanced hocomnia.com support - allow all subdomains and the main domain
if origin.startswith("https://") and (
    origin == "https://hocomnia.com" or
    origin == "https://www.hocomnia.com" or
    origin.endswith(".hocomnia.com")
):
    return True

# Support for Vercel preview deployments
if origin.startswith("https://") and ".vercel.app" in origin:
    return True

# Support for localhost development
if origin.startswith("http://localhost") or origin.startswith("https://localhost"):
    return True
```

### OAuth Callback CORS Support
```python
@auth_bp.route("/google/callback", methods=["GET", "OPTIONS"])
async def google_callback():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        if origin and (
            origin == "https://hocomnia.com" or
            origin == "https://www.hocomnia.com" or
            origin.endswith(".hocomnia.com") or
            "vercel.app" in origin or
            "localhost" in origin
        ):
            headers = {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
            return "", 204, headers
```

### Cross-Origin Cookie Configuration
```python
# Set cookies with cross-origin compatible settings
response.set_cookie(
    "access_token",
    access_token,
    httponly=True,
    secure=True,  # Must be secure for cross-origin
    samesite="None",  # Allows cross-origin
    max_age=ACCESS_TOKEN_EXPIRY.total_seconds(),
)
```

## Expected Behavior After Fixes

1. **Frontend at hocomnia.com** should be able to make authenticated requests to the backend
2. **Google OAuth login** should work properly with redirects back to hocomnia.com
3. **Authentication cookies** should be properly set and sent with cross-origin requests
4. **Preflight OPTIONS requests** should be handled correctly
5. **Vercel preview deployments** should work for testing

## Testing the Fixes

### Manual Testing Steps:
1. Visit `https://hocomnia.com`
2. Attempt to login with Google OAuth
3. Check browser console for CORS errors
4. Verify authentication cookies are set
5. Test API requests from the frontend

### Browser Developer Tools:
- Check Network tab for failed preflight requests
- Look for CORS-related errors in Console
- Verify `Access-Control-Allow-Origin` headers in response headers

## Environment Variables to Check

Ensure these environment variables are properly set on the backend:

```bash
CORS_ORIGINS=https://hocomnia.com,https://www.hocomnia.com
CORS_ENABLED=true
ALLOW_CREDENTIALS=true
FRONTEND_URL=https://hocomnia.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
```

## Deployment Notes

1. **Backend**: Deploy these changes to your Render backend service
2. **Environment Variables**: Ensure all CORS-related environment variables are properly configured
3. **Google OAuth**: Verify that the Google OAuth redirect URI is correctly registered in Google Cloud Console
4. **SSL**: Ensure both frontend and backend are served over HTTPS for cross-origin cookies to work

The fixes address the core CORS policy issues that were preventing proper authentication flows between the hocomnia.com frontend and the backend API.
