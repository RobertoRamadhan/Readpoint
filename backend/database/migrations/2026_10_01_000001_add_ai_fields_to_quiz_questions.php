<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->string('question_type')->default('multiple_choice');
            $table->text('model_answer')->nullable();
            $table->text('explanation')->nullable();
            $table->json('source_pages')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropColumn(['question_type', 'model_answer', 'explanation', 'source_pages']);
        });
    }
};
