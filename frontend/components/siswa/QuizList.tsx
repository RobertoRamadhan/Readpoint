'use client';

import React from 'react';
import { Card, Button } from '@/components/shared';
import { getDifficultyColor } from '@/lib/utils';

interface Quiz {
  id: number;
  ebook_id: number;
  ebook_title?: string;
  title?: string;
  total_questions: number;
  difficulty: string;
  points_reward: number;
}

interface QuizListProps {
  quizzes: Quiz[];
  loading?: boolean;
  onStartQuiz: (quizId: number) => void;
}

export default function QuizList({ quizzes, loading, onStartQuiz }: QuizListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-lg mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-2xl shadow-xl p-12 text-center border-2 border-emerald-200">
        <p className="text-gray-800 font-black text-lg">❓ Belum ada quiz tersedia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onStartQuiz={onStartQuiz} />
      ))}
    </div>
  );
}

function QuizCard({ quiz, onStartQuiz }: { quiz: Quiz; onStartQuiz: (quizId: number) => void }) {

  return (
    <Card hover className="overflow-hidden group">
      <div className="h-32 bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 flex items-center justify-center text-5xl relative overflow-hidden">
        <div className="group-hover:scale-125 transition-transform duration-300">❓</div>
      </div>
      
      <div className="p-6">
        <h4 className="font-black text-gray-900 mb-2 text-lg line-clamp-2">
          {quiz.ebook_title || `Quiz ${quiz.id}`}
        </h4>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-bold">📝 Soal</span>
            <span className="font-black text-gray-900 bg-emerald-100 px-3 py-1 rounded-full">
              {quiz.total_questions}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-bold">📊 Level</span>
            <span className={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-bold">⭐ Reward</span>
            <span className="font-black text-emerald-600">{quiz.points_reward} poin</span>
          </div>
        </div>
        
        <Button
          onClick={() => onStartQuiz(quiz.id)}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600"
        >
          Mulai Quiz ➜
        </Button>
      </div>
    </Card>
  );
}
