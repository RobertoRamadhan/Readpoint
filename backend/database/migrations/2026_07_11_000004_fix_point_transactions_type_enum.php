<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

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
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE point_transactions MODIFY COLUMN type ENUM(
            'reading_validation',
            'reward_redemption',
            'bonus',
            'manual_adjustment'
        ) NOT NULL DEFAULT 'reading_validation'");
    }
};
