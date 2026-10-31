<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class WordQuizQuestionParser
{
    /**
     * Parse numbered questions with A-D options and "Kunci: A", or essay
     * questions with "Jawaban: ...". Blank lines are ignored.
     */
    public function parse(string $text): array
    {
        $lines = preg_split('/\R/u', str_replace("\0", '', $text)) ?: [];
        $questions = [];
        $current = null;

        $flush = static function () use (&$current, &$questions): void {
            if ($current === null) {
                return;
            }

            $current['question_text'] = trim($current['question_text']);
            if ($current['question_text'] !== '') {
                $questions[] = $current;
            }
            $current = null;
        };

        foreach ($lines as $lineNumber => $rawLine) {
            $line = trim($rawLine);
            if ($line === '') {
                continue;
            }

            if (preg_match('/^\s*(?:soal\s*)?\d+\s*[.):]\s*(.+)$/iu', $line, $match)) {
                $flush();
                $current = $this->newQuestion(trim($match[1]));
                continue;
            }

            if ($current === null) {
                continue;
            }

            if (preg_match('/^([A-D])\s*[.)]\s*(.+)$/iu', $line, $match)) {
                $option = strtolower($match[1]);
                if (isset($current['option_' . $option])) {
                    $this->invalidLine($lineNumber + 1, 'Opsi ' . strtoupper($option) . ' ditulis lebih dari sekali.');
                }
                $current['option_' . $option] = trim($match[2]);
                continue;
            }

            if (preg_match('/^(?:kunci(?:\s+jawaban)?|answer)\s*[:=-]\s*([A-D])\b/iu', $line, $match)) {
                $current['correct_answer'] = strtolower($match[1]);
                continue;
            }

            if (preg_match('/^(?:jenis|tipe)\s*[:=-]\s*(esai|essay)\b/iu', $line)) {
                $current['question_type'] = 'essay';
                continue;
            }

            if (preg_match('/^(?:jawaban(?:\s+esai)?|model\s+answer)\s*[:=-]\s*(.*)$/iu', $line, $match)) {
                $current['model_answer'] = trim($match[1]);
                continue;
            }

            if (preg_match('/^(?:pembahasan|penjelasan|explanation)\s*[:=-]\s*(.*)$/iu', $line, $match)) {
                $current['explanation'] = trim($match[1]);
                continue;
            }

            if (preg_match('/^(?:halaman|sumber(?:\s+halaman)?|source\s+pages?)\s*[:=-]\s*(.*)$/iu', $line, $match)) {
                preg_match_all('/\d+/', $match[1], $pageMatches);
                $current['source_pages'] = array_values(array_unique(array_map('intval', $pageMatches[0])));
                continue;
            }

            $current['question_text'] .= "\n" . $line;
        }

        $flush();

        if (count($questions) < 1 || count($questions) > 12) {
            throw ValidationException::withMessages([
                'text' => 'Dokumen harus berisi 1 sampai 12 soal bernomor.',
            ]);
        }

        foreach ($questions as $index => &$question) {
            $number = $index + 1;
            $hasOptions = count(array_filter(
                ['a', 'b', 'c', 'd'],
                static fn (string $option): bool => isset($question['option_' . $option]),
            )) > 0;

            if ($question['question_type'] === 'essay' || !$hasOptions) {
                $question['question_type'] = 'essay';
                $question['correct_answer'] = null;
                foreach (['a', 'b', 'c', 'd'] as $option) {
                    $question['option_' . $option] = '';
                }
                if ($question['model_answer'] === '') {
                    $this->invalidQuestion($number, 'Soal esai harus memiliki "Jawaban: ...".');
                }
            } else {
                $question['question_type'] = 'multiple_choice';
                foreach (['a', 'b', 'c', 'd'] as $option) {
                    if (!isset($question['option_' . $option])) {
                        $this->invalidQuestion($number, 'Pilihan ganda harus memiliki opsi A, B, C, dan D.');
                    }
                    if (mb_strlen($question['option_' . $option]) > 255) {
                        $this->invalidQuestion($number, 'Teks setiap opsi maksimal 255 karakter.');
                    }
                }
                if (!in_array($question['correct_answer'], ['a', 'b', 'c', 'd'], true)) {
                    $this->invalidQuestion($number, 'Pilihan ganda harus memiliki "Kunci: A/B/C/D".');
                }
            }

            if (mb_strlen($question['question_text']) > 5000) {
                $this->invalidQuestion($number, 'Teks soal maksimal 5.000 karakter.');
            }
            if (mb_strlen($question['model_answer']) > 5000 || mb_strlen($question['explanation']) > 5000) {
                $this->invalidQuestion($number, 'Jawaban dan pembahasan maksimal 5.000 karakter.');
            }
        }
        unset($question);

        return $questions;
    }

    private function newQuestion(string $text): array
    {
        return [
            'question_text' => $text,
            'question_type' => 'multiple_choice',
            'option_a' => null,
            'option_b' => null,
            'option_c' => null,
            'option_d' => null,
            'correct_answer' => null,
            'model_answer' => '',
            'explanation' => '',
            'source_pages' => [],
        ];
    }

    private function invalidLine(int $line, string $message): never
    {
        throw ValidationException::withMessages([
            'text' => "Baris {$line}: {$message}",
        ]);
    }

    private function invalidQuestion(int $number, string $message): never
    {
        throw ValidationException::withMessages([
            'text' => "Soal {$number}: {$message}",
        ]);
    }
}
