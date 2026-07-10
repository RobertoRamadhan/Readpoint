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
        // Add indexes to improve query performance
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('email');
            $table->index('created_at');
        });

        Schema::table('ebooks', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('grade_level');
            $table->index('created_at');
        });

        Schema::table('rewards', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('created_at');
        });

        Schema::table('reading_activities', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('ebook_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::table('point_transactions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::table('redemptions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['email']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('ebooks', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['grade_level']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('rewards', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('reading_activities', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['ebook_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('point_transactions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('redemptions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });
    }
};
