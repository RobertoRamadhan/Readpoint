<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://readpointku.com',
        'https://www.readpointku.com',
        'https://readpoint.vercel.app',
        'https://*.vercel.app',
        'https://readpoint-production.up.railway.app',
    ],

    'allowed_origins_patterns' => [
        '#^https://(www\.)?readpointku\.com$#',
        '#^https://.*\.vercel\.app$#',
        '#^http://localhost:\d+$#',
        '#^http://127\.0\.0\.1:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
