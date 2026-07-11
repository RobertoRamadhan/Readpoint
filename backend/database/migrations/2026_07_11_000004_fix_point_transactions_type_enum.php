<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL: ALTER TABLE untuk expand enum — tambah 'quiz_completed'
        DB::statement("ALTER TABLE point_transactions MODIFY COLUMN type ENUM(
            'reading_validation',
            'reward_redemption',
            'bonus',
            'manual_adjustment',
            'quiz_completed'
        ) NOT NULL DEFAULT 'reading_validation'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE point_transactions MODIFY COLUMN type ENUM(
            'reading_validation',
            'reward_redemption',
            'bonus',
            'manual_adjustment'
        ) NOT NULL DEFAULT 'reading_validation'");
    }
};
