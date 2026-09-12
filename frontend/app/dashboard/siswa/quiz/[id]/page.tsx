'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import QuizInterface, { QuizQuestion, QuizSubmitResult } from '@/components/shared/QuizInterface';
import { PageLoading, Loading, Card, RippleButton } from '@/components/shared';

export default function QuizPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ebookId = Number(params?.id);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [ebookTitle, setEbookTitle] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!ebookId || !isAuthenticated) return;

    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        const [ebookRes, quizRes] = await Promise.all([
          api.getEbook(ebookId),
          api.getQuizzes(ebookId),
        ]);

        const ebook = (ebookRes?.data ?? ebookRes) as Record<string, unknown>;
        setEbookTitle((ebook?.title as string) ?? 'E-Book');

        const quizData = quizRes?.data ?? quizRes;
        const questionList = Array.isArray(quizData)
          ? quizData
          : Array.isArray((quizData as Record<string, unknown>)?.questions)
          ? ((quizData as Record<string, unknown>).questions as QuizQuestion[])
          : [];

        setQuestions(questionList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat kuis');
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchQuiz();
  }, [ebookId, isAuthenticated]);

  const handleSubmit = async (answers: Record<number, string>): Promise<QuizSubmitResult | void> => {
    const result = await api.submitQuiz({
      ebook_id: ebookId,
      answers,
    });
    return result as unknown as QuizSubmitResult;
  };

  if (loading || loadingQuiz) return <PageLoading />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full text-center p-8">
        <p className="text-red-600 font-bold mb-4">{error}</p>
        <RippleButton onClick={() => router.back()}>Kembali</RippleButton>
      </Card>
    </div>
  );

  return (
    <QuizInterface
      quizId={ebookId}
      ebookTitle={ebookTitle}
      questions={questions}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}