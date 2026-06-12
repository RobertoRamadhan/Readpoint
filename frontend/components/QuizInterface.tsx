'use client';

import { useState } from 'react';

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

export default function QuizInterface({ ebookTitle, questions, onSubmit, onCancel }: QuizInterfaceProps) {
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

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAnswered = currentQuestion && selectedAnswers[currentQuestion.id];
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const progress = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const selectAnswer = (key: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
  };

  const submitQuiz = () => {
    const correctCount = questions.filter((q) => selectedAnswers[q.id] === q.correct_answer.toLowerCase()).length;
    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setShowResults(true);
    onSubmit(selectedAnswers, calculatedScore);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Kuis</p>
          <h2 className="mt-4 text-2xl font-black text-slate-900">Tidak Ada Kuis</h2>
          <p className="mt-4 leading-7 text-slate-600">Tidak ada pertanyaan kuis yang tersedia untuk e-book ini.</p>
          <button onClick={onCancel} className="mt-8 h-12 w-full rounded-2xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 hover:bg-slate-100">Kembali</button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = questions.filter((q) => selectedAnswers[q.id] === q.correct_answer.toLowerCase()).length;
    const resultMessage = score >= 80 ? 'Luar biasa, kamu menguasai materi ini.' : score >= 60 ? 'Bagus, terus tingkatkan pemahamanmu.' : 'Ayo coba lagi untuk hasil yang lebih baik.';
    const scoreColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-slate-900' : 'text-red-600';

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Hasil Kuis</p>
            <h2 className="mt-4 text-2xl font-black text-slate-900">Hasil Kuismu</h2>
            <p className={`my-6 text-6xl font-black ${scoreColor}`}>{score}%</p>
            <p className="leading-7 text-slate-600">{resultMessage}</p>
          </div>

          <div className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <ResultRow label="Jawaban Benar" value={`${correctAnswers}/${questions.length}`} success={score >= 60} />
            <ResultRow label="Akurasi" value={`${Math.round((correctAnswers / questions.length) * 100)}%`} success={score >= 60} />
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${score >= 60 ? 'bg-emerald-700' : 'bg-red-500'}`} style={{ width: `${(correctAnswers / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button onClick={resetQuiz} className="h-12 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800">Coba Lagi</button>
            <button onClick={onCancel} className="h-12 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-900 hover:bg-slate-100">Kembali ke Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex min-h-[58px] items-center justify-between gap-4">
            <button onClick={onCancel} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-700 hover:bg-slate-100">←</button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Kuis E-Book</p>
              <h1 className="mt-1 truncate text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">{ebookTitle}</h1>
            </div>
            <div className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">{answeredCount}/{questions.length}</div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="hidden shrink-0 text-xs font-black text-slate-600 sm:inline">Progress Kuis</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-700 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-12 text-right text-xs font-black text-emerald-700">{progress}%</span>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 overflow-x-hidden px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <section className="mx-auto w-full max-w-[1180px] min-w-0">
          <div className="mb-5 flex max-w-full justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
            {questions.map((q, index) => (
              <button key={q.id} onClick={() => setCurrentIndex(index)} className={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-black ${index === currentIndex ? 'bg-emerald-600 text-white shadow-sm' : selectedAnswers[q.id] ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'border border-slate-200 bg-white text-slate-500'}`}>{index + 1}</button>
            ))}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 sm:text-sm">Soal {currentIndex + 1}</p>
            <h2 className="mt-4 max-w-4xl text-xl font-black leading-relaxed text-slate-900 sm:text-2xl lg:text-[28px]">{currentQuestion?.question_text}</h2>
            <p className="mt-3 text-sm font-semibold text-slate-500">Pilih salah satu jawaban yang paling tepat.</p>
            <div className="mt-7 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
              {options.map((option) => {
                const isSelected = selectedAnswers[currentQuestion?.id] === option.key;
                return (
                  <button key={option.key} onClick={() => selectAnswer(option.key)} className={`flex min-h-[74px] w-full min-w-0 items-start gap-3 rounded-2xl border p-4 text-left font-semibold transition sm:p-5 ${isSelected ? 'border-emerald-700 bg-emerald-700 text-white shadow-md' : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-700 hover:bg-slate-50'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${isSelected ? 'bg-white text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{option.key.toUpperCase()}</span>
                    <span className="min-w-0 flex-1 leading-7">{option.label}</span>
                    {isSelected && <span className="shrink-0 text-lg font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="h-12 min-w-0 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">Sebelumnya</button>
            {currentIndex === questions.length - 1 ? <button onClick={submitQuiz} disabled={!allAnswered} className="h-12 min-w-0 rounded-2xl bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">Selesai & Kirim</button> : <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={!isAnswered} className="h-12 min-w-0 rounded-2xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5">Selanjutnya</button>}
          </div>

          {!allAnswered && currentIndex === questions.length - 1 && <p className="mt-4 text-center text-sm font-semibold text-red-600">Jawab semua soal sebelum mengirim. {questions.length - answeredCount} soal belum dijawab.</p>}
        </section>
      </main>
    </div>
  );
}

function ResultRow({ label, value, success }: { label: string; value: string; success: boolean }) {
  return <div className="flex items-center justify-between"><span className="text-sm font-black text-slate-700">{label}</span><span className={`rounded-full px-3 py-1 text-xs font-black ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{value}</span></div>;
}
