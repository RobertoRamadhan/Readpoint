<?php

$defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://readpointku.web.id',
    'https://www.readpointku.web.id',
    'https://readpoint-production-g6uam2.laravel.cloud',
];

$allowedOrigins = array_values(array_filter(
    array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', implode(',', $defaultOrigins)))),
    fn (string $origin) => $origin !== ''
));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [
        '#^https://(www\.)?readpointku\.web\.id$#',
        '#^https://.*\.readpointku\.web\.id$#',
        '#^https://.*\.vercel\.app$#',
        '#^https://.*\.laravel\.cloud$#',
        '#^https://.*\.ngrok-free\.app$#',
        '#^https://.*\.app\.github\.dev$#',
        '#^https?://localhost:\d+$#',
        '#^https?://127\.0\.0\.1:\d+$#',
        '#^https?://.*\.web\.id$#',
    ],

    'allowed_headers' => [
        'Origin',
        'Content-Type',
        'X-Requested-With',
        'Accept',
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,
];