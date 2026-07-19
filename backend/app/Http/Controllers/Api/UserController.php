<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\StorageHelper;

class UserController extends Controller
{
    /**
     * Get current authenticated user profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user()->load('waliKelas:id,name,email');
        
        if ($user->profile_photo_url) {
            $user->profile_photo_url = StorageHelper::url($user->profile_photo_url, 'avatar');
        }
        
        return response()->json(['data' => $user]);
    }

    /**
     * Update current authenticated user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'current_password' => 'sometimes|required_with:password',
            'password' => 'sometimes|string|min:6|confirmed',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        // Handle password change
        if (isset($validated['password'])) {
            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect',
                ], 422);
            }

            $user->password = Hash::make($validated['password']);
            unset($validated['password']);
            unset($validated['password_confirmation']);
            unset($validated['current_password']);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->profile_photo_url) {
                StorageHelper::delete($user->profile_photo_url, 'avatar');
            }
            $avatarPath = StorageHelper::upload($request->file('avatar'), 'avatar');
            $user->profile_photo_url = $avatarPath;
            unset($validated['avatar']);
        }

        $user->update($validated);

        // Refresh and add full URL to response
        $user->refresh();
        if ($user->profile_photo_url) {
            $user->profile_photo_url = StorageHelper::url($user->profile_photo_url, 'avatar');
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filter out deleted users (those with email containing 'deleted_' or '@deleted.local')
        $query->where('email', 'not like', 'deleted_%')
              ->where('email', 'not like', '%@deleted.local');

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->select('id', 'name', 'email', 'role', 'grade_level', 'class_name', 'wali_kelas_id')
            ->orderBy('created_at', 'desc')
            ->paginate((int) $request->input('per_page', 20));

        return response()->json([
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Get detailed user info including statistics
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        // Calculate user statistics
        $totalPoints = $user->getTotalPoints();
        $booksRead = $user->readingActivities()->where('status', 'completed')->count();
        $pagesRead = $user->readingActivities()->sum('final_page');
        $quizzesTaken = $user->quizAttempts()->count();

        return response()->json([
            'data' => [
                'user' => $user,
                'statistics' => [
                    'total_points' => $totalPoints,
                    'books_read' => $booksRead,
                    'pages_read' => $pagesRead ?? 0,
                    'quizzes_taken' => $quizzesTaken,
                ],
            ],
        ]);
    }

    /**
     * Update user info (Admin only or self-update)
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Check if user is updating their own profile or is admin
        $isSelfUpdate = $request->user()->id === $user->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isSelfUpdate && !$isAdmin) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'grade_level' => 'sometimes|in:1,2,3',
            'class_name' => 'sometimes|string|max:100',
            'role' => 'sometimes|in:siswa,guru,admin',
            'current_password' => 'sometimes|required_with:password',
            'password' => 'sometimes|string|min:6|confirmed',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        // Handle password change for self-update
        if (isset($validated['password'])) {
            // If admin is resetting password through update (not resetPassword endpoint)
            if ($isAdmin && !$isSelfUpdate) {
                $user->password = Hash::make($validated['password']);
                unset($validated['password']);
                unset($validated['password_confirmation']);
                if (isset($validated['current_password'])) {
                    unset($validated['current_password']);
                }
            } elseif ($isSelfUpdate) {
                // Self-update requires current password
                if (!isset($validated['current_password'])) {
                    return response()->json([
                        'message' => 'Current password is required to change your own password',
                    ], 422);
                }

                // Verify current password
                if (!Hash::check($validated['current_password'], $user->password)) {
                    return response()->json([
                        'message' => 'Current password is incorrect',
                    ], 422);
                }

                $user->password = Hash::make($validated['password']);
                unset($validated['password']);
                unset($validated['password_confirmation']);
                unset($validated['current_password']);
            } else {
                return response()->json([
                    'message' => 'Unauthorized to change this user password',
                ], 403);
            }
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->profile_photo_url) {
                StorageHelper::delete($user->profile_photo_url, 'avatar');
            }
            $avatarPath = StorageHelper::upload($request->file('avatar'), 'avatar');
            $user->profile_photo_url = $avatarPath;
            unset($validated['avatar']);
        }

        // Only admin can change role
        if (isset($validated['role']) && !$isAdmin) {
            unset($validated['role']);
        }

        $user->update($validated);

        // Refresh and add full URL to response
        $user->refresh();
        if ($user->profile_photo_url) {
            $user->profile_photo_url = StorageHelper::url($user->profile_photo_url, 'avatar');
        }

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Reset user password (Admin only)
     */
    public function resetPassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User password reset successfully',
        ]);
    }

    /**
     * Delete user (Admin only)
     */
    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting own account
        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        try {
            $forceDelete = filter_var($request->input('force', false), FILTER_VALIDATE_BOOLEAN);

            \DB::transaction(function () use ($user, $forceDelete) {
                // Selalu hapus data terkait terlebih dahulu
                // agar FK constraint tidak menghalangi delete user

                // 1. Validasi yang dibuat oleh user ini (jika guru)
                \App\Models\Validation::where('validated_by', $user->id)
                    ->update(['validated_by' => null]);

                // 2. Book assignments (jika guru)
                \App\Models\BookAssignment::where('teacher_id', $user->id)->delete();

                // 3. Quiz questions yang dibuat user ini (jika guru)
                \App\Models\QuizQuestion::where('created_by', $user->id)->delete();

                // 4. Wali kelas reference dari siswa
                User::where('wali_kelas_id', $user->id)
                    ->update(['wali_kelas_id' => null]);

                if ($forceDelete) {
                    // Hard delete — hapus semua data milik user secara permanen

                    // Point transactions terkait quiz attempts user ini
                    $quizAttemptIds = \App\Models\QuizAttempt::where('user_id', $user->id)
                        ->pluck('id');
                    if ($quizAttemptIds->isNotEmpty()) {
                        \App\Models\PointTransaction::whereIn('quiz_attempt_id', $quizAttemptIds)
                            ->delete();
                    }

                    // Point transactions langsung milik user
                    \App\Models\PointTransaction::where('user_id', $user->id)->delete();

                    // Redemptions
                    \App\Models\Redemption::where('user_id', $user->id)->delete();

                    // Quiz attempts (ini juga akan null-kan reading_activity_id via FK set null)
                    \App\Models\QuizAttempt::where('user_id', $user->id)->delete();

                    // Reading activities (cascade ke validations jika ada)
                    \App\Models\ReadingActivity::where('user_id', $user->id)->delete();

                    // Reading progress
                    \App\Models\ReadingProgress::where('user_id', $user->id)->delete();

                    // Hapus user permanen
                    $user->delete();
                } else {
                    // Soft deactivate — nonaktifkan akun tanpa hapus data historis
                    // Rename email agar tidak konflik, dan hapus record user-nya
                    $timestamp = time();
                    $user->email = "deleted_{$timestamp}_{$user->id}@deleted.local";
                    $user->name  = rtrim($user->name, ' (Deleted)') . ' (Deleted)';
                    $user->save();

                    // Sekarang delete bisa berhasil karena CASCADE sudah dipasang
                    // di migration reading_activities, tapi kita tetap hapus manual
                    // agar konsisten di semua environment
                    \App\Models\ReadingProgress::where('user_id', $user->id)->delete();
                    \App\Models\ReadingActivity::where('user_id', $user->id)->delete();
                    \App\Models\QuizAttempt::where('user_id', $user->id)->delete();
                    \App\Models\PointTransaction::where('user_id', $user->id)->delete();
                    \App\Models\Redemption::where('user_id', $user->id)->delete();

                    $user->delete();
                }
            });

            return response()->json([
                'message' => $forceDelete
                    ? 'User dan semua data terkait berhasil dihapus permanen.'
                    : 'User berhasil dihapus.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus user.',
                'error'   => config('app.debug') ? $e->getMessage() : 'Terjadi kesalahan server.',
            ], 500);
        }
    }

    /**
     * Create new user (Admin only)
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:siswa,guru,admin',
            'grade_level' => 'required_if:role,siswa|in:1,2,3',
            'class_name' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'grade_level' => $validated['grade_level'] ?? null,
            'class_name' => $validated['class_name'] ?? null,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Get statistics (Admin dashboard)
     */
    public function getStatistics()
    {
        $totalSiswa = User::where('role', 'siswa')->count();
        $totalGuru = User::where('role', 'guru')->count();
        $totalAdmin = User::where('role', 'admin')->count();

        return response()->json([
            'statistics' => [
                'total_siswa' => $totalSiswa,
                'total_guru' => $totalGuru,
                'total_admin' => $totalAdmin,
                'total_users' => $totalSiswa + $totalGuru + $totalAdmin,
            ],
        ]);
    }

    /**
     * Guru set kelas mereka — otomatis assign wali_kelas_id
     * ke semua siswa yang grade_level + class_name cocok.
     *
     * POST /api/user/set-class
     * Body: { grade_level: "1", class_name: "IPA" }
     */
    public function setGuruClass(Request $request)
    {
        $validated = $request->validate([
            'grade_level' => 'required|in:1,2,3',
            'class_name'  => 'required|string|max:100',
        ]);

        $guru = $request->user();

        // Update profil guru dengan kelas yang dipilih
        $guru->update([
            'grade_level' => $validated['grade_level'],
            'class_name'  => $validated['class_name'],
        ]);

        // Assign semua siswa di kelas tersebut ke guru ini sebagai wali kelas
        $updated = User::where('role', 'siswa')
            ->where('grade_level', $validated['grade_level'])
            ->where('class_name', $validated['class_name'])
            ->update(['wali_kelas_id' => $guru->id]);

        return response()->json([
            'message'       => "Kelas {$validated['grade_level']} {$validated['class_name']} berhasil diatur",
            'guru'          => $guru->fresh(),
            'siswa_updated' => $updated,
        ]);
    }
}
