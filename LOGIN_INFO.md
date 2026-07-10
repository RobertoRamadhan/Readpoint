# 🔐 Informasi Login - Readpoint

## 📌 URL Login

**Production:** https://readpoint.vercel.app/login

**Backend API:** https://readpoint-backend-production.up.railway.app/api

---

## 👤 Akun Default (Dari Database Seeder)

### Admin
```
Email: admin@gmail.com
Password: password
```

### Guru (Teacher)
```
Email: gurui@gmail.com
Password: password
```

### Siswa (Student)
```
Email: rina@gmail.com
Password: password
```

---

## ⚠️ MASALAH SAAT INI

### 1. Regular Login (Email & Password) - STATUS: ❌ BELUM BISA

**Error:** 401 Unauthorized saat hit endpoint `/api/auth/login`

**Penyebab:**
- Backend Railway belum dikonfigurasi dengan benar untuk CORS
- Environment variables `SANCTUM_STATEFUL_DOMAINS` belum diset
- Token tidak bisa dikirim dari Vercel ke Railway

**Solusi:**
Update environment variables di **Railway Dashboard**:
```env
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
APP_URL=https://readpoint-backend-production.up.railway.app
FRONTEND_URL=https://readpoint.vercel.app
```

### 2. Google Sign-In - STATUS: ⚠️ PERLU UPDATE DI VERCEL

**Client ID Baru:** `688719292172-t5rjg8d8fjbi6evke47ef4q1mcqq5jjg.apps.googleusercontent.com`

**Sudah Diupdate:**
- ✅ File lokal (.env, .env.local)
- ✅ Google Cloud Console (OAuth Client ID sudah dibuat)

**Masih Perlu:**
- ❌ Update environment variable `NEXT_PUBLIC_GOOGLE_CLIENT_ID` di **Vercel Dashboard**
- ❌ Redeploy Vercel setelah update

---

## ✅ LANGKAH PERBAIKAN

### PRIORITAS 1: Update Railway Environment Variables

**Paling Penting!** Tanpa ini, login email/password tidak akan berfungsi.

1. Buka: https://railway.app/
2. Login dan pilih project **readpoint-backend-production**
3. Klik **Variables**
4. **Tambah/Update** variable berikut:

```env
SANCTUM_STATEFUL_DOMAINS=readpoint.vercel.app,*.vercel.app,localhost:3000
SESSION_DRIVER=database
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
APP_URL=https://readpoint-backend-production.up.railway.app
FRONTEND_URL=https://readpoint.vercel.app
```

5. Klik **Save** atau **Deploy**
6. Railway akan otomatis redeploy (~2-3 menit)

---

### PRIORITAS 2: Update Vercel Environment Variables

**Untuk Google Sign-In berfungsi di production.**

1. Buka: https://vercel.com/dashboard
2. Pilih project **readpoint**
3. **Settings** → **Environment Variables**
4. Cari atau tambah `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
5. Value: `688719292172-t5rjg8d8fjbi6evke47ef4q1mcqq5jjg.apps.googleusercontent.com`
6. Environment: Centang **Production**, **Preview**, **Development**
7. Klik **Save**
8. Tab **Deployments** → Klik **...** → **Redeploy**

---

### PRIORITAS 3: Tambah Test User di Google Cloud Console

**Agar bisa login dengan Google di production.**

1. Buka: https://console.cloud.google.com/apis/credentials/consent
2. Scroll ke **"Test users"**
3. Klik **"+ ADD USERS"**
4. Tambahkan email yang mau bisa login, misalnya:
   - `robertonovember.r@gmail.com`
   - `admin@gmail.com` (jika pakai Gmail)
5. Klik **ADD** → **SAVE**

---

## 🧪 CARA TEST SETELAH PERBAIKAN

### Test 1: Login Admin (Email & Password)

1. Buka: https://readpoint.vercel.app/login
2. Masukkan:
   ```
   Email: admin@gmail.com
   Password: password
   ```
3. Klik **Masuk**
4. ✅ Harus berhasil login → redirect ke dashboard admin

### Test 2: Login dengan Google

1. Buka: https://readpoint.vercel.app/login
2. Klik tombol **Sign in with Google**
3. Pilih akun Google yang sudah ditambahkan sebagai test user
4. Mungkin muncul warning "This app isn't verified":
   - Klik **Advanced**
   - Klik **Go to Readpoint (unsafe)**
5. ✅ Harus berhasil login → redirect ke dashboard

### Test 3: Login Guru

```
Email: gurui@gmail.com
Password: password
```

### Test 4: Login Siswa

```
Email: rina@gmail.com
Password: password
```

---

## 🐛 Troubleshooting

### Masalah: Login gagal dengan "Email atau password salah"

**Padahal password benar!**

**Penyebab:** Database mungkin belum di-seed atau user belum dibuat.

**Solusi:**
1. Cek apakah database sudah di-seed:
   ```bash
   # Dari backend folder
   php artisan db:seed --class=UserSeeder
   ```
2. Atau buat user manual via Railway console:
   ```bash
   php artisan tinker
   
   User::create([
       'name' => 'Admin',
       'email' => 'admin@gmail.com',
       'password' => Hash::make('password'),
       'role' => 'admin',
       'email_verified_at' => now()
   ]);
   ```

### Masalah: 401 Unauthorized

**Error di network tab: `/api/auth/login` return 401**

**Solusi:** Update Railway environment variables (Prioritas 1 di atas)

### Masalah: CORS Error

**Error:** "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solusi:**
1. Pastikan Railway env variables sudah diset (lihat Prioritas 1)
2. Tunggu Railway selesai redeploy
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Try in Incognito mode

### Masalah: Google Sign-In 403 Forbidden

**Error:** "The OAuth client was not found"

**Solusi:**
1. Update Vercel environment variable (Prioritas 2)
2. Pastikan authorized domains di Google Console sudah benar
3. Tunggu 5-10 menit untuk propagasi

---

## 📊 Status Checklist

### Backend (Railway)
- [ ] Environment variables updated
- [ ] Railway redeployed
- [ ] Database seeded dengan user default
- [ ] CORS configured properly

### Frontend (Vercel)
- [ ] Google Client ID updated di environment variables
- [ ] Vercel redeployed
- [ ] Test login berhasil

### Google Cloud Console
- [ ] OAuth Client ID created
- [ ] Authorized domains added
- [ ] Test users added

---

## 🎯 Setelah Semua Diupdate

Ketiga cara login ini harus berfungsi:

1. ✅ **Admin login** (admin@gmail.com / password)
2. ✅ **Guru login** (gurui@gmail.com / password)  
3. ✅ **Siswa login** (rina@gmail.com / password)
4. ✅ **Google Sign-In** (untuk email yang didaftarkan sebagai test user)

---

## 💡 Tips

- **Password default semua akun:** `password`
- **Admin** bisa akses semua fitur
- **Guru** bisa manage quiz dan validasi
- **Siswa** bisa baca buku dan redeem reward
- Google Sign-In otomatis create user dengan role **siswa**

---

## 📞 Butuh Bantuan?

Jika setelah update environment variables masih belum bisa login:

1. Check Railway logs untuk error backend
2. Check browser console (F12) untuk error frontend
3. Test endpoint langsung dengan cURL:
   ```bash
   curl -X POST https://readpoint-backend-production.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@gmail.com","password":"password"}'
   ```

Jika response 200 OK, berarti backend OK, masalahnya di frontend/CORS.
Jika response 401, berarti ada masalah di backend (user tidak ada atau password salah).
