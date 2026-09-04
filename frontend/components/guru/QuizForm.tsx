'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Card } from '@/components/shared';

interface QuizQuestion {
  id?: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

interface Ebook {
  id: number;
  title: string;
  author: string;
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizData: QuizFormData) => void;
  editingQuiz?: QuizFormData | null;
  ebooks: Ebook[];
  loading?: boolean;
}

export interface QuizFormData {
  id?: number;
  ebook_id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points_reward: number;
  time_limit_minutes: number;
  passing_score: number;
  questions: QuizQuestion[];
}

export default function QuizForm({
  isOpen,
  onClose,
  onSubmit,
  editingQuiz,
  ebooks,
  loading = false
}: QuizFormProps) {
  const [formData, setFormData] = useState<QuizFormData>({
    ebook_id: 0,
    title: '',
    description: '',
    difficulty: 'medium',
    points_reward: 50,
    time_limit_minutes: 30,
    passing_score: 70,
    questions: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (editingQuiz) {
        setFormData(editingQuiz);
      } else {
        setFormData({
          ebook_id: 0,
          title: '',
          description: '',
          difficulty: 'medium',
          points_reward: 50,
          time_limit_minutes: 30,
          passing_score: 70,
          questions: []
        });
      }
      setErrors({});
    }, 0);

    return () => window.clearTimeout(t);
  }, [editingQuiz, isOpen]);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a'
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ebook_id) {
      newErrors.ebook_id = 'Pilih e-book terlebih dahulu';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Judul quiz harus diisi';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi quiz harus diisi';
    }

    if (formData.questions.length === 0) {
      newErrors.questions = 'Tambahkan minimal 1 pertanyaan';
    } else {
      formData.questions.forEach((q, index) => {
        if (!q.question_text.trim()) {
          newErrors[`question_${index}`] = 'Pertanyaan harus diisi';
        }
        if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
          newErrors[`options_${index}`] = 'Semua opsi jawaban harus diisi';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof QuizFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-black text-gray-900">
          {editingQuiz ? '✏️ Edit Quiz' : '➕ Buat Quiz Baru'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <div className="p-6 space-y-4">
              <h4 className="font-black text-gray-900 mb-4">📋 Informasi Dasar</h4>
              
              {/* E-book Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  E-Book
                </label>
                <select
                  value={formData.ebook_id}
                  onChange={(e) => handleChange('ebook_id', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                    errors.ebook_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>-- Pilih E-Book --</option>
                  {ebooks.map((ebook) => (
                    <option key={ebook.id} value={ebook.id}>
                      {ebook.title} - {ebook.author}
                    </option>
                  ))}
                </select>
                {errors.ebook_id && (
                  <p className="mt-1 text-sm text-red-600 font-semibold">{errors.ebook_id}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Judul Quiz
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: Quiz Chapter 1"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 font-semibold">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jelaskan tentang quiz ini..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 font-semibold">{errors.description}</p>
                )}
              </div>

              {/* Settings Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Points Reward
                  </label>
                  <input
                    type="number"
                    value={formData.points_reward}
                    onChange={(e) => handleChange('points_reward', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
                    min="10"
                    max="200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Time Limit (menit)
                  </label>
                  <input
                    type="number"
                    value={formData.time_limit_minutes}
                    onChange={(e) => handleChange('time_limit_minutes', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
                    min="5"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => handleChange('passing_score', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
                    min="50"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-gray-900">❓ Pertanyaan</h4>
                <Button
                  type="button"
                  onClick={addQuestion}
                  variant="success"
                  size="sm"
                >
                  ➕ Tambah Pertanyaan
                </Button>
              </div>

              {errors.questions && (
                <p className="mb-4 text-sm text-red-600 font-semibold">{errors.questions}</p>
              )}

              {formData.questions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 font-semibold">Belum ada pertanyaan</p>
                  <p className="text-sm text-gray-500 mt-2">Klik "Tambah Pertanyaan" untuk mulai</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.questions.map((question, index) => (
                    <QuestionCard
                      key={index}
                      question={question}
                      index={index}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                      errors={errors}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : (editingQuiz ? 'Update Quiz' : 'Buat Quiz')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function QuestionCard({
  question,
  index,
  onUpdate,
  onRemove,
  errors
}: {
  question: QuizQuestion;
  index: number;
  onUpdate: (index: number, field: keyof QuizQuestion, value: any) => void;
  onRemove: (index: number) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-black text-gray-900">Pertanyaan {index + 1}</h5>
        <Button
          type="button"
          onClick={() => onRemove(index)}
          variant="danger"
          size="sm"
        >
          🗑️ Hapus
        </Button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Pertanyaan
          </label>
          <textarea
            value={question.question_text}
            onChange={(e) => onUpdate(index, 'question_text', e.target.value)}
            rows={2}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
              errors[`question_${index}`] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tulis pertanyaan di sini..."
          />
          {errors[`question_${index}`] && (
            <p className="mt-1 text-sm text-red-600 font-semibold">{errors[`question_${index}`]}</p>
          )}
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Opsi Jawaban
          </label>
          <div className="space-y-2">
            {['a', 'b', 'c', 'd'].map((option) => (
              <div key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct_${index}`}
                  checked={question.correct_answer === option}
                  onChange={() => onUpdate(index, 'correct_answer', option as 'a' | 'b' | 'c' | 'd')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-bold text-gray-700 w-8">{option.toUpperCase()}.</span>
                <input
                  type="text"
                  value={question[`option_${option}` as keyof QuizQuestion] as string}
                  onChange={(e) => onUpdate(index, `option_${option}` as keyof QuizQuestion, e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
                  placeholder={`Opsi ${option.toUpperCase()}`}
                />
              </div>
            ))}
          </div>
          {errors[`options_${index}`] && (
            <p className="mt-1 text-sm text-red-600 font-semibold">{errors[`options_${index}`]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
