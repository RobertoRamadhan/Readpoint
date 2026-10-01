'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface EssayQuestionReview {
  question_id: number;
  question_text: string;
  student_answer: string;
  model_answer: string;
  explanation?: string;
  source_pages?: number[];
}

interface EssayAttemptReview {
  attempt_id: number;
  ebook_title: string;
  student_name: string;
  submitted_at: string;
  questions: EssayQuestionReview[];
}

interface GradeInput {
  score: string;
  feedback: string;
}

export default function EssayReviewPanel() {
  const [attempts, setAttempts] = useState<EssayAttemptReview[]>([]);
  const [grades, setGrades] = useState<Record<number, Record<number, GradeInput>>>({});
  const [loading, setLoading] = useState(true);
  const [savingAttempt, setSavingAttempt] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.quiz.getEssayReviews();
      const data = Array.isArray(response.data) ? response.data as EssayAttemptReview[] : [];
      setAttempts(data);
      setGrades(Object.fromEntries(data.map(attempt => [
        attempt.attempt_id,
        Object.fromEntries(attempt.questions.map(question => [question.question_id, { score: '', feedback: '' }])),
      ])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal memuat jawaban esai.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const updateGrade = (attemptId: number, questionId: number, field: keyof GradeInput, value: string) => {
    setGrades(previous => ({
      ...previous,
      [attemptId]: {
        ...previous[attemptId],
        [questionId]: { ...previous[attemptId]?.[questionId], [field]: value },
      },
    }));
  };

  const submitGrades = async (attempt: EssayAttemptReview) => {
    const attemptGrades = grades[attempt.attempt_id] ?? {};
    if (attempt.questions.some(question => attemptGrades[question.question_id]?.score === '')) {
      setError('Isi nilai setiap jawaban esai terlebih dahulu.');
      return;
    }

    try {
      setSavingAttempt(attempt.attempt_id);
      setError('');
      await api.quiz.gradeEssayAttempt(attempt.attempt_id, {
        grades: attempt.questions.map(question => ({
          question_id: question.question_id,
          score: Number(attemptGrades[question.question_id].score),
          feedback: attemptGrades[question.question_id].feedback,
        })),
      });
      setNotice(`Penilaian ${attempt.student_name} berhasil disimpan.`);
      await loadReviews();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal menyimpan penilaian.');
    } finally {
      setSavingAttempt(null);
    }
  };

  return (
    <section className="mb-8 border-y border-gray-200 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">Jawaban esai menunggu penilaian</h2>
          <p className="mt-1 text-sm text-gray-600">Periksa panduan jawaban, beri nilai 0 sampai 100, lalu kirim umpan balik.</p>
        </div>
        <button type="button" onClick={() => void loadReviews()} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">Muat ulang</button>
      </div>

      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">{notice}</p>}
      {loading ? <p className="text-sm text-gray-600">Memuat jawaban...</p> : attempts.length === 0 ? <p className="text-sm text-gray-600">Belum ada jawaban esai yang menunggu penilaian.</p> : (
        <div className="space-y-5">
          {attempts.map(attempt => (
            <article key={attempt.attempt_id} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
                <h3 className="font-black text-gray-900">{attempt.student_name} <span className="font-medium text-gray-500">/ {attempt.ebook_title}</span></h3>
                <time className="text-xs text-gray-500">{new Date(attempt.submitted_at).toLocaleString('id-ID')}</time>
              </div>
              <div className="space-y-6">
                {attempt.questions.map(question => {
                  const grade = grades[attempt.attempt_id]?.[question.question_id] ?? { score: '', feedback: '' };
                  return (
                    <div key={question.question_id} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="space-y-3">
                        <p className="font-bold text-gray-900">{question.question_text}</p>
                        <div className="rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-800">{question.student_answer}</div>
                        <p className="text-sm text-gray-600"><strong>Panduan jawaban:</strong> {question.model_answer}</p>
                        {question.source_pages?.length ? <p className="text-xs text-gray-500">Sumber: halaman {question.source_pages.join(', ')}</p> : null}
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">Nilai (0-100)
                          <input type="number" min={0} max={100} value={grade.score} onChange={event => updateGrade(attempt.attempt_id, question.question_id, 'score', event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                        </label>
                        <label className="block text-sm font-bold text-gray-700">Umpan balik
                          <textarea rows={3} value={grade.feedback} onChange={event => updateGrade(attempt.attempt_id, question.question_id, 'feedback', event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-normal" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                <button type="button" disabled={savingAttempt === attempt.attempt_id} onClick={() => void submitGrades(attempt)} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
                  {savingAttempt === attempt.attempt_id ? 'Menyimpan...' : 'Simpan penilaian'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
