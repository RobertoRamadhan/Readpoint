<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $users = [
            [
                'name'              => 'Admin',
                'email'             => 'admin@gmail.com',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Guru Budi',
                'email'             => 'guru@gmail.com',
                'password'          => Hash::make('password'),
                'role'              => 'guru',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Rina Kusuma',
                'email'             => 'siswa@gmail.com',
                'password'          => Hash::make('password'),
                'role'              => 'siswa',
                'grade_level'       => '1',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                $user
            );
        }
    }

    public function down(): void
    {
        DB::table('users')->whereIn('email', [
            'admin@gmail.com',
            'guru@gmail.com',
            'siswa@gmail.com',
        ])->delete();
    }
};
