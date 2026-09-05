# VERCEL ENVIRONMENT VARIABLES SETUP

## ⚠️ PENTING - WAJIB DISET DI VERCEL DASHBOARD!

File .env lokal TIDAK AKAN DI-PUSH ke Vercel.
Anda HARUS menambahkan environment variables di Vercel Dashboard.

---

## 📋 VARIABLES YANG HARUS DI-INPUT DI VERCEL:

### Variable 1: NEXT_PUBLIC_API_URL

**Name:**
NEXT_PUBLIC_API_URL

**Value:**
https://readpoint-production-gmzqxi.laravel.cloud/api

**Environment:**
☑ Production
☑ Preview
☑ Development

---

### Variable 2: NEXT_PUBLIC_GOOGLE_CLIENT_ID

**Name:**
NEXT_PUBLIC_GOOGLE_CLIENT_ID

**Value:**
688719292172-n16echr1dclbo9nrhar85ucg4e5n4ub8.apps.googleusercontent.com

**Environment:**
☑ Production
☑ Preview
☑ Development

---

## 🚀 CARA INPUT DI VERCEL DASHBOARD:

1. Buka: https://vercel.com/dashboard
2. Pilih project: Readpoint
3. Klik: Settings → Environment Variables
4. Klik: "Add New" atau "Add Variable"
5. Input Name dan Value seperti di atas
6. Centang semua Environment (Production, Preview, Development)
7. Klik: "Save"
8. Ulangi untuk variable kedua
9. Setelah semua di-save, klik tab "Deployments"
10. Klik ⋯ (titik tiga) pada deployment teratas
11. Klik "Redeploy"
12. Tunggu deployment selesai (~2-3 menit)

---

## ✅ VERIFICATION:

Setelah redeploy selesai, buka browser console (F12) di https://readpointku.web.id/login dan jalankan:

```javascript
console.log('Environment Check:', {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
});
```

Harusnya muncul URL yang benar, bukan 'undefined' atau 'localhost:8000'

---

## 🔴 JIKA MASIH "Failed to fetch":

1. Pastikan environment variables sudah di-save di Vercel Dashboard
2. Pastikan sudah redeploy SETELAH menambahkan variables
3. Tunggu 5-10 menit untuk propagation
4. Hard refresh browser (Ctrl+Shift+R atau Cmd+Shift+R)
5. Test lagi di Incognito/Private mode

---

Generated: 2026-09-05 11:06:40
