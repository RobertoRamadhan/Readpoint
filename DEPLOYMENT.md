# 🚀 ReadPoint Deployment Guide

## Backend (Laravel) - Railway

### URL
- **Production**: https://readpoint-backend-production.up.railway.app
- **Database**: thomas.proxy.rlwy.net:16209

### Environment Variables di Railway Dashboard

```bash
APP_NAME=ReadPoint
APP_ENV=production
APP_KEY=base64:xxxxx
APP_DEBUG=false
APP_URL=https://readpoint-backend-production.up.railway.app

# Database (dari Railway MySQL)
DB_CONNECTION=mysql
DB_HOST=thomas.proxy.rlwy.net
DB_PORT=16209
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=xxxxx

# Session & CORS
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none

# Sanctum - Frontend domains yang diizinkan
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,localhost:3000,127.0.0.1:3000

# File Storage (pilih salah satu)
FILESYSTEM_DISK=public  # atau s3, cloudinary

# Optional: Cloudinary untuk PDF & Images
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Setup Database
1. Tambahkan MySQL database di Railway
2. Copy connection details ke environment variables
3. Migration otomatis run saat deploy

---

## Frontend (Next.js) - Vercel

### URL
- **Production**: https://readpoint.vercel.app (atau custom domain)

### Environment Variables di Vercel Dashboard

```bash
NEXT_PUBLIC_API_URL=https://readpoint-backend-production.up.railway.app/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Vercel Settings
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

---

## CORS Configuration

Pastikan di backend Laravel, file `config/cors.php` sudah benar:

```php
'allowed_origins' => [
    'https://readpoint.vercel.app',
    'http://localhost:3000',
],
```

---

## File Storage Options

### Option 1: Local Storage (Railway Volume)
```bash
FILESYSTEM_DISK=public
```
Pros: Simple, gratis
Cons: File hilang saat redeploy

### Option 2: Cloudinary (Recommended)
```bash
FILESYSTEM_DISK=cloudinary
```
Pros: CDN, auto-optimize, persistent
Cons: Limited free tier (25GB)

1. Daftar di https://cloudinary.com
2. Install package: `composer require cloudinary-labs/cloudinary-laravel`
3. Set environment variables di Railway
4. Update upload logic di controller

---

## Testing

### Test Backend
```bash
curl https://readpoint-backend-production.up.railway.app/api/health
```

### Test Frontend
1. Buka https://readpoint.vercel.app
2. Test login/register
3. Test upload PDF & images

---

## Troubleshooting

### Backend Error 500
- Check Railway logs
- Verify APP_KEY generated
- Check database connection

### CORS Error
- Verify SANCTUM_STATEFUL_DOMAINS
- Check SESSION_SAME_SITE=none
- Verify frontend URL in backend CORS config

### File Upload Failed
- Check FILESYSTEM_DISK setting
- Verify storage permissions: `php artisan storage:link`
- Check Cloudinary credentials if using cloudinary
