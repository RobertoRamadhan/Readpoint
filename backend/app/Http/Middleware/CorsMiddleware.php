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
    ];

    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');

        $isAllowed = in_array($origin, $this->allowedOrigins)
            || preg_match('#^https://.*\.vercel\.app$#', $origin ?? '')
            || preg_match('#^https://.*\.laravel\.cloud$#', $origin ?? '');

        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
            if ($isAllowed && $origin) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, X-XSRF-TOKEN');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
                $response->headers->set('Access-Control-Max-Age', '86400');
            }
            return $response;
        }

        $response = $next($request);

        if ($isAllowed && $origin) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, X-XSRF-TOKEN');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }
}
