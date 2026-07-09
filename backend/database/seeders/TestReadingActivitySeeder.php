<?php

namespace Database\Seeders;

use App\Models\ReadingActivity;
use App\Models\Ebook;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestReadingActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get student users
        $students = User::where('role', 'siswa')->get();
        
        if ($students->isEmpty()) {
            $this->command->warn('No student users found. Skipping seeding.');
            return;
        }
        
        // Get ebooks
        $ebooks = Ebook::take(3)->get();
        
        if ($ebooks->isEmpty()) {
            $this->command->warn('No ebooks found. Create some ebooks first.');
            return;
        }
        
        // Create reading activities with pending_validation status
        foreach ($students as $student) {
            foreach ($ebooks as $ebook) {
                ReadingActivity::create([
                    'user_id' => $student->id,
                    'ebook_id' => $ebook->id,
                    'started_at' => now()->subDays(rand(1, 5)),
                    'completed_at' => now(),
                    'current_page' => 50,
                    'final_page' => 100,
                    'duration_minutes' => rand(30, 120),
                    'notes' => 'Saya sudah selesai membaca bab ini dengan baik dan mencatat poin-poin pentingnya.',
                    'status' => 'pending_validation',
                    'points_earned' => null,
                ]);
            }
        }
        
        $this->command->info('Test reading activities created successfully!');
    }
}
