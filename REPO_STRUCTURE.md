# 📁 REPO STRUCTURE - READPOINT

## ✅ STRUKTUR YANG BENAR

Anda hanya perlu **2 repo utama**:

### 1. **Backend Repository**
```
Repository: RobertoRamadhan/readpoint-backend
URL: https://github.com/RobertoRamadhan/readpoint-backend
Folder: d:\READPOINT\backend
Hosted: Laravel Cloud (https://readpoint-backend-main-odr7ck.laravel.cloud)
```

**Isi:**
- Laravel application
- API routes
- Controllers
- Models
- Database migrations
- Seeders

---

### 2. **Frontend Repository**
```
Repository: RobertoRamadhan/READPOINT
URL: https://github.com/RobertoRamadhan/READPOINT
Folder: d:\READPOINT\frontend
Hosted: Vercel (https://readpoint-apjvw08l3-robertoramadhans-projects.vercel.app)
```

**Isi:**
- Next.js application
- React components
- Pages
- API client
- Styling

---

## ❌ REPO YANG TIDAK PERLU (Bisa dihapus)

- ❌ RobertoRamadhan/LARAVEL_API
- ❌ RobertoRamadhan/readpoint-backend (jika ada duplikat)
- ❌ RobertoRamadhan/pbl-upa-pp-cmms
- ❌ RobertoRamadhan/pratikum10
- ❌ RobertoRamadhan/pratikum-9
- ❌ RobertoRamadhan/pointblank
- ❌ Dan repo lainnya yang tidak digunakan

---

## 📋 WORKFLOW GIT

### Backend Workflow
```bash
cd d:\READPOINT\backend

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

### Frontend Workflow
```bash
cd d:\READPOINT\frontend

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

---

## 🔧 KONFIGURASI YANG SUDAH DILAKUKAN

### Backend (.env)
```env
APP_URL=https://readpoint-backend-main-odr7ck.laravel.cloud
APP_ENV=production
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,readpoint.vercel.app,readpoint-apjvw08l3-robertoramadhans-projects.vercel.app
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=https://readpoint-backend-main-odr7ck.laravel.cloud
```

### Frontend (.gitignore)
```
# Ignore backend folder (separate repo)
../backend/
```

---

## 🚀 DEPLOYMENT

### Backend Deployment
1. Push ke `RobertoRamadhan/readpoint-backend`
2. Laravel Cloud auto-deploy
3. Check: https://readpoint-backend-main-odr7ck.laravel.cloud/api/test

### Frontend Deployment
1. Push ke `RobertoRamadhan/READPOINT`
2. Vercel auto-deploy
3. Check: https://readpoint-apjvw08l3-robertoramadhans-projects.vercel.app

---

## 📊 SUMMARY

| Komponen | Repo | Folder | Hosted |
|----------|------|--------|--------|
| **Backend** | readpoint-backend | d:\READPOINT\backend | Laravel Cloud |
| **Frontend** | READPOINT | d:\READPOINT\frontend | Vercel |

---

## ✨ TIPS

1. **Jangan mix backend dan frontend di satu repo**
   - Backend punya dependency Laravel
   - Frontend punya dependency Node.js
   - Lebih mudah di-manage terpisah

2. **Gunakan .gitignore dengan benar**
   - Frontend ignore backend folder
   - Backend ignore node_modules, vendor, .env

3. **Commit message yang jelas**
   - ✅ "Fix: Update CORS configuration"
   - ❌ "update"

4. **Push ke repo yang benar**
   - Backend changes → push ke readpoint-backend
   - Frontend changes → push ke READPOINT

---

## 🎯 NEXT STEPS

1. ✅ Gunakan hanya 2 repo utama
2. ✅ Jangan push backend changes ke frontend repo
3. ✅ Jangan push frontend changes ke backend repo
4. ✅ Hapus repo yang tidak perlu (optional)

---

## 📞 QUICK REFERENCE

### Backend
```bash
cd d:\READPOINT\backend
git add .
git commit -m "Your message"
git push origin main
```

### Frontend
```bash
cd d:\READPOINT\frontend
git add .
git commit -m "Your message"
git push origin main
```

---

Sekarang struktur repo Anda sudah rapi! 🎉

