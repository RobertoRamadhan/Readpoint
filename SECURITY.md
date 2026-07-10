# 🔒 Security & Environment Variables Guide

## ⚠️ PENTING: File yang TIDAK BOLEH di-push ke GitHub

File-file berikut berisi **password, API keys, dan secrets** yang TIDAK BOLEH masuk ke repository publik:

### Backend (Laravel):
- ❌ `.env` - Berisi DB password, APP_KEY, dll
- ❌ `.env.production`
- ❌ `.env.local`
- ❌ `/storage/*.key` - Private keys
- ❌ `/auth.json` - Composer credentials

### Frontend (Next.js):
- ❌ `.env` - Berisi API keys
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ `.env.development`

### File yang BOLEH di-push:
- ✅ `.env.example` - Template tanpa nilai rahasia
- ✅ Source code
- ✅ Configuration files (tanpa secrets)

---

## 📋 Setup Environment Variables

### 1. Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env dan isi dengan credentials lokal
php artisan key:generate
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edit .env dan isi dengan API URL lokal
```

### 2. Production (Railway - Backend)

Set di Railway Dashboard > Variables:
```
APP_NAME=ReadPoint
APP_ENV=production
APP_KEY=base64:xxxxx
APP_URL=https://readpoint-backend-production.up.railway.app
DB_CONNECTION=mysql
DB_HOST=thomas.proxy.rlwy.net
DB_PORT=16209
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=xxxxx
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,localhost:3000
```

### 3. Production (Vercel - Frontend)

Set di Vercel Dashboard > Settings > Environment Variables:
```
NEXT_PUBLIC_API_URL=https://readpoint-backend-production.up.railway.app/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 🔍 Cek File yang Ter-commit

Pastikan tidak ada file `.env` yang ter-commit:
```bash
git ls-files | grep "\.env$"
```

Jika ada, hapus dengan:
```bash
git rm --cached path/to/.env
git commit -m "Remove .env from repository"
git push
```

---

## 🛡️ Best Practices

1. ✅ **Selalu gunakan `.env.example`** sebagai template
2. ✅ **JANGAN pernah commit file `.env`** yang berisi nilai asli
3. ✅ **Gunakan environment variables** di platform deployment
4. ✅ **Rotate secrets** jika ter-leak ke publik
5. ✅ **Review `.gitignore`** sebelum commit pertama kali

---

## 🚨 Jika Secret Ter-leak

Jika tidak sengaja push file `.env` ke GitHub:

1. **Segera hapus dari Git:**
   ```bash
   git rm --cached .env
   git commit -m "Remove leaked .env"
   git push
   ```

2. **Ganti semua credentials:**
   - Database password
   - APP_KEY (generate ulang)
   - API keys
   - OAuth client secrets

3. **Revoke API keys** di:
   - Google Cloud Console
   - Railway
   - Services lain yang digunakan

---

## 📞 Support

Jika ada pertanyaan tentang security, hubungi team developer.
