<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    private array $allowedOrigins = [
        'https://readpointku.web.id',
        'https://www.readpointku.web.id',
        'https://readpoint-production-g6uam2.laravel.cloud',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ];

    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');

        $isAllowed = $this->matchesAllowedOrigin($origin);

        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
            if ($isAllowed && $origin) {
                $this->applyCorsHeaders($response, $origin);
                $response->headers->set('Access-Control-Max-Age', '86400');
            }

            return $response;
        }

        $response = $next($request);

        if ($isAllowed && $origin) {
            $this->applyCorsHeaders($response, $origin);
        }

        return $response;
    }

    private function matchesAllowedOrigin(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        if (in_array($origin, $this->allowedOrigins, true)) {
            return true;
        }

        $patterns = [
            '#^https://.*\.readpointku\.web\.id$#',
            '#^https://.*\.vercel\.app$#',
            '#^https://.*\.laravel\.cloud$#',
            '#^https://.*\.ngrok-free\.app$#',
            '#^https://.*\.app\.github\.dev$#',
            '#^https?://localhost:\d+$#',
            '#^https?://127\.0\.0\.1:\d+$#',
            '#^https?://.*\.web\.id$#',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                return true;
            }
        }

        return false;
    }

    private function applyCorsHeaders($response, string $origin): void
    {
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Vary', 'Origin');
    }
}
