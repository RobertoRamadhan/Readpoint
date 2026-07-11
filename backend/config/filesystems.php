<?php

return [

    'default' => env('FILESYSTEM_DISK', 's3'),

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root'   => storage_path('app/private'),
            'serve'  => true,
            'throw'  => false,
            'report' => false,
        ],

        'public' => [
            'driver'     => 'local',
            'root'       => storage_path('app/public'),
            'url'        => rtrim(env('APP_URL', 'http://localhost'), '/') . '/storage',
            'visibility' => 'public',
            'throw'      => false,
            'report'     => false,
        ],

        // ── Supabase S3-Compatible Storage ───────────────────────────────────
        // Default disk — dipakai oleh semua upload (ebooks, covers, avatars, rewards)
        // File disimpan dalam sub-folder sesuai bucket yang benar via path prefix.
        's3' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'bucket'                  => env('AWS_BUCKET', 'ebooks'),
            'url'                     => env('AWS_URL'),
            'endpoint'                => env('AWS_ENDPOINT', 'https://psisptiypxkzvyrzwjlt.storage.supabase.co/storage/v1/s3'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', true),
            'throw'                   => false,
        ],

        // Disk terpisah per bucket supaya file masuk ke bucket yang tepat
        'supabase_ebooks' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'bucket'                  => 'ebooks',
            'endpoint'                => env('AWS_ENDPOINT', 'https://psisptiypxkzvyrzwjlt.storage.supabase.co/storage/v1/s3'),
            'use_path_style_endpoint' => true,
            'throw'                   => false,
            'visibility'              => 'public',
        ],

        'supabase_covers' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'bucket'                  => 'covers',
            'endpoint'                => env('AWS_ENDPOINT', 'https://psisptiypxkzvyrzwjlt.storage.supabase.co/storage/v1/s3'),
            'use_path_style_endpoint' => true,
            'throw'                   => false,
            'visibility'              => 'public',
        ],

        'supabase_avatars' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'bucket'                  => 'avatars',
            'endpoint'                => env('AWS_ENDPOINT', 'https://psisptiypxkzvyrzwjlt.storage.supabase.co/storage/v1/s3'),
            'use_path_style_endpoint' => true,
            'throw'                   => false,
            'visibility'              => 'public',
        ],

        'supabase_rewards' => [
            'driver'                  => 's3',
            'key'                     => env('AWS_ACCESS_KEY_ID'),
            'secret'                  => env('AWS_SECRET_ACCESS_KEY'),
            'region'                  => env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'bucket'                  => 'rewards',
            'endpoint'                => env('AWS_ENDPOINT', 'https://psisptiypxkzvyrzwjlt.storage.supabase.co/storage/v1/s3'),
            'use_path_style_endpoint' => true,
            'throw'                   => false,
            'visibility'              => 'public',
        ],

    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
