<?php

namespace App\Http\Controllers\Api;

use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\PointTransaction;
use App\Models\Validation;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class QuizController extends Controller
{
    // Get quiz untuk validasi membaca
    public function getQuizForBook(Request $request, $ebookId)
    {
        $questions = QuizQuestion::where('ebook_id', $ebookId)
            ->select('id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')
            ->limit(5)
            ->get();

        // Map 'question' to 'question_text' for frontend compatibility
        $formattedQuestions = $questions->map(function($q) {
            return [
                'id' => $q->id,
                'question_text' => $q->question,
                'option_a' => $q->option_a,
                'option_b' => $q->option_b,
                'option_c' => $q->option_c,
                'option_d' => $q->option_d,
                'correct_answer' => $q->correct_answer,
            ];
        });

        return response()->json([
            'data' => $formattedQuestions,
            'total_questions' => count($formattedQuestions),
        ]);
    }

    // Submit jawaban kuis
    public function submitQuiz(Request $request)
    {
        $validated = $request->validate([
            'ebook_id' => 'required|exists:ebooks,id',
            'answers' => 'required|array',
            'answers.*' => 'required|in:a,b,c,d',
            'score' => 'nullable|numeric|min:0|max:100',
        ]);

        $ebook = \App\Models\Ebook::findOrFail($validated['ebook_id']);
        $user = $request->user();

        // Cek apakah siswa sudah pernah mendapat poin dari kuis ini
        // Cukup cek apakah ada attempt sebelumnya yang sudah dapat poin
        $alreadyAwardedPoints = QuizAttempt::where('user_id', $user->id)
            ->where('ebook_id', $ebook->id)
            ->exists()
            && PointTransaction::where('user_id', $user->id)
                ->where('type', 'quiz_completed')
                ->where('description', 'like', "%{$ebook->title}%")
                ->exists();
        
        // Get all questions for this ebook
        $questions = QuizQuestion::where('ebook_id', $ebook->id)->orderBy('id')->limit(5)->get();
        
        $correctAnswers = 0;
        $totalQuestions = count($questions);
        
        // Hitung jawaban yang benar — answers array uses question ID as key
        foreach ($questions as $question) {
            $submittedAnswer = $validated['answers'][$question->id] ?? null;
            // Ambil karakter pertama saja untuk validasi (a/b/c/d)
            if ($submittedAnswer && strtolower(substr($submittedAnswer, 0, 1)) === $question->correct_answer) {
                $correctAnswers++;
            }
        }

        $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
        $passed = $score >= 70; // 70% adalah passing grade

        // Record quiz attempt
        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'ebook_id' => $ebook->id,
            'reading_activity_id' => null,
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
            'score' => $score,
            'passed' => $passed,
        ]);

        // Hanya berikan poin pada attempt pertama (mencegah farming poin)
        $pointsEarned = 0;
        if (!$alreadyAwardedPoints) {
            $pointsEarned = $correctAnswers * 10; // 10 poin per jawaban benar

            PointTransaction::create([
                'user_id' => $user->id,
                'reading_activity_id' => null,
                'points' => $pointsEarned,
                'type' => 'quiz_completed',
                'description' => "Poin dari kuis '{$ebook->title}' ({$correctAnswers}/{$totalQuestions} benar)",
            ]);
        }

        return response()->json([
            'message' => $alreadyAwardedPoints
                ? 'Kuis dikerjakan ulang — poin tidak diberikan lagi'
                : 'Quiz submitted successfully',
            'quiz_attempt' => $attempt,
            'points_earned' => $pointsEarned,
            'score' => round($score, 2),
            'passed' => $passed,
            'first_attempt' => !$alreadyAwardedPoints,
        ], 200);
    }

    // Get quiz attempts siswa
    public function getMyAttempts(Request $request)
    {
        $attempts = QuizAttempt::where('user_id', $request->user()->id)
            ->with('ebook', 'readingActivity')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $attempts,
        ]);
    }

    // Guru: Create quiz questions
    public function createQuiz(Request $request)
    {
        $validated = $request->validate([
            'ebook_id' => 'required|exists:ebooks,id',
            'questions' => 'required|array|size:5', // Exactly 5 questions
            'questions.*.question' => 'required|string',
            'questions.*.option_a' => 'required|string',
            'questions.*.option_b' => 'required|string',
            'questions.*.option_c' => 'required|string',
            'questions.*.option_d' => 'required|string',
            'questions.*.correct_answer' => 'required|in:a,b,c,d',
        ]);

        $guru = $request->user();
        $ebookId = $validated['ebook_id'];

        // Delete existing quiz for this ebook if any
        QuizQuestion::where('ebook_id', $ebookId)
            ->where('created_by', $guru->id)
            ->delete();

        $createdQuestions = [];

        foreach ($validated['questions'] as $q) {
            $question = QuizQuestion::create([
                'ebook_id' => $ebookId,
                'question' => $q['question'],
                'option_a' => $q['option_a'],
                'option_b' => $q['option_b'],
                'option_c' => $q['option_c'],
                'option_d' => $q['option_d'],
                'correct_answer' => strtolower($q['correct_answer']),
                'created_by' => $guru->id,
            ]);
            $createdQuestions[] = $question;
        }

        return response()->json([
            'message' => 'Quiz created with 5 questions',
            'data' => $createdQuestions,
        ], 201);
    }

    // Guru: Update single quiz question
    public function updateQuiz(Request $request, $questionId)
    {
        $validated = $request->validate([
            'question' => 'sometimes|string',
            'option_a' => 'sometimes|string',
            'option_b' => 'sometimes|string',
            'option_c' => 'sometimes|string',
            'option_d' => 'sometimes|string',
            'correct_answer' => 'sometimes|in:a,b,c,d',
        ]);

        $question = QuizQuestion::findOrFail($questionId);

        // Ensure guru owns this question
        if ($question->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->update([
            'question' => $validated['question'] ?? $question->question,
            'option_a' => $validated['option_a'] ?? $question->option_a,
            'option_b' => $validated['option_b'] ?? $question->option_b,
            'option_c' => $validated['option_c'] ?? $question->option_c,
            'option_d' => $validated['option_d'] ?? $question->option_d,
            'correct_answer' => isset($validated['correct_answer']) ? strtolower($validated['correct_answer']) : $question->correct_answer,
        ]);

        return response()->json([
            'message' => 'Quiz question updated',
            'data' => $question,
        ]);
    }

    // Guru: Delete quiz question
    public function deleteQuiz(Request $request, $questionId)
    {
        $question = QuizQuestion::findOrFail($questionId);

        // Ensure guru owns this question
        if ($question->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();

        return response()->json([
            'message' => 'Quiz question deleted',
        ]);
    }

    // Get all ebooks that have quiz questions (for siswa quiz tab)
    public function getEbooksWithQuiz(Request $request)
    {
        $user = $request->user();

        // Get distinct ebook IDs that have at least one quiz question
        $ebookIds = QuizQuestion::distinct()->pluck('ebook_id');

        $ebooks = \App\Models\Ebook::whereIn('id', $ebookIds)
            ->where('is_active', true)
            ->select('id', 'title', 'author', 'cover_image', 'pages', 'poin_per_halaman', 'category')
            ->get()
            ->map(function ($ebook) use ($user) {
                $totalQuestions = QuizQuestion::where('ebook_id', $ebook->id)->count();

                // Check if this user has already attempted
                $attempt = QuizAttempt::where('user_id', $user->id)
                    ->where('ebook_id', $ebook->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                return [
                    'id' => $ebook->id,
                    'ebook_id' => $ebook->id,
                    'ebook_title' => $ebook->title,
                    'title' => $ebook->title,
                    'author' => $ebook->author,
                    'cover_image' => $ebook->cover_image,
                    'total_questions' => min($totalQuestions, 5),
                    'points_reward' => min($totalQuestions, 5) * 10,
                    'already_attempted' => $attempt !== null,
                    'last_score' => $attempt ? $attempt->score : null,
                    'passed' => $attempt ? $attempt->passed : false,
                ];
            });

        return response()->json([
            'data' => $ebooks,
        ]);
    }
}
