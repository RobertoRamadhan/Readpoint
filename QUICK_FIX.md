# ⚡ Quick Fix Commands

## 🎯 TL;DR - What's Wrong?

1. **401 Errors** → Backend environment variables need updating
2. **Google Sign-In 403** → Google Cloud Console needs domain configuration
3. **Multiple initialization** → ✅ Fixed in code

---

## 🚀 Step-by-Step Fix (5 minutes)

### Step 1: Update Railway Environment Variables (2 min)

**Go to:** Railway Dashboard > Your Project > Variables

**Add/Update these:**
```
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app,localhost:3000
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
```

Click **Save** - Railway will automatically redeploy.

---

### Step 2: Update Google Cloud Console (2 min)

**Go to:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Select your OAuth Client ID** > **Edit**

**Add to "Authorized JavaScript origins":**
```
https://readpoint.vercel.app
```

**Add to "Authorized redirect URIs":**
```
https://readpoint.vercel.app
https://readpoint.vercel.app/login
```

Click **Save** - Wait 5-10 minutes for propagation.

---

### Step 3: Deploy Code Changes (1 min)

```bash
# Commit all changes
git add .
git commit -m "fix: resolve 401 errors, Google Sign-In issues, and multiple initialization warnings"

# Push to trigger deployments (Railway + Vercel)
git push origin main
```

---

## ✅ Test After 5 Minutes

1. Open: https://readpoint.vercel.app/login
2. Try regular login → Should work ✅
3. Check Google button → Should load (no 403) ✅
4. Try Google Sign-In → Should work ✅
5. Check console → No warnings ✅

---

## 🐛 Still Not Working?

### If 401 errors persist:

**Run on Railway:**
```bash
php artisan config:cache
php artisan route:cache
```

Or in Railway dashboard: **Settings** > **Deploy** > **Trigger Deploy**

### If Google Sign-In still 403:

- Wait 10 more minutes (Google propagation)
- Verify client ID matches: Vercel env = Google Console
- Try incognito mode

### If nothing works:

**Clear everything:**
```bash
# Browser
- Clear cache + cookies for vercel.app
- Try incognito mode

# Railway
- Trigger new deployment
- Check logs for errors
```

---

## 📋 Complete Environment Variables Checklist

### Railway (Backend)
```env
✅ SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app,localhost:3000
✅ SESSION_SAME_SITE=none
✅ SESSION_SECURE_COOKIE=true
✅ APP_URL=https://readpoint-backend-production.up.railway.app
✅ FRONTEND_URL=https://readpoint.vercel.app
```

### Vercel (Frontend)
```env
✅ NEXT_PUBLIC_API_URL=https://readpoint-backend-production.up.railway.app/api
✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-id>.apps.googleusercontent.com
```

---

## 🎯 Expected Results

**Before Fix:**
- ❌ 401 on /api/user/profile
- ❌ 403 on Google button
- ❌ "Multiple initialization" warning

**After Fix:**
- ✅ Login works perfectly
- ✅ Google Sign-In works
- ✅ No console warnings
- ✅ Dashboard loads correctly

---

## 💡 What Changed in Code?

### Frontend (`app/login/page.tsx`)
- Prevent Google SDK multiple initialization
- Better error handling
- Race condition fixes

### Frontend (`context/AuthContext.tsx`)
- Better 401 detection
- Auto-redirect to login on token expiry
- Improved error messages

### Backend (`bootstrap/app.php`)
- Trust Railway proxies
- Better CORS handling

All changes are **non-breaking** and **backward compatible**! ✅

---

**That's it!** Follow the 3 steps above and you're done. 🎉
