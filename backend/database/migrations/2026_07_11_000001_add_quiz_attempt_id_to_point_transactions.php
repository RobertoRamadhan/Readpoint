<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add quiz_attempt_id to point_transactions untuk link poin ke attempt kuis tertentu
        Schema::table('point_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('point_transactions', 'quiz_attempt_id')) {
                $table->unsignedBigInteger('quiz_attempt_id')->nullable()->after('redemption_id');
                $table->foreign('quiz_attempt_id')->references('id')->on('quiz_attempts')->onDelete('set null');
            }
        });

        // Fix reading_progress column name mismatch:
        // Migration buat 'progress_percentage', model lama pakai 'percentage_completed'
        // Model sudah diperbaiki → tidak perlu rename kolom, hanya pastikan konsisten
    }

    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->dropForeign(['quiz_attempt_id']);
            $table->dropColumn('quiz_attempt_id');
        });
    }
};
