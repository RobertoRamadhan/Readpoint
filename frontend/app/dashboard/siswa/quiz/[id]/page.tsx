'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import QuizInterface, { QuizQuestion } from '@/components/QuizInterface';
import { PageLoading, Loading, Card, RippleButton } from '@/components/shared';

export default function QuizPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ebookId = Number(params.id);

  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [ebookTitle, setEbookTitle] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    if (!ebookId || isNaN(ebookId)) { router.push('/dashboard/siswa'); return; }
    fetchQuiz();
  }, [mounted, loading, isAuthenticated, user, ebookId]);

  const fetchQuiz = async () => {
    try {
      setLoadingQuiz(true);
      setError(null);

      // Fetch ebook info for title
      const ebookRes = await api.getEbook(ebookId);
      const ebook = (ebookRes as any)?.data || ebookRes;
      setEbookTitle(ebook?.title || `Quiz Buku #${ebookId}`);

      // Fetch quiz questions for this ebook
      const quizRes = await api.getQuizzes(ebookId);
      const data = (quizRes as any)?.data;
      const rawQuestions = Array.isArray(data) ? data : [];

      if (rawQuestions.length === 0) {
        setError('Belum ada soal quiz untuk buku ini. Silakan coba buku lain.');
        setLoadingQuiz(false);
        return;
      }

      setQuestions(rawQuestions as QuizQuestion[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSubmit = async (answers: Record<number, string>, score: number) => {
    if (submitted) return;
    setSubmitted(true);
    try {
      await api.submitQuiz({
        ebook_id: ebookId,
        answers,
        score,
      });
    } catch (err) {
      console.error('[Quiz] Failed to submit quiz:', err);
      // Don't block the UI — results are already shown
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/siswa');
  };

  if (!mounted || loading) return <PageLoading />;
  if (!isAuthenticated || !user || user.role !== 'siswa') return null;

  if (loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-50">
        <Loading size="lg" text="Memuat soal quiz..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-50 p-4">
        <Card padding="lg" shadow="xl" className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-black text-emerald-900 mb-3">Quiz Tidak Tersedia</h2>
          <p className="text-slate-500 mb-6 text-sm">{error}</p>
          <RippleButton variant="secondary" fullWidth onClick={handleCancel}>
            ← Kembali ke Dashboard
          </RippleButton>
        </Card>
      </div>
    );
  }

  return (
    <QuizInterface
      quizId={ebookId}
      ebookTitle={ebookTitle}
      questions={questions}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
