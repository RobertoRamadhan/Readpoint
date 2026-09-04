<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * VerifyUserOwnership
 *
 * Memastikan user hanya bisa mengakses resource miliknya sendiri.
 * Middleware ini bekerja dengan mencocokkan route parameter `{user}` atau `{id}`
 * dengan ID user yang sedang login.
 *
 * Admin selalu diizinkan melewati pemeriksaan ini.
 *
 * Penggunaan di routes:
 *   Route::middleware(['auth:sanctum', 'verify.ownership'])->group(...)
 */
class VerifyUserOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authUser = $request->user();

        // Admin melewati semua pemeriksaan kepemilikan
        if ($authUser && $authUser->role === 'admin') {
            return $next($request);
        }

        // Ambil ID target dari route parameter — coba 'user' lalu 'id'
        $targetId = $request->route('user') ?? $request->route('id');

        // Jika route tidak mengandung parameter user/id, lanjutkan tanpa cek
        if ($targetId === null) {
            return $next($request);
        }

        // Normalkan: jika $targetId adalah model Eloquent, ambil primary key-nya
        $targetId = is_object($targetId) ? $targetId->getKey() : $targetId;

        if ((int) $targetId !== (int) $authUser?->id) {
            return response()->json([
                'message' => 'Forbidden: Anda tidak punya akses ke resource ini.',
            ], 403);
        }

        return $next($request);
    }
}
