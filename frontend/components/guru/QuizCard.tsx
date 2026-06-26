'use client';

import React from 'react';
import { GenericCard, Button } from '@/components/shared';
import type { CardAction, CardData } from '@/components/shared/GenericCard';
import { getDifficultyVariant } from '@/lib/utils';

interface Quiz {
  id: number;
  ebook_id: number;
  ebook_title?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points_reward: number;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  created_at: string;
  is_active: boolean;
}

interface QuizCardProps {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quizId: number) => void;
  onViewResults: (quizId: number) => void;
  onToggleStatus: (quizId: number, active: boolean) => void;
  loading?: boolean;
}

export default function QuizCard({
  quiz,
  onEdit,
  onDelete,
  onViewResults,
  onToggleStatus,
  loading = false
}: QuizCardProps) {
  const cardData: CardData = {
    title: quiz.title,
    subtitle: quiz.ebook_title || 'Tidak ada buku',
    description: quiz.description,
    status: quiz.is_active ? 'Aktif' : 'Tidak Aktif',
    statusVariant: quiz.is_active ? 'success' : 'secondary',
    metadata: [
      { label: 'Tingkat Kesulitan', value: quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1), icon: '📊' },
      { label: 'Jumlah Soal', value: quiz.total_questions, icon: '❓' },
      { label: 'Nilai Lulus', value: `${quiz.passing_score}%`, icon: '🎯' },
      { label: 'Batas Waktu', value: `${quiz.time_limit_minutes} menit`, icon: '⏱️' },
      { label: 'Dibuat', value: new Date(quiz.created_at).toLocaleDateString('id-ID'), icon: '📅' }
    ],
    stats: [
      { label: 'Hadiah Poin', value: quiz.points_reward, color: 'var(--primary-600)' },
      { label: 'Batas Waktu', value: `${quiz.time_limit_minutes}m`, color: 'var(--primary-600)' }
    ]
  };

  const actions: CardAction[] = [
    { label: 'Edit', onClick: () => onEdit(quiz), variant: 'outline', disabled: loading },
    { label: 'Hasil', onClick: () => onViewResults(quiz.id), variant: 'outline', disabled: loading },
    { label: quiz.is_active ? 'Nonaktifkan' : 'Aktifkan', onClick: () => onToggleStatus(quiz.id, !quiz.is_active), variant: 'outline', disabled: loading },
    { label: 'Hapus', onClick: () => onDelete(quiz.id), variant: 'danger', disabled: loading }
  ];

  return (
    <GenericCard
      data={cardData}
      actions={actions}
      hover
      loading={loading}
    />
  );
}
