'use client';

import { useState } from 'react';
import { Badge } from '@/components/shared';

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

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Kuis</p>
          <h2 className="mt-4 text-2xl font-black text-slate-900">Tidak Ada Kuis</h2>
          <p className="mt-4 leading-7 text-slate-600">Tidak ada pertanyaan kuis yang tersedia untuk e-book ini.</p>
          <button onClick={onCancel} className="mt-8 h-12 w-full rounded-2xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 transition hover:bg-slate-100">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correct_answer.toLowerCase()
    ).length;

    const resultMessage =
      score >= 80
        ? 'Luar biasa, kamu menguasai materi ini.'
        : score >= 60
        ? 'Bagus, terus tingkatkan pemahamanmu.'
        : 'Ayo coba lagi untuk hasil yang lebih baik.';

    const scoreColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-slate-900' : 'text-red-600';

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Hasil Kuis</p>
            <h2 className="mt-4 text-2xl font-black text-slate-900">Hasil Kuismu</h2>
            <p className={`my-6 text-6xl font-black ${scoreColor}`}>{score}%</p>
            <p className="leading-7 text-slate-600">{resultMessage}</p>
          </div>

          <div className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-700">Jawaban Benar</span>
              <Badge variant="success" size="sm">{correctAnswers}/{questions.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-700">Akurasi</span>
              <Badge variant={score >= 60 ? 'success' : 'danger'} size="sm">
                {Math.round((correctAnswers / questions.length) * 100)}%
              </Badge>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${score >= 60 ? 'bg-emerald-700' : 'bg-red-500'}`}
                style={{ width: `${(correctAnswers / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button onClick={handleTakeAgain} className="h-12 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white transition hover:bg-emerald-800">
              Coba Lagi
            </button>
            <button onClick={onCancel} className="h-12 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 transition hover:bg-slate-100">
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-5 shadow-sm backdrop-blur sm:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Kuis E-Book</p>
              <h1 className="mt-2 truncate text-xl font-black text-slate-900">{ebookTitle}</h1>
            </div>
            <Badge variant="secondary" size="sm">
              {answeredCount}/{questions.length} Terjawab
            </Badge>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-700 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-500">Soal {currentIndex + 1} dari {questions.length}</p>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-4xl">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Soal {currentIndex + 1}</p>
            <h2 className="mt-5 text-2xl font-black leading-relaxed text-slate-900">
              {currentQuestion?.question_text}
            </h2>

            <div className="mt-8 space-y-4">
              {options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion?.id] === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => handleSelectAnswer(option.key)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left font-semibold transition ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-700 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-black ${isSelected ? 'bg-white text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {option.key.toUpperCase()}
                    </span>
                    <span className="flex-1">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentIndex === 0}
              className="h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="h-12 flex-1 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Selesai & Kirim
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="h-12 flex-1 rounded-2xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Selanjutnya
              </button>
            )}
          </div>

          {!allAnswered && currentIndex === questions.length - 1 && (
            <p className="mt-4 text-center text-sm font-semibold text-red-600">
              Jawab semua soal sebelum mengirim. {questions.length - answeredCount} soal belum dijawab.
            </p>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center sm:px-8">
        <button onClick={onCancel} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-100">
          Batal Kuis
        </button>
      </footer>
    </div>
  );
}
