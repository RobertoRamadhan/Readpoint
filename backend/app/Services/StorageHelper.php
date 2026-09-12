<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Helper untuk upload dan URL generation.
 * Menggunakan Laravel Storage (public disk untuk local, s3/cloud untuk production).
 * 
 * Environment-aware: otomatis pakai local storage saat development,
 * Cloud storage saat production (Cloudflare R2, AWS S3, etc).
 */
class StorageHelper
{
    /**
     * Upload file ke storage.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  string  $type  — 'ebook', 'cover', 'avatar', 'reward'
     * @param  string|null  $filename
     * @return string  path yang disimpan (format: "{folder}/{filename}")
     */
    public static function upload($file, string $type, ?string $filename = null): string
    {
        $disk     = self::getDisk();
        $folder   = self::folderFor($type);
        $filename = $filename ?? uniqid($type . '_', true) . '.' . $file->getClientOriginalExtension();
        $path     = $folder . '/' . $filename;

        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()), 'public');

        return $path;
    }

    /**
     * Hapus file dari storage.
     */
    public static function delete(?string $path, string $type): void
    {
        if (!$path) return;
        
        $disk = self::getDisk();
        
        if (Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    /**
     * Buat public URL untuk file yang sudah disimpan.
     * Menggunakan Laravel Storage::url() yang otomatis handle local/cloud.
     */
    public static function url(?string $path, string $type): ?string
    {
        if (!$path) return null;
        
        $disk = self::getDisk();
        
        // Laravel Storage otomatis generate URL yang benar
        // Local: http://localhost:8000/storage/path
        // Cloud: https://your-backend-api.com/storage/path
        return Storage::disk($disk)->url($path);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Ambil disk yang digunakan dari config.
     * Fallback ke 'public' untuk local development.
     */
    private static function getDisk(): string
    {
        $configuredDisk = config('filesystems.default');
        
        // Jika disk adalah 'local', redirect ke 'public' agar bisa diakses via web
        if ($configuredDisk === 'local') {
            return 'public';
        }
        
        return $configuredDisk;
    }

    /**
     * Tentukan folder berdasarkan tipe file.
     * Struktur: {type}/{filename}
     */
    private static function folderFor(string $type): string
    {
        return match ($type) {
            'ebook'  => 'ebooks/pdfs',
            'cover'  => 'ebooks/covers',
            'avatar' => 'avatars',
            'reward' => 'rewards',
            default  => 'misc',
        };
    }
}