<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'              => 'Admin',
                'email'             => 'admin@gmail.com',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Guru Budi',
                'email'             => 'guru@gmail.com',
                'password'          => Hash::make('password'),
                'role'              => 'guru',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Rina Kusuma',
                'email'             => 'siswa@gmail.com',
                'password'          => Hash::make('password'),
                'role'              => 'siswa',
                'grade_level'       => '1',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        echo "Users seeded!\n";
        echo "  Admin : admin@gmail.com / password\n";
        echo "  Guru  : guru@gmail.com  / password\n";
        echo "  Siswa : siswa@gmail.com / password\n";
    }
}
