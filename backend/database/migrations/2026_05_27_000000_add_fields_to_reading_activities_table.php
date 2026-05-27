<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reading_activities', function (Blueprint $table) {
            // Add new columns for anti-cheat tracking
            if (!Schema::hasColumn('reading_activities', 'scroll_speed')) {
                $table->decimal('scroll_speed', 8, 2)->nullable()->comment('Pixels per second');
            }
            
            if (!Schema::hasColumn('reading_activities', 'reading_time_seconds')) {
                $table->integer('reading_time_seconds')->default(0)->comment('Total reading time in seconds');
            }
            
            if (!Schema::hasColumn('reading_activities', 'reading_progress')) {
                $table->integer('reading_progress')->default(0)->comment('Reading progress 0-100%');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reading_activities', function (Blueprint $table) {
            $table->dropColumn(['scroll_speed', 'reading_time_seconds', 'reading_progress']);
        });
    }
};
