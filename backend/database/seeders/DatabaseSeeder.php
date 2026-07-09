<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed users first
        $this->call([
            UserSeeder::class,
        ]);

        // Seed other data
        $this->call([
            BookSeeder::class,
            EbookSeeder::class,
            QuizSeeder::class,
            RewardSeeder::class,
        ]);
    }
}
