<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table.
     */
    public function run(): void
    {
        // Use transaction to handle cascading deletes
        DB::transaction(function () {
            // Only proceed if there's an idempotency issue or explicit fresh seeding
            if (User::count() > 0) {
                echo "Users table already seeded. To re-seed, run: php artisan migrate:refresh --seed\n";
                return;
            }

            // Create admin user
            User::create([
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);

            // Create teacher users
            User::create([
                'name' => 'Guru Budi',
                'email' => 'gurui@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'email_verified_at' => now(),
            ]);

            // Create student users
            User::create([
                'name' => 'Rina Kusuma',
                'email' => 'rina@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'email_verified_at' => now(),
            ]);

            echo "Users seeded successfully!\n";
            echo "  Admin: admin@gmail.com / password\n";
            echo "  Teacher: gurui@gmail.com / password\n";
            echo "  Student: rina@gmail.com / password\n";
        });
    }
}
