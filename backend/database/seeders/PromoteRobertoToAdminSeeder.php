<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class PromoteRobertoToAdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::withTrashed()
                ->where('email', 'robertonovember.r@gmail.com')
                ->first();

            if ($user?->trashed()) {
                throw new RuntimeException('The target account is soft-deleted; restore it intentionally before promotion.');
            }

            if (!$user) {
                $name = env('READPOINT_ADMIN_NAME');
                $password = env('READPOINT_ADMIN_PASSWORD');

                if (!is_string($name) || trim($name) === '') {
                    throw new RuntimeException('Set READPOINT_ADMIN_NAME in the production environment before creating the admin account.');
                }

                if (!is_string($password) || strlen($password) < 12) {
                    throw new RuntimeException('Set READPOINT_ADMIN_PASSWORD to a password of at least 12 characters in the production environment.');
                }

                $user = User::create([
                    'name' => trim($name),
                    'email' => 'robertonovember.r@gmail.com',
                    'password' => Hash::make($password),
                    'role' => 'admin',
                ]);
            } else {
                $user->role = 'admin';
                $user->save();
            }

            $this->command?->info("Admin account ready: {$user->email} (role: {$user->role})");
        });
    }
}
