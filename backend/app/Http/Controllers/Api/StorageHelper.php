<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;

/**
 * Helper untuk upload dan URL generation ke Supabase Storage.
 * Setiap tipe file punya bucket/disk sendiri.
 */
class StorageHelper
{
    const SUPABASE_PUBLIC = 'https://psisptiypxkzvyrzwjlt.supabase.co/storage/v1/object/public';

    /**
     * Upload file ke bucket yang sesuai.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  string  $type  — 'ebook', 'cover', 'avatar', 'reward'
     * @param  string|null  $filename
     * @return string  path yang disimpan (format: "{type}/{filename}")
     */
    public static function upload($file, string $type, ?string $filename = null): string
    {
        $disk     = self::diskFor($type);
        $folder   = self::folderFor($type);
        $filename = $filename ?? uniqid($type . '_', true) . '.' . $file->getClientOriginalExtension();
        $path     = $folder . '/' . $filename;

        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()), 'public');

        return $path;
    }

    /**
     * Hapus file dari bucket.
     */
    public static function delete(?string $path, string $type): void
    {
        if (!$path) return;
        Storage::disk(self::diskFor($type))->delete($path);
    }

    /**
     * Buat public URL untuk file yang sudah disimpan.
     */
    public static function url(?string $path, string $type): ?string
    {
        if (!$path) return null;
        $bucket = self::bucketFor($type);
        // Format: https://...supabase.co/storage/v1/object/public/{bucket}/{path}
        return self::SUPABASE_PUBLIC . '/' . $bucket . '/' . ltrim($path, '/');
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static function diskFor(string $type): string
    {
        return match ($type) {
            'ebook'  => 'supabase_ebooks',
            'cover'  => 'supabase_covers',
            'avatar' => 'supabase_avatars',
            'reward' => 'supabase_rewards',
            default  => config('filesystems.default'),
        };
    }

    private static function bucketFor(string $type): string
    {
        return match ($type) {
            'ebook'  => 'ebooks',
            'cover'  => 'covers',
            'avatar' => 'avatars',
            'reward' => 'rewards',
            default  => env('AWS_BUCKET', 'ebooks'),
        };
    }

    private static function folderFor(string $type): string
    {
        return match ($type) {
            'ebook'  => 'pdfs',
            'cover'  => 'images',
            'avatar' => 'photos',
            'reward' => 'images',
            default  => 'misc',
        };
    }
}
