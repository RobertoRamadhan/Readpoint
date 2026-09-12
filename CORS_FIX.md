# CORS FIX - Laravel Cloud Production

## Problem
Frontend di `https://readpointku.web.id` tidak bisa akses API karena CORS error:
```
Access to fetch at 'https://readpoint-production-aml3x0.laravel.cloud/api/ebooks' 
from origin 'https://readpointku.web.id' has been blocked by CORS policy
```

## Root Cause
Production .env di Laravel Cloud belum dikonfigurasi dengan benar untuk CORS.

## Solution

### 1. Login ke Laravel Cloud Dashboard
https://cloud.laravel.com/projects/readpoint-production-aml3x0

### 2. Update Environment Variables (.env)

Tambahkan/update variables berikut:

```env
# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=readpoint-production-aml3x0.laravel.cloud,readpointku.web.id,www.readpointku.web.id

# Session Configuration
SESSION_DOMAIN=.laravel.cloud
SESSION_SECURE_COOKIE=true

# Frontend URL (for CORS)
FRONTEND_URL=https://readpointku.web.id

# App URL
APP_URL=https://readpoint-production-aml3x0.laravel.cloud
```

### 3. Restart Application (jika perlu)

Setelah update .env, Laravel Cloud biasanya auto-restart. Jika tidak, restart manual.

### 4. Test CORS

Buka browser console dan cek response headers:
```
Access-Control-Allow-Origin: https://readpointku.web.id
Access-Control-Allow-Credentials: true
```

## Alternative: Update config/cors.php

Jika masih error, pastikan config/cors.php sudah benar:

```php
// config/cors.php
'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'https://readpointku.web.id')),
```

Lalu tambahkan di .env:
```env
CORS_ALLOWED_ORIGINS=https://readpointku.web.id,https://www.readpointku.web.id
```

## Testing Checklist

- [ ] Frontend bisa akses API /api/ebooks tanpa CORS error
- [ ] Login berfungsi (dengan credentials)
- [ ] Upload file berfungsi
- [ ] No CORS errors di browser console

---

## Quick Fix (Emergency)

Jika urgent dan perlu temporary fix, bisa set di config/cors.php:

```php
'allowed_origins' => ['*'],  // DANGER: Allow all origins (temporary only!)
'supports_credentials' => false,  // Disable credentials
```

⚠️ **Warning:** Ini tidak aman untuk production! Hanya untuk testing.