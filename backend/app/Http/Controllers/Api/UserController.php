<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        $query = User::query();

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

        $users = $query->select('id', 'name', 'email', 'role', 'grade_level', 'class_name')
            ->paginate(15);

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
            if (!$isSelfUpdate) {
                return response()->json([
                    'message' => 'Cannot change password for other users',
                ], 403);
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
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->profile_photo_url && file_exists(storage_path('app/public/' . $user->profile_photo_url))) {
                unlink(storage_path('app/public/' . $user->profile_photo_url));
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
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
        $user->profile_photo_url = $user->profile_photo_url ? asset('storage/' . $user->profile_photo_url) : null;

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
}
