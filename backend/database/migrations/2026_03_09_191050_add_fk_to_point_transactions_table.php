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
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->foreign('reading_activity_id')
                ->references('id')
                ->on('reading_activities')
                ->onDelete('set null');
            
            $table->foreign('redemption_id')
                ->references('id')
                ->on('redemptions')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->dropForeign(['reading_activity_id']);
            $table->dropForeign(['redemption_id']);
        });
    }
};
