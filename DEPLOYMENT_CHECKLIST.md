# 🚀 Readpoint Production Deployment Checklist

## Status: Fixes Applied - Ready for Deployment

---

## ✅ Changes Made (Locally)

### Frontend Fixes
- [x] Fixed Google Sign-In multiple initialization warning
- [x] Improved token validation and error handling in AuthContext
- [x] Better 401 handling with automatic redirect to login

### Backend Fixes
- [x] Added proxy trusting for Railway in `bootstrap/app.php`
- [x] CORS configuration verified (already correct)

---

## 🔧 Required Actions on Production

### 1. Railway Backend Environment Variables

**Login to Railway Dashboard** and verify/add these environment variables:

```env
# App Configuration
APP_NAME=ReadPoint
APP_ENV=production
APP_DEBUG=false
APP_URL=https://readpoint-backend-production.up.railway.app

# Database (should already be set by Railway)
DB_CONNECTION=mysql
DB_HOST=<your-railway-mysql-host>
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=<your-db-user>
DB_PASSWORD=<your-db-password>

# Session Configuration for Cross-Origin
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
SESSION_DOMAIN=null

# Sanctum Configuration - CRITICAL
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app,localhost:3000

# Frontend URL
FRONTEND_URL=https://readpoint.vercel.app

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLOUDINARY_URL=cloudinary://<api-key>:<api-secret>@<cloud-name>

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**⚠️ MOST IMPORTANT:**
```env
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app,localhost:3000
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
```

---

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** > **Credentials**
3. Select your OAuth 2.0 Client ID

#### Add Authorized JavaScript Origins:
```
https://readpoint.vercel.app
https://*.vercel.app
```

#### Add Authorized Redirect URIs:
```
https://readpoint.vercel.app
https://readpoint.vercel.app/login
```

4. Save changes (may take 5-10 minutes to propagate)

---

### 3. Vercel Frontend Environment Variables

**Login to Vercel Dashboard** > **Project Settings** > **Environment Variables**

Verify these are set:

```env
NEXT_PUBLIC_API_URL=https://readpoint-backend-production.up.railway.app/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
```

**Note:** The Google Client ID in Vercel must match the one in Google Cloud Console!

---

## 📦 Deployment Steps

### Step 1: Deploy Backend (Railway)

```bash
cd d:\Readpoint\backend

# Verify changes
git status

# Commit backend changes
git add bootstrap/app.php
git commit -m "fix: add proxy trusting for Railway deployment"

# Push to trigger Railway deployment
git push origin main
```

**Wait for Railway deployment to complete** (check Railway dashboard)

### Step 2: Deploy Frontend (Vercel)

```bash
cd d:\Readpoint\frontend

# Verify changes
git status

# Commit frontend changes
git add app/login/page.tsx context/AuthContext.tsx
git commit -m "fix: resolve Google Sign-In multiple initialization and improve auth error handling"

# Push to trigger Vercel deployment
git push origin main
```

**Wait for Vercel deployment to complete** (check Vercel dashboard)

---

## 🧪 Post-Deployment Testing

### Test 1: API Health Check
```bash
curl https://readpoint-backend-production.up.railway.app/api/ebooks
```
Expected: Should return ebooks list or authentication error (not CORS error)

### Test 2: Frontend Load
1. Open: https://readpoint.vercel.app
2. Check browser console for errors
3. Should load without CORS errors

### Test 3: Regular Login
1. Go to: https://readpoint.vercel.app/login
2. Enter valid credentials
3. Should successfully login and redirect to dashboard
4. Check that `/api/user/profile` returns 200 (not 401)

### Test 4: Google Sign-In
1. Go to: https://readpoint.vercel.app/login
2. Google button should load (no 403 error)
3. Click Google Sign-In button
4. Should successfully authenticate

### Test 5: Token Persistence
1. Login successfully
2. Refresh page
3. Should remain logged in (not logged out)
4. Check browser console - should not see 401 errors

---

## 🐛 Debugging Tools

### Check Network Requests

**Open Browser DevTools** > **Network Tab**

Look for:
- `/api/user/profile` - Should be 200, not 401
- Google button request - Should be 200, not 403
- Look at Response Headers for CORS headers

### Check Console Logs

**Open Browser DevTools** > **Console Tab**

Should NOT see:
- ❌ "google.accounts.id.initialize() is called multiple times"
- ❌ "Failed to load resource: 401"
- ❌ "Failed to load resource: 403"
- ❌ CORS errors

Should see:
- ✅ API requests completing successfully
- ✅ User data loading

### Check Railway Logs

```bash
# If you have Railway CLI
railway logs --tail

# Or check in Railway dashboard
```

Look for:
- Authentication errors
- CORS errors
- Token validation errors

### Check Local Storage

**Browser DevTools** > **Application** > **Local Storage**

Should have:
- `token` - Bearer token
- `user` - User object with id, name, email, role

---

## 🎯 Success Criteria

All of these should work:
- ✅ No CORS errors in console
- ✅ Regular login works (email/password)
- ✅ Google Sign-In button loads and works
- ✅ Dashboard loads after login
- ✅ No 401 errors on `/api/user/profile`
- ✅ No "multiple initialization" warnings
- ✅ Token persists across page refreshes
- ✅ User remains logged in after refresh

---

## 🆘 If Issues Persist

### Issue: Still getting 401 on `/api/user/profile`

**Check:**
1. Railway environment variable `SANCTUM_STATEFUL_DOMAINS` is set correctly
2. Token is being sent in Authorization header
3. Run on Railway: `php artisan config:cache`

**Debug:**
```javascript
// Browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Issue: Google Sign-In still 403

**Check:**
1. Google Cloud Console has correct domains (wait 5-10 minutes after changes)
2. Client ID matches between Vercel env and Google Console
3. Check Google Cloud Console > Logs for detailed error

### Issue: CORS still blocking requests

**Check:**
1. Railway env: `SESSION_SAME_SITE=none` and `SESSION_SECURE_COOKIE=true`
2. Backend `config/cors.php`: `'supports_credentials' => true`
3. Clear browser cache completely
4. Try in incognito mode

### Nuclear Option: Clear Everything

```bash
# Backend (Railway)
php artisan config:cache
php artisan route:cache
php artisan cache:clear

# Frontend (Local)
# Delete .next folder and rebuild
rm -rf .next
npm run build
```

---

## 📞 Need Help?

1. **Check Railway logs:** Real-time errors from backend
2. **Check Browser Network tab:** See exact error responses
3. **Check Browser Console:** See frontend errors
4. **Test with cURL:** Isolate backend issues

```bash
# Test backend directly
curl -X POST https://readpoint-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎉 Final Notes

- All code fixes are **already applied** ✅
- You just need to **commit and push** 📦
- Then **configure environment variables** ⚙️
- And **update Google Cloud Console** 🔐

**Estimated Total Time:** 15-20 minutes

Good luck! 🚀
