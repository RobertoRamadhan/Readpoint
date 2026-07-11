<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Wali kelas: guru yang bertanggung jawab atas kelas ini
            // Diisi otomatis saat guru mengatur kelas mereka
            if (!Schema::hasColumn('users', 'wali_kelas_id')) {
                $table->unsignedBigInteger('wali_kelas_id')->nullable()->after('class_name');
                $table->foreign('wali_kelas_id')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['wali_kelas_id']);
            $table->dropColumn('wali_kelas_id');
        });
    }
};
