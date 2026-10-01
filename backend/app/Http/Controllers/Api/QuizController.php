<?php

namespace App\Http\Controllers\Api;

use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\PointTransaction;
use App\Models\Validation;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Services\QuizQuestionGenerator;

class QuizController extends Controller
{
    // Get quiz untuk validasi membaca — correct_answer TIDAK dikirim ke client
    public function getQuizForBook(Request $request, $ebookId)
    {
        $questions = QuizQuestion::where('ebook_id', $ebookId)
            ->select('id', 'question', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'source_pages')
            ->orderBy('id')
            ->get();

        // Map 'question' to 'question_text' for frontend compatibility
        // correct_answer sengaja tidak disertakan agar jawaban tidak terekspos ke client
        $formattedQuestions = $questions->map(function ($q) {
            return [
                'id'          => $q->id,
                'question_text' => $q->question,
                'question_type' => $q->question_type,
                'option_a'    => $q->option_a,
                'option_b'    => $q->option_b,
                'option_c'    => $q->option_c,
                'option_d'    => $q->option_d,
                'source_pages' => $q->source_pages,
            ];
        });

        return response()->json([
            'data'            => $formattedQuestions,
            'total_questions' => count($formattedQuestions),
        ]);
    }

    // Submit jawaban kuis
    public function submitQuiz(Request $request)
    {
        $validated = $request->validate([
            'ebook_id' => 'required|exists:ebooks,id',
            'answers' => 'required|array',
            'answers.*' => 'required|string|max:5000',
        ]);

        $ebook = \App\Models\Ebook::findOrFail($validated['ebook_id']);
        $user = $request->user();

        // Cek apakah siswa sudah pernah mendapat poin dari kuis ini.
        // Gunakan EXISTS pada PointTransaction langsung (bukan &&) agar tidak ada
        // celah jika attempt ada tapi transaksi poin belum tercatat, atau sebaliknya.
        $alreadyAwardedPoints = PointTransaction::where('user_id', $user->id)
            ->where('type', 'quiz_completed')
            ->where('description', 'like', "%{$ebook->title}%")
            ->exists();
        
        // Get all questions for this ebook
        $questions = QuizQuestion::where('ebook_id', $ebook->id)->orderBy('id')->get();
        
        $correctAnswers = 0;
        $totalQuestions = count($questions);
        $essayCount = 0;
        $storedAnswers = [];
        
        // Hitung jawaban yang benar — answers array uses question ID as key
        foreach ($questions as $question) {
            $submittedAnswer = $validated['answers'][$question->id] ?? null;
            if (!is_string($submittedAnswer) || trim($submittedAnswer) === '') {
                throw ValidationException::withMessages([
                    "answers.{$question->id}" => 'Jawab semua soal sebelum mengirim.',
                ]);
            }

            $storedAnswers[$question->id] = trim($submittedAnswer);
            if ($question->question_type === 'essay') {
                $essayCount++;
            } else {
                $choice = strtolower(trim($submittedAnswer));
                if (!in_array($choice, ['a', 'b', 'c', 'd'], true)) {
                    throw ValidationException::withMessages([
                        "answers.{$question->id}" => 'Pilih salah satu opsi jawaban.',
                    ]);
                }
                if ($choice === $question->correct_answer) {
                    $correctAnswers++;
                }
            }
        }

        $score = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
        $pendingReview = $essayCount > 0;
        $passed = !$pendingReview && $score >= 70;

        // Record quiz attempt
        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'ebook_id' => $ebook->id,
            'reading_activity_id' => null,
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
            'score' => $score,
            'passed' => $passed,
            'answers' => $storedAnswers,
            'pending_review' => $pendingReview,
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
            'pending_review' => $pendingReview,
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

    // Guru: Generate quiz drafts from the selected ebook.
    public function generateAiDraft(Request $request, QuizQuestionGenerator $generator)
    {
        $validated = $request->validate([
            'ebook_id' => 'required|exists:ebooks,id',
            'prompt' => 'required|string|min:10|max:5000',
            'multiple_choice_count' => 'required|integer|min:0|max:10',
            'essay_count' => 'required|integer|min:0|max:10',
        ]);

        if ($validated['multiple_choice_count'] + $validated['essay_count'] < 1 || $validated['multiple_choice_count'] + $validated['essay_count'] > 12) {
            throw ValidationException::withMessages([
                'questions' => 'Jumlah soal harus antara 1 dan 12.',
            ]);
        }

        $ebook = \App\Models\Ebook::where('is_active', true)->findOrFail($validated['ebook_id']);

        try {
            return response()->json(['data' => $generator->generate(
                $ebook,
                $validated['prompt'],
                $validated['multiple_choice_count'],
                $validated['essay_count'],
            )]);
        } catch (\Throwable $exception) {
            report($exception);
            return response()->json([
                'message' => $exception instanceof \RuntimeException
                    ? $exception->getMessage()
                    : 'Gagal membaca buku atau membuat draf soal. Periksa PDF dan konfigurasi AI.',
            ], 422);
        }
    }

    // Guru: Create quiz questions after reviewing the draft.
    public function createQuiz(Request $request)
    {
        $questions = array_map(static function ($question): array {
            if (!is_array($question)) {
                return [];
            }
            $question['question'] = $question['question_text'] ?? $question['question'] ?? '';
            $question['question_type'] = $question['question_type'] ?? 'multiple_choice';
            $question['correct_answer'] = $question['correct_answer'] ?? 'a';
            foreach (['a', 'b', 'c', 'd'] as $option) {
                $question['option_' . $option] = $question['option_' . $option] ?? '';
            }
            return $question;
        }, $request->input('questions', []));
        $request->merge(['questions' => $questions]);

        $validated = $request->validate([
            'ebook_id' => 'required|exists:ebooks,id',
            'questions' => 'required|array|min:1|max:12',
            'questions.*.question' => 'required|string|max:5000',
            'questions.*.question_type' => 'required|in:multiple_choice,essay',
            'questions.*.option_a' => 'nullable|string|max:1000',
            'questions.*.option_b' => 'nullable|string|max:1000',
            'questions.*.option_c' => 'nullable|string|max:1000',
            'questions.*.option_d' => 'nullable|string|max:1000',
            'questions.*.correct_answer' => 'nullable|in:a,b,c,d',
            'questions.*.model_answer' => 'nullable|string|max:5000',
            'questions.*.explanation' => 'nullable|string|max:5000',
            'questions.*.source_pages' => 'nullable|array',
            'questions.*.source_pages.*' => 'integer|min:1',
        ]);

        foreach ($validated['questions'] as $index => $question) {
            if ($question['question_type'] === 'multiple_choice') {
                foreach (['option_a', 'option_b', 'option_c', 'option_d'] as $field) {
                    if (trim((string) ($question[$field] ?? '')) === '') {
                        throw ValidationException::withMessages([
                            "questions.$index.$field" => 'Semua opsi pilihan ganda wajib diisi.',
                        ]);
                    }
                }
                if (!in_array($question['correct_answer'] ?? null, ['a', 'b', 'c', 'd'], true)) {
                    throw ValidationException::withMessages([
                        "questions.$index.correct_answer" => 'Pilih jawaban yang benar.',
                    ]);
                }
            } elseif (trim((string) ($question['model_answer'] ?? '')) === '') {
                throw ValidationException::withMessages([
                    "questions.$index.model_answer" => 'Kunci jawaban esai wajib diisi untuk panduan guru.',
                ]);
            }
        }

        $guru = $request->user();
        $ebookId = $validated['ebook_id'];

        if (QuizAttempt::where('ebook_id', $ebookId)->where('pending_review', true)->exists()) {
            return response()->json([
                'message' => 'Selesaikan penilaian esai yang tertunda sebelum mengganti soal kuis ini.',
            ], 409);
        }

        $createdQuestions = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $ebookId, $guru) {
            QuizQuestion::where('ebook_id', $ebookId)
                ->where('created_by', $guru->id)
                ->delete();

            return collect($validated['questions'])->map(function (array $q) use ($ebookId, $guru) {
                return QuizQuestion::create([
                    'ebook_id' => $ebookId,
                    'question' => $q['question'],
                    'option_a' => $q['option_a'] ?? '',
                    'option_b' => $q['option_b'] ?? '',
                    'option_c' => $q['option_c'] ?? '',
                    'option_d' => $q['option_d'] ?? '',
                    'correct_answer' => strtolower($q['correct_answer'] ?? 'a'),
                    'question_type' => $q['question_type'],
                    'model_answer' => $q['model_answer'] ?? null,
                    'explanation' => $q['explanation'] ?? null,
                    'source_pages' => $q['source_pages'] ?? null,
                    'created_by' => $guru->id,
                ]);
            })->all();
        });

