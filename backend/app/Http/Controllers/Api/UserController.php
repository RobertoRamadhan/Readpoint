<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Services\StorageHelper;

class UserController extends Controller
{
    // â”€â”€â”€ Private Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Upload avatar baru, hapus avatar lama jika ada.
     * Mengupdate $user->profile_photo_url dan menyimpan path (bukan URL publik).
     * Mengembalikan path yang tersimpan, atau null jika tidak ada file.
     */
    private function handleAvatarUpload(Request $request, User $user): ?string
    {
        if (!$request->hasFile('avatar')) {
            return null;
        }

        // Hapus avatar lama dari storage
        if ($user->profile_photo_url) {
            StorageHelper::delete($user->profile_photo_url, 'avatar');
        }

        $path = StorageHelper::upload($request->file('avatar'), 'avatar');
        $user->profile_photo_url = $path;
        return $path;
    }

    /**
     * Validasi dan ganti password user.
     * Melempar response JSON 422 langsung jika password saat ini salah.
     *
     * @param  bool  $requireCurrentPassword  false untuk admin reset password user lain
     * @return bool  true jika password berhasil diganti, false jika tidak ada perubahan
     */
    private function handlePasswordChange(
        Request $request,
        User $user,
        array &$validated,
        bool $requireCurrentPassword = true
    ): bool {
        if (!isset($validated['password'])) {
            return false;
        }

        if ($requireCurrentPassword) {
            if (!isset($validated['current_password']) ||
                !Hash::check($validated['current_password'], $user->password)
            ) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json(['message' => 'Current password is incorrect'], 422)
                );
            }
        }

        $user->password = Hash::make($validated['password']);
        unset($validated['password'], $validated['password_confirmation'], $validated['current_password']);
        return true;
    }

    // â”€â”€â”€ Public Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
     * Update current authenticated user profile (self-update)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'email'            => 'sometimes|email|unique:users,email,' . $user->id,
            'current_password' => 'sometimes|required_with:password',
            'password'         => 'sometimes|string|min:8|confirmed',
            'avatar'           => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        // Ganti password (selalu butuh current_password untuk self-update)
        $this->handlePasswordChange($request, $user, $validated, requireCurrentPassword: true);

        // Upload avatar baru jika ada
        $this->handleAvatarUpload($request, $user);
        unset($validated['avatar']);

        $user->update($validated);
        $user->refresh();

        if ($user->profile_photo_url) {
            $user->profile_photo_url = StorageHelper::url($user->profile_photo_url, 'avatar');
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data'    => $user,
        ]);
    }

    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->where('email', 'not like', 'deleted_%')
            ->where('email', 'not like', '%@deleted.local');

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

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
            'data'       => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Get detailed user info including statistics
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'data' => [
                'user'       => $user,
                'statistics' => [
                    'total_points'  => $user->getTotalPoints(),
                    'books_read'    => $user->readingActivities()->where('status', 'completed')->count(),
                    'pages_read'    => $user->readingActivities()->sum('final_page') ?? 0,
                    'quizzes_taken' => $user->quizAttempts()->count(),
                ],
            ],
        ]);
    }

    /**
     * Update user info (Admin only or self-update)
     */
    public function update(Request $request, string $id)
    {
        $user         = User::findOrFail($id);
        $isSelfUpdate = $request->user()->id === $user->id;
        $isAdmin      = $request->user()->role === 'admin';

        if (!$isSelfUpdate && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'email'            => 'sometimes|email|unique:users,email,' . $id,
            'grade_level'      => 'sometimes|nullable|in:1,2,3',
            'class_name'       => 'sometimes|nullable|string|max:100',
            'role'             => 'sometimes|in:siswa,guru,admin',
            'current_password' => 'sometimes|required_with:password',
            'password'         => 'sometimes|string|min:8|confirmed',
            'avatar'           => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        $classTeacher = null;
        $syncStudentClass = $user->role === 'siswa'
            && (array_key_exists('grade_level', $validated) || array_key_exists('class_name', $validated));
        if ($syncStudentClass) {
            $gradeLevel = $validated['grade_level'] ?? $user->grade_level;
            $className = array_key_exists('class_name', $validated) ? $validated['class_name'] : $user->class_name;
            if ($gradeLevel && $className) {
                $teachers = User::where('role', 'guru')
                    ->where('grade_level', $gradeLevel)
                    ->where('class_name', $className)
                    ->limit(2)
                    ->get();
                if ($teachers->count() > 1) {
                    return response()->json(['message' => 'Kelas memiliki lebih dari satu wali kelas. Periksa data guru terlebih dahulu.'], 409);
                }
                $classTeacher = $teachers->first();
            }
        }

        // Admin mereset password user lain tidak butuh current_password
        $requireCurrent = $isSelfUpdate;
        if (!$isAdmin && !$isSelfUpdate) {
            return response()->json(['message' => 'Unauthorized to change this user password'], 403);
        }
        $this->handlePasswordChange($request, $user, $validated, requireCurrentPassword: $requireCurrent);

        // Upload avatar baru jika ada
        $this->handleAvatarUpload($request, $user);
        unset($validated['avatar']);

        // Hanya admin yang bisa ganti role
        if (isset($validated['role']) && !$isAdmin) {
            unset($validated['role']);
        }

        if ($syncStudentClass) {
            $validated['wali_kelas_id'] = $classTeacher?->id;
        }

        $user->update($validated);
        $user->refresh();

        if ($user->profile_photo_url) {
            $user->profile_photo_url = StorageHelper::url($user->profile_photo_url, 'avatar');
        }

        return response()->json([
            'message' => 'User updated successfully',
            'data'    => $user,
        ]);
    }

    /**
     * Reset user password (Admin only)
     */
    public function resetPassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
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

        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return response()->json(['message' => 'Admin terakhir tidak boleh dihapus'], 422);
        }

        try {
            $profilePhotoPath = $user->profile_photo_url;

            \DB::transaction(function () use ($user) {
                \App\Models\Validation::where('validated_by', $user->id)
                    ->update(['validated_by' => null]);
                \App\Models\BookAssignment::where('teacher_id', $user->id)->delete();
                \App\Models\QuizQuestion::where('created_by', $user->id)->delete();
                User::where('wali_kelas_id', $user->id)->update(['wali_kelas_id' => null]);

                $readingActivityIds = \App\Models\ReadingActivity::where('user_id', $user->id)->pluck('id');
                \App\Models\Validation::whereIn('reading_activity_id', $readingActivityIds)->delete();

                $quizAttemptIds = \App\Models\QuizAttempt::where('user_id', $user->id)->pluck('id');
                if ($quizAttemptIds->isNotEmpty()) {
                    \App\Models\PointTransaction::whereIn('quiz_attempt_id', $quizAttemptIds)->delete();
                }

                \App\Models\PointTransaction::where('user_id', $user->id)->delete();
                \App\Models\Redemption::where('user_id', $user->id)->delete();
                \App\Models\QuizAttempt::where('user_id', $user->id)->delete();
                \App\Models\ReadingActivity::where('user_id', $user->id)->delete();
                \App\Models\ReadingProgress::where('user_id', $user->id)->delete();
                $user->tokens()->delete();
                $user->forceDelete();
            });

            StorageHelper::delete($profilePhotoPath, 'avatar');

            return response()->json([
                'message' => 'User dan semua data terkait berhasil dihapus permanen.',
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Gagal menghapus user.',
            ], 500);
        }
    }

    /**
     * Create new user (Admin only)
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|string|min:8',
            'role'       => 'required|in:siswa,guru,admin',
            'grade_level'=> 'required_if:role,siswa|in:1,2,3',
            'class_name' => 'nullable|string|max:100',
        ]);

        $classTeacher = null;
        if ($validated['role'] === 'siswa' && !empty($validated['class_name'])) {
            $teachers = User::where('role', 'guru')
                ->where('grade_level', $validated['grade_level'])
                ->where('class_name', $validated['class_name'])
                ->limit(2)
                ->get();
            if ($teachers->count() > 1) {
                return response()->json(['message' => 'Kelas memiliki lebih dari satu wali kelas. Periksa data guru terlebih dahulu.'], 409);
            }
            $classTeacher = $teachers->first();
        }

        $user = User::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'password'    => Hash::make($validated['password']),
            'role'        => $validated['role'],
            'grade_level' => $validated['grade_level'] ?? null,
            'class_name'  => $validated['class_name'] ?? null,
            'wali_kelas_id' => $classTeacher?->id,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'data'    => $user,
        ], 201);
    }

    /**
     * Get statistics (Admin dashboard)
     */
    public function getStatistics()
    {
        $totalSiswa = User::where('role', 'siswa')->count();
        $totalGuru  = User::where('role', 'guru')->count();
        $totalAdmin = User::where('role', 'admin')->count();

        return response()->json([
            'statistics' => [
                'total_siswa'  => $totalSiswa,
                'total_guru'   => $totalGuru,
                'total_admin'  => $totalAdmin,
                'total_users'  => $totalSiswa + $totalGuru + $totalAdmin,
            ],
        ]);
    }

    public function assignClass(Request $request)
    {
        $validated = $request->validate([
            'grade_level'     => 'required|in:1,2,3',
            'class_name'      => 'required|string|max:100',
            'teacher_id'      => 'required|integer|exists:users,id',
            'previous_grade_level' => 'nullable|in:1,2,3',
            'previous_class_name'  => 'nullable|string|max:100',
        ]);

        $previousGrade = $validated['previous_grade_level'] ?? $validated['grade_level'];
        $previousClass = $validated['previous_class_name'] ?? $validated['class_name'];
        $isEditing = $request->filled('previous_grade_level') && $request->filled('previous_class_name');
        $teacher = User::whereKey($validated['teacher_id'])->where('role', 'guru')->first();

        if (!$teacher) {
            return response()->json(['message' => 'Wali kelas yang dipilih tidak valid.'], 422);
        }

        $result = \DB::transaction(function () use ($validated, $previousGrade, $previousClass, $isEditing, $teacher) {
            $sourceTeachers = User::where('role', 'guru')
                ->where('grade_level', $previousGrade)
                ->where('class_name', $previousClass)
                ->lockForUpdate()
                ->get();

            if ($sourceTeachers->count() > 1) {
                return response()->json(['message' => 'Kelas memiliki lebih dari satu wali kelas. Periksa data guru terlebih dahulu.'], 409);
            }

            $previousTeacher = $sourceTeachers->first();
            if ($isEditing && $previousTeacher && User::where('role', 'siswa')
                ->where('wali_kelas_id', $previousTeacher->id)
                ->where(function ($query) use ($previousGrade, $previousClass) {
                    $query->where('grade_level', '!=', $previousGrade)
                        ->orWhere('class_name', '!=', $previousClass)
                        ->orWhereNull('grade_level')
                        ->orWhereNull('class_name');
                })
                ->exists()) {
                return response()->json(['message' => 'Wali kelas memiliki siswa yang terdaftar di luar kelas ini. Periksa penugasan siswa terlebih dahulu.'], 409);
            }

            if (!$isEditing && $previousTeacher && $previousTeacher->id !== $teacher->id) {
                return response()->json(['message' => 'Kelas sudah memiliki wali kelas. Edit kelas tersebut untuk mengganti wali kelas.'], 409);
            }

            $teacherHasOtherClass = $teacher->grade_level && $teacher->class_name
                && ($teacher->grade_level !== $previousGrade || $teacher->class_name !== $previousClass)
                && ($teacher->grade_level !== $validated['grade_level'] || $teacher->class_name !== $validated['class_name']);

            if ($teacherHasOtherClass) {
                return response()->json(['message' => 'Guru yang dipilih sudah menjadi wali kelas di kelas lain.'], 409);
            }

            $conflictingTeacher = User::where('role', 'guru')
                ->where('grade_level', $validated['grade_level'])
                ->where('class_name', $validated['class_name'])
                ->where('id', '!=', $teacher->id)
                ->where('id', '!=', $previousTeacher?->id)
                ->exists();

            if ($conflictingTeacher) {
                return response()->json(['message' => 'Kelas tujuan sudah memiliki wali kelas lain.'], 409);
            }

            $students = User::where('role', 'siswa')
                ->where(function ($query) use ($previousGrade, $previousClass, $validated) {
                    $query->where(function ($source) use ($previousGrade, $previousClass) {
                        $source->where('grade_level', $previousGrade)->where('class_name', $previousClass);
                    });
                    if ($previousGrade !== $validated['grade_level'] || $previousClass !== $validated['class_name']) {
                        $query->orWhere(function ($target) use ($validated) {
                            $target->where('grade_level', $validated['grade_level'])->where('class_name', $validated['class_name']);
                        });
                    }
                })
                ->lockForUpdate()
                ->get();

            $allowedTeacherIds = array_filter([$previousTeacher?->id, $teacher->id]);
            if ($students->contains(fn (User $student) => $student->wali_kelas_id !== null
                && !in_array((int) $student->wali_kelas_id, $allowedTeacherIds, true))) {
                return response()->json(['message' => 'Sebagian siswa sudah ditautkan ke wali kelas lain. Kelas tidak diubah.'], 409);
            }

            if ($previousTeacher && $previousTeacher->id !== $teacher->id) {
                $previousTeacher->update(['grade_level' => null, 'class_name' => null]);
            }

            $teacher->update([
                'grade_level' => $validated['grade_level'],
                'class_name'  => $validated['class_name'],
            ]);

            User::whereIn('id', $students->pluck('id'))
                ->update([
                    'grade_level' => $validated['grade_level'],
                    'class_name' => $validated['class_name'],
                    'wali_kelas_id' => $teacher->id,
                ]);

            return response()->json([
                'message' => 'Kelas dan penugasan wali kelas berhasil disimpan.',
                'data' => [
                    'grade_level' => $validated['grade_level'],
                    'class_name' => $validated['class_name'],
                    'teacher_id' => $teacher->id,
                    'teacher_name' => $teacher->name,
                    'student_count' => $students->count(),
                ],
            ]);
        });

        return $result;
    }

    public function deleteClass(Request $request)
    {
        $validated = $request->validate([
            'grade_level' => 'required|in:1,2,3',
            'class_name' => 'required|string|max:100',
        ]);

        $hasAssignments = User::whereIn('role', ['guru', 'siswa'])
            ->where('grade_level', $validated['grade_level'])
            ->where('class_name', $validated['class_name'])
            ->exists();

        if ($hasAssignments) {
            return response()->json([
                'message' => 'Kelas belum bisa dihapus karena masih memiliki guru atau siswa. Pindahkan penugasan akun terlebih dahulu.',
            ], 409);
        }

        return response()->json(['message' => 'Kelas kosong berhasil dihapus.']);
    }

    /**
     * Guru set kelas mereka â€” otomatis assign wali_kelas_id
     * ke semua siswa yang grade_level + class_name cocok.
     */
    public function setGuruClass(Request $request)
    {
        $validated = $request->validate([
            'grade_level' => 'required|in:1,2,3',
            'class_name'  => 'required|string|max:100',
        ]);

        $guru = $request->user();
        $conflictingStudents = User::where('role', 'siswa')
            ->where('grade_level', $validated['grade_level'])
            ->where('class_name', $validated['class_name'])
            ->whereNotNull('wali_kelas_id')
            ->where('wali_kelas_id', '!=', $guru->id)
            ->count();

        if ($conflictingStudents > 0) {
            return response()->json([
                'message' => 'Kelas sudah memiliki wali kelas lain dan tidak dapat diambil alih otomatis.',
            ], 409);
        }

        $guru->update([
            'grade_level' => $validated['grade_level'],
            'class_name'  => $validated['class_name'],
        ]);

        $updated = User::where('role', 'siswa')
            ->where('grade_level', $validated['grade_level'])
            ->where('class_name', $validated['class_name'])
            ->where(function ($query) use ($guru) {
                $query->whereNull('wali_kelas_id')->orWhere('wali_kelas_id', $guru->id);
            })
            ->update(['wali_kelas_id' => $guru->id]);

        return response()->json([
            'message'       => "Kelas {$validated['grade_level']} {$validated['class_name']} berhasil diatur",
            'guru'          => $guru->fresh(),
            'siswa_updated' => $updated,
        ]);
    }
}
