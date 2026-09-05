<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:8',
        ], [
            'email.required' => 'Email harus diisi',
            'email.email' => 'Email tidak valid',
            'password.required' => 'Password harus diisi',
            'password.min' => 'Password minimal 8 karakter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data login tidak valid',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Email atau password salah'
                ], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil',
                'user'    => $this->formatUser($user),
                'token'   => $token,
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Layanan login sedang mengalami gangguan. Periksa konfigurasi database server.',
            ], 503);
        }
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|min:3|max:255',
            'email'        => 'required|email|max:255|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
            'role'         => 'required|in:siswa',
            'grade_level'  => 'required_if:role,siswa|in:1,2,3',
            'class_name'   => 'nullable|string|max:255',
        ], [
            'name.required'           => 'Nama harus diisi',
            'name.min'                => 'Nama minimal 3 karakter',
            'email.required'          => 'Email harus diisi',
            'email.email'             => 'Email tidak valid',
            'email.unique'            => 'Email sudah terdaftar',
            'password.required'       => 'Password harus diisi',
            'password.min'            => 'Password minimal 8 karakter',
            'password.confirmed'      => 'Konfirmasi password tidak sesuai',
            'role.in'                 => 'Role tidak valid',
            'grade_level.required_if' => 'Kelas harus dipilih untuk siswa',
            'grade_level.in'          => 'Kelas tidak valid (1, 2, atau 3)',
        ]);

        try {
            // Only siswa can self-register
            if ($validated['role'] !== 'siswa') {
                return response()->json([
                    'message' => 'Hanya siswa yang dapat mendaftar sendiri'
                ], 403);
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'grade_level' => $validated['grade_level'],
                'class_name' => $validated['class_name'] ?? null,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Pendaftaran berhasil',
                'user'    => $this->formatUser($user),
                'token'   => $token,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mendaftar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function googleLogin(Request $request)
    {
        $validated = $request->validate([
            'credential' => 'required|string',
        ]);

        try {
            $payload = $this->verifyGoogleJwt($validated['credential']);

            if (!$payload || !isset($payload['email'])) {
                return response()->json([
                    'message' => 'Token Google tidak valid',
                ], 400);
            }

            // Pastikan token belum expired
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return response()->json([
                    'message' => 'Token Google sudah kedaluwarsa',
                ], 401);
            }

            $email    = $payload['email'];
            $name     = $payload['name'] ?? $email;
            $googleId = $payload['sub'] ?? null;

            // Find or create user
            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'name'              => $name,
                    'email'             => $email,
                    'password'          => Hash::make(\Illuminate\Support\Str::random(32)),
                    'role'              => 'siswa',
                    'grade_level'       => null, // Siswa baru harus melengkapi profil
                    'google_id'         => $googleId,
                    'email_verified_at' => now(),
                ]);
            } else {
                if (!$user->google_id && $googleId) {
                    $user->update(['google_id' => $googleId]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil',
                'user'    => $this->formatUser($user),
                'token'   => $token,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Google login gagal: ' . $e->getMessage(),
            ], 500);
        }
    }

    
    /**
     * Format user data untuk response — hindari serialize seluruh model
     * yang bisa trigger lazy-load relasi atau crash di production.
     */
    private function formatUser(User $user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'role'              => $user->role,
            'grade_level'       => $user->grade_level,
            'class_name'        => $user->class_name,
            'wali_kelas_id'     => $user->wali_kelas_id,
            'profile_photo_url' => $user->profile_photo_url,
            'google_id'         => $user->google_id,
            'email_verified_at' => $user->email_verified_at,
            'created_at'        => $user->created_at,
        ];
    }
