<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Register custom middleware
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
            'guru' => \App\Http\Middleware\IsGuru::class,
            'siswa' => \App\Http\Middleware\IsSiswa::class,
            'verify.ownership' => \App\Http\Middleware\VerifyUserOwnership::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Illuminate\Http\Request $request) {
            // Handle unauthenticated API requests
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'Unauthenticated'], 401);
                }
            }
            // Handle missing login route for API requests
            if ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException) {
                if ($request->expectsJson() && strpos($request->path(), 'api') === 0) {
                    return response()->json(['message' => 'Unauthenticated'], 401);
                }
            }
            return null;
        });
    })->create();
