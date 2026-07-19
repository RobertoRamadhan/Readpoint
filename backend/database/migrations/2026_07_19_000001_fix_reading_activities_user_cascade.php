<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ganti FK reading_activities.user_id dari RESTRICT ke CASCADE.
     * Dengan ini, hapus user akan otomatis hapus reading_activities-nya.
     */
    public function up(): void
    {
        Schema::table('reading_activities', function (Blueprint $table) {
            // Drop foreign key lama
            $table->dropForeign(['user_id']);

            // Tambah ulang dengan ON DELETE CASCADE
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('reading_activities', function (Blueprint $table) {
            $table->dropForeign(['user_id']);

            // Kembalikan ke RESTRICT (default constrained)
            $table->foreign('user_id')
                ->references('id')
                ->on('users');
        });
    }
};
