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
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->unsignedBigInteger('reading_activity_id')->nullable();
            $table->unsignedBigInteger('redemption_id')->nullable();
            $table->integer('points');
            $table->enum('type', ['reading_validation', 'reward_redemption', 'bonus', 'manual_adjustment'])->default('reading_validation');
            $table->text('description')->nullable();
            $table ->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};