/**
     * Verifikasi Google ID Token (JWT) menggunakan Google public keys (JWKS).
     * Mengembalikan payload jika valid, melempar Exception jika tidak valid.
     *
     * @throws \Exception
     */
    private function verifyGoogleJwt(string $credential): array
    {
        $parts = explode('.', $credential);
        if (count($parts) !== 3) {
            throw new \Exception('Format JWT tidak valid');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $encodedHeader)), true);
        if (!$header || !isset($header['kid'])) {
            throw new \Exception('JWT header tidak valid');
        }

        // Ambil Google public keys (JWKS).
        // Gunakan file cache store secara eksplisit agar tidak bergantung
        // pada CACHE_DRIVER=database yang memerlukan koneksi DB.
        $cacheKey = 'google_jwks';
        $fileCache = \Illuminate\Support\Facades\Cache::store('file');
        $jwks = $fileCache->remember($cacheKey, 3600, function () {
            // Gunakan Http client dengan timeout 5 detik agar worker PHP
            // tidak hang jika Google lambat atau tidak reachable.
            $response = \Illuminate\Support\Facades\Http::timeout(5)
                ->get('https://www.googleapis.com/oauth2/v3/certs');

            if (!$response->successful()) {
                throw new \Exception(
                    'Tidak bisa mengambil Google public keys (HTTP ' . $response->status() . ')'
                );
            }

            return $response->json();
        });

        // Cari key yang sesuai dengan kid di header
        $matchingKey = null;
        foreach ($jwks['keys'] ?? [] as $key) {
            if (($key['kid'] ?? '') === $header['kid']) {
                $matchingKey = $key;
                break;
            }
        }

        if (!$matchingKey) {
            // kid tidak ditemukan — mungkin keys sudah dirotasi, flush cache dan coba ulang
            \Illuminate\Support\Facades\Cache::store('file')->forget($cacheKey);
            throw new \Exception('Google public key tidak ditemukan untuk kid: ' . $header['kid']);
        }

        // Verifikasi signature menggunakan OpenSSL
        $signatureInput  = $encodedHeader . '.' . $encodedPayload;
        $signatureBytes  = base64_decode(str_replace(['-', '_'], ['+', '/'], $encodedSignature));
        $publicKeyPem    = $this->jwkToPem($matchingKey);
        $publicKey       = openssl_pkey_get_public($publicKeyPem);

        if (!$publicKey) {
            throw new \Exception('Gagal memuat Google public key');
        }

        $algorithm = strtoupper($header['alg'] ?? 'RS256');
        $opensslAlgo = match ($algorithm) {
            'RS256' => OPENSSL_ALGO_SHA256,
            'RS384' => OPENSSL_ALGO_SHA384,
            'RS512' => OPENSSL_ALGO_SHA512,
            default => throw new \Exception("Algoritma JWT tidak didukung: {$algorithm}"),
        };

        $verified = openssl_verify($signatureInput, $signatureBytes, $publicKey, $opensslAlgo);
        if ($verified !== 1) {
            throw new \Exception('Signature JWT tidak valid');
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $encodedPayload)), true);
        if (!$payload) {
            throw new \Exception('Payload JWT tidak valid');
        }

        // Verifikasi issuer dan audience
        $validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (!in_array($payload['iss'] ?? '', $validIssuers)) {
            throw new \Exception('Issuer JWT tidak valid');
        }

        // Audience WAJIB divalidasi — hard-fail jika client_id tidak dikonfigurasi.
        // Tanpa ini, token dari aplikasi Google manapun akan diterima.
        $clientId = config('services.google.client_id');
        if (!$clientId) {
            throw new \Exception(
                'Konfigurasi GOOGLE_CLIENT_ID tidak ditemukan. ' .
                'Tambahkan GOOGLE_CLIENT_ID ke file .env.'
            );
        }
        if (($payload['aud'] ?? '') !== $clientId) {
            throw new \Exception('Audience JWT tidak sesuai dengan aplikasi ini');
        }

        return $payload;
    }

    /**
     * Konversi JWK (RSA public key dalam format JSON) ke PEM.
     */
    private function jwkToPem(array $jwk): string
    {
        if (!isset($jwk['n'], $jwk['e'])) {
            throw new \Exception('JWK tidak memiliki field n atau e');
        }

        $modulus  = base64_decode(str_replace(['-', '_'], ['+', '/'], $jwk['n']));
        $exponent = base64_decode(str_replace(['-', '_'], ['+', '/'], $jwk['e']));

        // Encode ke DER format
        $modulus  = ltrim($modulus, "\x00");
        if (ord($modulus[0]) > 0x7f) {
            $modulus = "\x00" . $modulus;
        }

        $exponent = ltrim($exponent, "\x00");

        $encodeLength = function (int $len): string {
            if ($len <= 0x7f) return chr($len);
            $bytes = '';
            while ($len > 0) { $bytes = chr($len & 0xff) . $bytes; $len >>= 8; }
            return chr(0x80 | strlen($bytes)) . $bytes;
        };

        $der = "\x30" . $encodeLength(
            2 + strlen($encodeLength(strlen($modulus))) + strlen($modulus) +
            2 + strlen($encodeLength(strlen($exponent))) + strlen($exponent)
        );
        $der .= "\x02" . $encodeLength(strlen($modulus)) . $modulus;
        $der .= "\x02" . $encodeLength(strlen($exponent)) . $exponent;

        // Wrap dalam SubjectPublicKeyInfo
        $rsaOid   = "\x30\x0d\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01\x05\x00";
        $bitString = "\x03" . $encodeLength(strlen($der) + 1) . "\x00" . $der;
        $spki      = "\x30" . $encodeLength(strlen($rsaOid) + strlen($bitString)) . $rsaOid . $bitString;

        return "-----BEGIN PUBLIC KEY-----\n" .
               chunk_split(base64_encode($spki), 64, "\n") .
               "-----END PUBLIC KEY-----\n";
    }
}