        return response()->json([
            'message' => 'Quiz created successfully',
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

        if (QuizAttempt::where('ebook_id', $question->ebook_id)->where('pending_review', true)->exists()) {
            return response()->json(['message' => 'Selesaikan penilaian esai yang tertunda sebelum mengubah soal kuis ini.'], 409);
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

        if (QuizAttempt::where('ebook_id', $question->ebook_id)->where('pending_review', true)->exists()) {
            return response()->json(['message' => 'Selesaikan penilaian esai yang tertunda sebelum menghapus soal kuis ini.'], 409);
        }

        $question->delete();

        return response()->json([
            'message' => 'Quiz question deleted',
        ]);
    }

    // Guru: View essay answers that need manual grading.
    public function getEssayReviews(Request $request)
    {
        $ebookIds = QuizQuestion::where('created_by', $request->user()->id)
            ->where('question_type', 'essay')
            ->select('ebook_id');

        $attempts = QuizAttempt::where('pending_review', true)
            ->whereIn('ebook_id', $ebookIds)
            ->with(['ebook', 'user'])
            ->orderBy('created_at')
            ->get()
            ->map(function (QuizAttempt $attempt) use ($request) {
                $questions = QuizQuestion::where('ebook_id', $attempt->ebook_id)
                    ->where('created_by', $request->user()->id)
                    ->where('question_type', 'essay')
                    ->get();

                return [
                    'attempt_id' => $attempt->id,
                    'ebook_title' => $attempt->ebook?->title,
                    'student_name' => $attempt->user?->name,
                    'submitted_at' => $attempt->created_at,
                    'questions' => $questions->map(fn (QuizQuestion $question) => [
                        'question_id' => $question->id,
                        'question_text' => $question->question,
                        'student_answer' => $attempt->answers[$question->id] ?? '',
                        'model_answer' => $question->model_answer,
                        'explanation' => $question->explanation,
                        'source_pages' => $question->source_pages,
                    ])->values(),
                ];
            });

        return response()->json(['data' => $attempts]);
    }

    // Guru: Grade every essay in one attempt.
    public function gradeEssayAttempt(Request $request, $attemptId)
    {
        $validated = $request->validate([
            'grades' => 'required|array|min:1',
            'grades.*.question_id' => 'required|integer|exists:quiz_questions,id',
            'grades.*.score' => 'required|numeric|min:0|max:100',
            'grades.*.feedback' => 'nullable|string|max:2000',
        ]);

        $attempt = QuizAttempt::findOrFail($attemptId);
        $guruId = $request->user()->id;

        $essayQuestions = QuizQuestion::where('ebook_id', $attempt->ebook_id)
            ->where('created_by', $guruId)
            ->where('question_type', 'essay')
            ->get();

        if (!$attempt->pending_review || $essayQuestions->isEmpty()) {
            return response()->json(['message' => 'Tidak ada jawaban esai yang menunggu penilaian.'], 422);
        }

        $submittedGrades = collect($validated['grades'])->keyBy('question_id');
        if ($essayQuestions->contains(fn (QuizQuestion $question) => !$submittedGrades->has($question->id))) {
            throw ValidationException::withMessages([
                'grades' => 'Berikan nilai untuk setiap jawaban esai sebelum menyimpan.',
            ]);
        }

        $essayScoreTotal = 0;
        $essayGrades = [];
        foreach ($essayQuestions as $question) {
            $grade = $submittedGrades->get($question->id);
            $essayScoreTotal += (float) $grade['score'];
            $essayGrades[$question->id] = [
                'score' => (float) $grade['score'],
                'feedback' => $grade['feedback'] ?? null,
                'graded_by' => $guruId,
                'graded_at' => now()->toISOString(),
            ];
        }

        $totalQuestions = QuizQuestion::where('ebook_id', $attempt->ebook_id)->count();
        $totalPoints = ($attempt->correct_answers * 100) + $essayScoreTotal;
        $score = $totalQuestions > 0 ? $totalPoints / $totalQuestions : 0;

        $attempt->update([
            'essay_grades' => $essayGrades,
            'pending_review' => false,
            'score' => round($score, 2),
            'passed' => $score >= 70,
        ]);

        return response()->json([
            'message' => 'Penilaian esai berhasil disimpan.',
            'data' => $attempt->fresh(),
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
                $multipleChoiceCount = QuizQuestion::where('ebook_id', $ebook->id)
                    ->where('question_type', 'multiple_choice')
                    ->count();

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
                    'total_questions' => $totalQuestions,
                    'points_reward' => $multipleChoiceCount * 10,
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
