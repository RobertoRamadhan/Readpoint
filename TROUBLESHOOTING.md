# Readpoint Production Issues - Troubleshooting Guide

## Issues Identified

### 1. 401 Unauthorized Errors (`/api/user/profile`, `/api/auth/login`)
### 2. 403 Forbidden Error (Google Sign-In Button)
### 3. Google Sign-In Multiple Initialization Warning

---

## ✅ Fixed (Frontend)

### Google Sign-In Multiple Initialization
**Status:** ✅ FIXED

**Changes Made:**
- Updated `frontend/app/login/page.tsx` to prevent multiple Google SDK initializations
- Added proper cleanup and race condition handling
- Added error handling for SDK loading failures

---

## 🔧 Backend Configuration Fixes Needed

### Issue 1: 401 Unauthorized on API Endpoints

**Root Causes:**
1. **CORS misconfiguration** - Railway backend not accepting credentials from Vercel frontend
2. **Sanctum stateful domains** - Frontend domain not whitelisted
3. **Session configuration** - SameSite/Secure cookie settings incorrect

**Solution Steps:**

#### Step 1: Update Backend `.env` on Railway

Access your Railway backend environment variables and ensure these are set correctly:

```env
# Frontend domains that can use cookie-based auth
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app,localhost:3000

# Session settings for cross-origin cookies
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
SESSION_DOMAIN=null

# CORS settings
APP_URL=https://readpoint-backend-production.up.railway.app
FRONTEND_URL=https://readpoint.vercel.app
```

#### Step 2: Verify CORS Configuration

Check `backend/config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'https://readpoint.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.vercel\.app$/', // Allow all Vercel preview deployments
    ],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true, // CRITICAL: Must be true for Sanctum
];
```

#### Step 3: Verify Sanctum Configuration

Check `backend/config/sanctum.php`:

```php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,readpoint.vercel.app')),
    
    'guard' => ['web'],
    
    'expiration' => null,
    
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
    
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
```

#### Step 4: Add Trusted Proxies (Railway specific)

Railway uses proxies, so update `backend/app/Http/Middleware/TrustProxies.php`:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*'; // Trust all proxies on Railway

    /**
     * The headers that should be used to detect proxies.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;
}
```

**Register the middleware** in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');
})
```

#### Step 5: Deploy and Test

After making these changes:

1. **Commit and push to trigger Railway deployment**
2. **Clear browser cache and cookies**
3. **Test login flow**

---

### Issue 2: Google Sign-In 403 Forbidden

**Root Cause:** Google OAuth Client ID not configured for production domains

**Solution Steps:**

#### Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID

#### Step 2: Add Authorized JavaScript Origins

Add these origins:
```
https://readpoint.vercel.app
https://*.vercel.app (for preview deployments)
```

#### Step 3: Add Authorized Redirect URIs

Add these redirect URIs:
```
https://readpoint.vercel.app
https://readpoint.vercel.app/login
https://*.vercel.app
```

#### Step 4: Update Environment Variables

**Frontend (Vercel):**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=https://readpoint-backend-production.up.railway.app/api
```

**Backend (Railway):**
```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Step 5: Test Google Sign-In

1. Clear browser cache
2. Navigate to login page
3. Google button should load without 403 error
4. Click button and test authentication flow

---

## 🧪 Testing Checklist

After applying fixes:

- [ ] Regular login works (email/password)
- [ ] `/api/user/profile` returns 200 with user data
- [ ] Google Sign-In button loads without 403
- [ ] Google Sign-In authentication completes successfully
- [ ] No "multiple initialization" warnings in console
- [ ] Dashboard loads after successful login
- [ ] Token persists across page refreshes
- [ ] Logout works correctly

---

## 🔍 Debugging Commands

### Check if token is being sent:

**Browser Console:**
```javascript
// Check stored token
console.log(localStorage.getItem('token'));

// Check if token is in Authorization header
fetch('https://readpoint-backend-production.up.railway.app/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Accept': 'application/json'
  }
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Check CORS headers:

**Browser Console:**
```javascript
fetch('https://readpoint-backend-production.up.railway.app/api/user/profile', {
  credentials: 'include',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', [...response.headers.entries()]);
  return response.json();
})
.then(console.log)
.catch(console.error);
```

### Check Railway logs:

```bash
# If you have Railway CLI
railway logs

# Look for:
# - CORS errors
# - Authentication failures
# - Token validation errors
```

---

## 📝 Additional Notes

### Token-Based Authentication (Current Setup)

Your app uses **Bearer Token** authentication (not cookies), so:
- Tokens are stored in `localStorage`
- Sent via `Authorization: Bearer {token}` header
- CORS must allow credentials (`supports_credentials: true`)

### Session vs Token

If you want to switch to **session-based** auth:
1. Use `sanctum/csrf-cookie` endpoint first
2. Send requests with `credentials: 'include'`
3. Include CSRF token in requests

**Current setup is simpler and better for SPA + separate backend.**

---

## 🆘 Still Having Issues?

### Common Problems:

1. **Token expires immediately**
   - Check `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
   - Verify tokens table exists: `php artisan migrate`

2. **CORS still failing**
   - Clear browser cache completely
   - Check Railway logs for actual error
   - Verify `config/cors.php` is published: `php artisan config:cache`

3. **Google Sign-In still 403**
   - Wait 5-10 minutes after Google Cloud Console changes
   - Verify client ID matches in both frontend and Google Console
   - Check Google Console error logs

### Get Help:

1. Check Railway logs: `railway logs`
2. Check browser Network tab for exact error responses
3. Verify environment variables are set in Railway dashboard
4. Test API endpoints directly with Postman/cURL

---

## 🎯 Quick Fix Priority

1. **HIGH PRIORITY:** Update Railway environment variables (SANCTUM_STATEFUL_DOMAINS, CORS)
2. **HIGH PRIORITY:** Configure Google Cloud Console authorized domains
3. **MEDIUM:** Update backend CORS config if needed
4. **LOW:** Frontend changes already applied ✅
