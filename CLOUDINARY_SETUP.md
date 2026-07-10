# ☁️ Cloudinary Setup Guide

Cloudinary adalah cloud storage untuk menyimpan file PDF dan gambar dengan CDN built-in.

## 🎯 Kenapa Cloudinary?

✅ **Free tier 25GB** storage
✅ **CDN global** (loading cepat)
✅ **Auto image optimization**
✅ **Persistent storage** (file tidak hilang saat redeploy)
✅ **Support PDF & images**

---

## 📝 Step 1: Daftar Cloudinary

1. Buka: https://cloudinary.com/users/register/free
2. Daftar dengan email atau Google
3. Verify email Anda
4. Login ke Cloudinary Dashboard

---

## 🔑 Step 2: Dapatkan Credentials

Setelah login, di **Dashboard** halaman pertama, Anda akan melihat:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123456
```

**📋 COPY ketiga nilai ini!**

---

## ⚙️ Step 3: Set Environment Variables di Railway

1. Buka Railway Dashboard: https://railway.app
2. Pilih project: **readpoint-backend-production**
3. Klik tab **"Variables"**
4. **Add/Update** variables berikut:

```bash
FILESYSTEM_DISK=cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

5. **Save** (Railway akan auto-redeploy)

---

## 🧪 Step 4: Test Upload

Setelah Railway redeploy selesai, test upload:

1. Login ke aplikasi
2. Upload gambar atau PDF
3. File akan tersimpan di Cloudinary
4. URL file akan seperti: `https://res.cloudinary.com/your_cloud_name/image/upload/...`

---

## 📊 Step 5: Monitor Usage

Di Cloudinary Dashboard, Anda bisa monitor:
- **Storage used** (berapa GB sudah terpakai)
- **Bandwidth** (berapa banyak file di-download)
- **Transformations** (berapa kali image di-optimize)

Free tier limits:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

---

## 🔄 Alternative: Gunakan Local Storage (Sementara)

Jika belum siap pakai Cloudinary, bisa gunakan local storage dulu:

### Di Railway Variables, set:
```bash
FILESYSTEM_DISK=public
```

**⚠️ Warning:** File akan hilang setiap kali redeploy!

---

## 🛠️ Troubleshooting

### Error: "Cloudinary credentials not found"
- Pastikan environment variables sudah di-set di Railway
- Cek ejaan: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Redeploy Railway setelah update variables

### Error: "Invalid Cloudinary URL"
- Pastikan tidak ada spasi di credentials
- Pastikan API Secret benar (case-sensitive)

### File tidak muncul
- Cek di Cloudinary Dashboard → Media Library
- Pastikan FILESYSTEM_DISK=cloudinary
- Clear cache: `php artisan config:clear`

---

## 📚 Laravel Usage Example

```php
// Upload file
$path = $request->file('pdf')->store('ebooks', 'cloudinary');

// Get URL
$url = Storage::disk('cloudinary')->url($path);

// Delete file
Storage::disk('cloudinary')->delete($path);
```

---

## 💰 Upgrade ke Paid Plan (Optional)

Jika free tier tidak cukup:
- **Plus Plan**: $99/month - 200GB storage
- **Advanced Plan**: $249/month - Unlimited storage

Tapi untuk development & small projects, free tier sudah cukup!
