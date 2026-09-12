<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_merge(
        [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://readpointku.web.id',
            'https://www.readpointku.web.id',
            'https://readpoint.vercel.app',
            'https://readpoint-production-ujjwtt.laravel.cloud',
            'https://readpoint-production-aml3x0.laravel.cloud',
        ],
        explode(',', env('CORS_ALLOWED_ORIGINS', ''))
    )),

    'allowed_origins_patterns' => [
        '#^https://(www\.)?readpointku\.web\.id$#',
        '#^https://.*\.vercel\.app$#',
        '#^https://.*\.laravel\.cloud$#',
        '#^https://.*\.pages\.dev$#',
        '#^http://localhost:\d+$#',
        '#^http://127\.0\.0\.1:\d+$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];