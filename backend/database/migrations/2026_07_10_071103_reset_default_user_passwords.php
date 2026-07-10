<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            ['email' => 'admin@gmail.com', 'role' => 'admin',  'name' => 'Admin',       'grade_level' => null],
            ['email' => 'guru@gmail.com',  'role' => 'guru',   'name' => 'Guru Budi',   'grade_level' => null],
            ['email' => 'siswa@gmail.com', 'role' => 'siswa',  'name' => 'Rina Kusuma', 'grade_level' => '1'],
        ];

        $hashedPassword = Hash::make('password');

        foreach ($defaults as $u) {
            $exists = DB::table('users')->where('email', $u['email'])->exists();

            if ($exists) {
                DB::table('users')->where('email', $u['email'])->update([
                    'password'   => $hashedPassword,
                    'role'       => $u['role'],
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('users')->insert([
                    'name'              => $u['name'],
                    'email'             => $u['email'],
                    'password'          => $hashedPassword,
                    'role'              => $u['role'],
                    'grade_level'       => $u['grade_level'],
                    'email_verified_at' => now(),
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);
            }
        }
    }

    public function down(): void {}
};
