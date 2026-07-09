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
        Schema::table('redemptions', function (Blueprint $table) {
            $table->foreign('reward_id')
                ->references('id')
                ->on('rewards')
                ->onDelete('cascade');
            
            if (Schema::hasColumn('redemptions', 'verified_by')) {
                $table->foreign('verified_by')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('redemptions', function (Blueprint $table) {
            $table->dropForeign(['reward_id']);
            if (Schema::hasColumn('redemptions', 'verified_by')) {
                $table->dropForeign(['verified_by']);
            }
        });
    }
};
