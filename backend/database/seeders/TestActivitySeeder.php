<?php

namespace Database\Seeders;

use App\Models\ReadingActivity;
use App\Models\QuizAttempt;
use App\Models\Ebook;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestActivitySeeder extends Seeder
{
    /**
     * Seed the database with test activity data for today
     */
    public function run(): void
    {
        // Get test users
        $siswa = User::where('role', 'siswa')->first();
        $ebook = Ebook::first();

        if (!$siswa || !$ebook) {
            echo "Siswa atau Ebook tidak ditemukan. Lewati seeding.\n";
            return;
        }

        // Create reading activities for today
        for ($i = 0; $i < 3; $i++) {
            ReadingActivity::create([
                'user_id' => $siswa->id + ($i % 2),
                'ebook_id' => $ebook->id + ($i % 2),
                'status' => 'ongoing',
                'started_at' => now(),
                'current_page' => 50 + ($i * 10),
                'final_page' => 100 + ($i * 10),
                'duration_minutes' => 30 + ($i * 5),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create quiz attempts for today
        for ($i = 0; $i < 2; $i++) {
            DB::table('quiz_attempts')->insert([
                'user_id' => $siswa->id + ($i % 2),
                'ebook_id' => $ebook->id + ($i % 2),
                'total_questions' => 10,
                'correct_answers' => 8 + $i,
                'score' => 75 + ($i * 5),
                'passed' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create redemptions for today
        // Skipped due to complex constraints - use direct redemption instead

        // Create point transactions for today
        DB::table('point_transactions')->insert([
            'user_id' => $siswa->id,
            'points' => 100,
            'type' => 'bonus',
            'description' => 'Bonus membaca buku',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        echo "Test activity data seeded successfully for today!\n";
    }
}
