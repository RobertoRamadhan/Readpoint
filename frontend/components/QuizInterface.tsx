'use client';

import { useState } from 'react';
import { Card, RippleButton, Badge } from '@/components/shared';

export interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

export interface QuizInterfaceProps {
  quizId: number;
  ebookTitle: string;
  questions: QuizQuestion[];
  onSubmit: (answers: Record<number, string>, score: number) => void;
  onCancel: () => void;
}

export default function QuizInterface({
  ebookTitle,
  questions,
  onSubmit,
  onCancel,
}: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];
  const options = [
    { key: 'a', label: currentQuestion?.option_a },
    { key: 'b', label: currentQuestion?.option_b },
    { key: 'c', label: currentQuestion?.option_c },
    { key: 'd', label: currentQuestion?.option_d },
  ];

  const handleSelectAnswer = (key: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: key });
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer.toLowerCase()) correctCount++;
    });
    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setShowResults(true);
    onSubmit(selectedAnswers, calculatedScore);
  };

  const handleTakeAgain = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const isAnswered = currentQuestion && selectedAnswers[currentQuestion.id];
  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  // ── No questions ────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <Card padding="lg" shadow="xl" className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-black text-amber-900 mb-2">Tidak Ada Kuis</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Tidak ada pertanyaan kuis yang tersedia untuk e-book ini.
          </p>
          <RippleButton variant="secondary" fullWidth onClick={onCancel}>
            ← Kembali
          </RippleButton>
        </Card>
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────────────────────────
  if (showResults) {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correct_answer.toLowerCase()
    ).length;

    const resultEmoji = score >= 80 ? '🏆' : score >= 60 ? '👍' : '💪';
    const resultMessage =
      score >= 80
        ? 'Luar Biasa! Kamu menguasai materi ini!'
        : score >= 60
        ? 'Bagus! Terus tingkatkan pengetahuanmu.'
        : 'Ayo coba lagi untuk hasil yang lebih baik!';

    const scoreColor =
      score >= 80
        ? 'text-green-600'
        : score >= 60
        ? 'text-amber-600'
        : 'text-red-500';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <Card padding="lg" shadow="xl" className="max-w-md w-full">
          {/* Score */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{resultEmoji}</div>
            <h2 className="text-2xl font-black text-amber-900 mb-1">Hasil Kuismu</h2>
            <p className={`text-6xl font-black ${scoreColor} my-4`}>{score}%</p>
            <p className="text-slate-600 text-sm">{resultMessage}</p>
          </div>

          {/* Stats */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-amber-800 font-semibold text-sm">Jawaban Benar</span>
              <Badge variant="success" size="sm">{correctAnswers}/{questions.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-800 font-semibold text-sm">Akurasi</span>
              <Badge variant={score >= 60 ? 'success' : 'danger'} size="sm">
                {Math.round((correctAnswers / questions.length) * 100)}%
              </Badge>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-400'
                }`}
                style={{ width: `${(correctAnswers / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <RippleButton variant="primary" fullWidth onClick={handleTakeAgain}>
              🔄 Coba Lagi
            </RippleButton>
            <RippleButton variant="secondary" fullWidth onClick={onCancel}>
              ← Kembali ke Dashboard
            </RippleButton>
          </div>
        </Card>
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-800 to-amber-900 text-white px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-black truncate flex-1 mr-4">📝 {ebookTitle}</h1>
            <Badge variant="secondary" size="sm">
              {answeredCount}/{questions.length} Terjawab
            </Badge>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-amber-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-300 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-amber-200 mt-1.5 font-semibold">
            Soal {currentIndex + 1} dari {questions.length}
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl">
          {/* Question Card */}
          <Card padding="lg" shadow="lg" className="mb-6">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">
              Soal {currentIndex + 1}
            </p>
            <h2 className="text-xl font-black text-gray-900 mb-6 leading-relaxed">
              {currentQuestion?.question_text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion?.id] === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => handleSelectAnswer(option.key)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-semibold flex items-center gap-3 hover:scale-[1.01] active:scale-[0.99] ${
                      isSelected
                        ? 'border-amber-600 bg-amber-600 text-white shadow-md shadow-amber-200'
                        : 'border-amber-200 bg-white text-gray-800 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 border-2 ${
                        isSelected
                          ? 'border-white bg-white text-amber-700'
                          : 'border-amber-300 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {option.key.toUpperCase()}
                    </div>
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <span className="text-white text-lg">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <p className="text-xs text-amber-500 font-medium mt-4 text-center">
              💡 Pilih satu jawaban terbaik dari opsi yang tersedia
            </p>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3 items-center">
            <RippleButton
              variant="secondary"
              onClick={handlePreviousQuestion}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              ← Sebelumnya
            </RippleButton>

            {currentIndex === questions.length - 1 ? (
              <RippleButton
                variant="success"
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="flex-1"
              >
                ✅ Selesai & Kirim
              </RippleButton>
            ) : (
              <RippleButton
                variant="primary"
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="flex-1"
              >
                Selanjutnya →
              </RippleButton>
            )}
          </div>

          {!allAnswered && currentIndex === questions.length - 1 && (
            <p className="text-center text-amber-600 text-xs font-semibold mt-3">
              ⚠️ Jawab semua soal sebelum mengirim ({questions.length - answeredCount} soal belum dijawab)
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-200 px-4 sm:px-6 py-4 text-center">
        <RippleButton variant="outline" size="small" onClick={onCancel}>
          ✕ Batal Kuis
        </RippleButton>
      </footer>
    </div>
  );
}
