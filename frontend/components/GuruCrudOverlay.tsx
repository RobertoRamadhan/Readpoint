'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

type Ebook = {
  id: number;
  title: string;
  author?: string;
};

type QuizGroup = {
  id?: number;
  quiz_id?: number;
  ebook_id?: number;
  ebook_title?: string;
  title?: string;
  question_count?: number;
  attempt_count?: number;
};

type QuizQuestion = {
  id?: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
};

type Student = {
  id: number;
  name: string;
  email: string;
  class_name?: string;
  total_points?: number;
  books_read?: number;
  reading_progress?: number;
  quiz_average_score?: number;
  quizzes_passed?: number;
};

type StudentForm = {
  name: string;
  email: string;
  class_name: string;
  grade_level: string;
  password: string;
};

const defaultQuestion = (): QuizQuestion => ({
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'a',
});

const defaultStudentForm: StudentForm = {
  name: '',
  email: '',
  class_name: '',
  grade_level: '1',
  password: '',
};

function toArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.questions)) return payload.data.questions;
  if (Array.isArray(payload?.questions)) return payload.questions;
  return [];
}

function normalizeQuestion(item: any): QuizQuestion {
  return {
    id: item?.id,
    question: item?.question || '',
    option_a: item?.option_a || '',
    option_b: item?.option_b || '',
    option_c: item?.option_c || '',
    option_d: item?.option_d || '',
    correct_answer: (item?.correct_answer || 'a') as 'a' | 'b' | 'c' | 'd',
  };
}

function GuruCrudOverlayInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  if (pathname !== '/dashboard/guru') return null;
  if (tab !== 'kuis' && tab !== 'siswa') return null;

  return (
    <div className="fixed bottom-0 right-0 top-14 z-20 overflow-y-auto bg-slate-50 md:left-72 sm:top-16 left-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {tab === 'kuis' ? <GuruQuizCrud /> : <GuruStudentCrud />}
      </div>
    </div>
  );
}

function GuruQuizCrud() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [quizzes, setQuizzes] = useState<QuizGroup[]>([]);
  const [selectedEbookId, setSelectedEbookId] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>(Array.from({ length: 5 }, defaultQuestion));
  const [editingQuiz, setEditingQuiz] = useState<QuizGroup | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  const filledCount = useMemo(() => questions.filter((q) => q.question.trim()).length, [questions]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ebookRes, quizRes] = await Promise.all([api.getEbooks(), api.dashboard.guruQuizzes()]);
      setEbooks(toArray(ebookRes) as Ebook[]);
      setQuizzes(toArray(quizRes) as QuizGroup[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data kuis');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingQuiz(null);
    setSelectedEbookId('');
    setQuestions(Array.from({ length: 5 }, defaultQuestion));
    setError('');
    setMessage('');
    setFormOpen(true);
  };

  const openEdit = async (quiz: QuizGroup) => {
    const ebookId = quiz.ebook_id || quiz.id;
    if (!ebookId) {
      setError('ID e-book pada kuis tidak ditemukan');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.getQuizzes(Number(ebookId));
      const loadedQuestions = toArray(response).map(normalizeQuestion);
      const nextQuestions = Array.from({ length: 5 }, (_, index) => loadedQuestions[index] || defaultQuestion());

      setEditingQuiz(quiz);
      setSelectedEbookId(String(ebookId));
      setQuestions(nextQuestions);
      setFormOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuka data kuis');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string) => {
    setQuestions((current) =>
      current.map((question, idx) =>
        idx === index ? { ...question, [field]: value } : question
      )
    );
  };

  const submitQuiz = async () => {
    const ebookId = Number(selectedEbookId);
    if (!ebookId) {
      setError('Pilih e-book terlebih dahulu');
      return;
    }

    const complete = questions.every((q) =>
      q.question.trim() && q.option_a.trim() && q.option_b.trim() && q.option_c.trim() && q.option_d.trim()
    );

    if (!complete) {
      setError('Semua pertanyaan dan pilihan jawaban harus diisi');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const existingQuestionIds = questions.map((q) => q.id).filter(Boolean) as number[];

      if (editingQuiz && existingQuestionIds.length > 0) {
        await Promise.all(
          questions.map((question) => {
            if (!question.id) return Promise.resolve();
            return api.quiz.update(question.id, { ...question, ebook_id: ebookId });
          })
        );
      } else {
        await api.quiz.create({ ebook_id: ebookId, questions });
      }

      setMessage(editingQuiz ? 'Kuis berhasil diperbarui' : 'Kuis berhasil dibuat');
      setFormOpen(false);
      setEditingQuiz(null);
      setSelectedEbookId('');
      setQuestions(Array.from({ length: 5 }, defaultQuestion));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kuis');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (quiz: QuizGroup) => {
    const ebookId = quiz.ebook_id || quiz.id;
    const confirmed = window.confirm(`Hapus kuis ${quiz.ebook_title || quiz.title || ''}?`);
    if (!confirmed || !ebookId) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await api.getQuizzes(Number(ebookId));
      const loadedQuestions = toArray(response).map(normalizeQuestion).filter((q) => q.id);

      if (loadedQuestions.length > 0) {
        await Promise.all(loadedQuestions.map((q) => api.quiz.delete(Number(q.id))));
      } else {
        const fallbackId = quiz.quiz_id || quiz.id || quiz.ebook_id;
        if (!fallbackId) throw new Error('ID kuis tidak ditemukan');
        await api.quiz.delete(Number(fallbackId));
      }

      setMessage('Kuis berhasil dihapus');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus kuis');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">CRUD Kuis</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Manajemen Kuis</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Buat, edit, dan hapus kuis berdasarkan e-book.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800"
        >
          + Buat Kuis Baru
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div>}

      {formOpen && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">{editingQuiz ? 'Edit Kuis' : 'Tambah Kuis'}</h2>
              <p className="text-sm font-semibold text-slate-500">Isi 5 pertanyaan pilihan ganda.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-black text-slate-800">Pilih E-Book</label>
            <select
              value={selectedEbookId}
              onChange={(e) => setSelectedEbookId(e.target.value)}
              disabled={Boolean(editingQuiz)}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 disabled:bg-slate-100"
            >
              <option value="">Pilih e-book...</option>
              {ebooks.map((ebook) => (
                <option key={ebook.id} value={ebook.id}>
                  {ebook.title} {ebook.author ? `• ${ebook.author}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 space-y-5">
            {questions.map((q, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-black text-slate-950">Pertanyaan {index + 1}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{q.question ? 'Terisi' : 'Kosong'}</span>
                </div>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  placeholder="Tulis pertanyaan"
                  rows={2}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10"
                />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((key, optionIndex) => (
                    <input
                      key={key}
                      value={q[key]}
                      onChange={(e) => updateQuestion(index, key, e.target.value)}
                      placeholder={`Opsi ${String.fromCharCode(65 + optionIndex)}`}
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10"
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <label className="mb-2 block text-sm font-black text-slate-800">Jawaban Benar</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['a', 'b', 'c', 'd'] as const).map((answer) => (
                      <button
                        key={answer}
                        type="button"
                        onClick={() => updateQuestion(index, 'correct_answer', answer)}
                        className={`rounded-xl px-4 py-2 text-sm font-black ${
                          q.correct_answer === answer ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {answer.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500">Progres pertanyaan: {filledCount}/5</p>
            <button
              type="button"
              onClick={submitQuiz}
              disabled={saving}
              className="rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : editingQuiz ? 'Simpan Perubahan' : 'Simpan Kuis'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-black text-slate-950">Kuis yang Dibuat</h2>
        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-500">Memuat data...</p>
          ) : quizzes.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-500">Belum ada kuis yang dibuat.</p>
          ) : (
            quizzes.map((quiz, index) => (
              <div key={`${quiz.ebook_id || quiz.id || index}`} className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-black text-slate-950">{quiz.ebook_title || quiz.title || 'Kuis tanpa judul'}</h3>
                  <p className="text-sm font-semibold text-slate-500">{quiz.question_count || 0} pertanyaan • {quiz.attempt_count || 0} siswa menjawab</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(quiz)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">Edit</button>
                  <button type="button" onClick={() => deleteQuiz(quiz)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function GuruStudentCrud() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState<StudentForm>(defaultStudentForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return students.filter((student) =>
      student.name.toLowerCase().includes(keyword) || student.email.toLowerCase().includes(keyword)
    );
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.dashboard.guruStudents();
      setStudents(toArray(response) as Student[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingStudent(null);
    setStudentForm(defaultStudentForm);
    setError('');
    setMessage('');
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      class_name: student.class_name || '',
      grade_level: '1',
      password: '',
    });
    setError('');
    setMessage('');
    setFormOpen(true);
  };

  const submitStudent = async () => {
    if (!studentForm.name.trim() || !studentForm.email.trim()) {
      setError('Nama dan email harus diisi');
      return;
    }

    if (!editingStudent && studentForm.password.length < 8) {
      setError('Password siswa baru minimal 8 karakter');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      if (editingStudent) {
        const payload: Record<string, unknown> = {
          name: studentForm.name,
          email: studentForm.email,
          class_name: studentForm.class_name,
          role: 'siswa',
        };
        if (studentForm.password) {
          payload.password = studentForm.password;
          payload.password_confirmation = studentForm.password;
        }
        await api.users.update(editingStudent.id, payload);
        setMessage('Data siswa berhasil diperbarui');
      } else {
        await api.users.create({
          name: studentForm.name,
          email: studentForm.email,
          password: studentForm.password,
          password_confirmation: studentForm.password,
          role: 'siswa',
          grade_level: studentForm.grade_level,
          class_name: studentForm.class_name,
        });
        setMessage('Siswa berhasil ditambahkan');
      }

      setFormOpen(false);
      setEditingStudent(null);
      setStudentForm(defaultStudentForm);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data siswa');
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (student: Student) => {
    const confirmed = window.confirm(`Hapus siswa ${student.name}?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await api.users.delete(student.id);
      setMessage('Siswa berhasil dihapus');
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus siswa');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (student: Student) => {
    const newPassword = window.prompt(`Reset password siswa ${student.name}.\nMasukkan password baru (min 6 karakter):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await api.users.resetPassword(student.id, newPassword);
      setMessage(`Password siswa ${student.name} berhasil di-reset`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal reset password siswa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">CRUD Siswa</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Manajemen Siswa</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Tambah, edit, hapus, dan reset password siswa.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800"
        >
          + Tambah Siswa
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div>}

      {formOpen && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">{editingStudent ? 'Edit Siswa' : 'Tambah Siswa'}</h2>
              <p className="text-sm font-semibold text-slate-500">{editingStudent ? 'Ubah data siswa.' : 'Buat akun siswa baru.'}</p>
            </div>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">Tutup</button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormInput label="Nama" value={studentForm.name} onChange={(value) => setStudentForm((current) => ({ ...current, name: value }))} />
            <FormInput label="Email" type="email" value={studentForm.email} onChange={(value) => setStudentForm((current) => ({ ...current, email: value }))} />
            <FormInput label="Nama Kelas" value={studentForm.class_name} onChange={(value) => setStudentForm((current) => ({ ...current, class_name: value }))} placeholder="Contoh: X-A" />
            <div>
              <label className="mb-2 block text-sm font-black text-slate-800">Tingkat Kelas</label>
              <select
                value={studentForm.grade_level}
                onChange={(event) => setStudentForm((current) => ({ ...current, grade_level: event.target.value }))}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10"
              >
                <option value="1">Kelas X</option>
                <option value="2">Kelas XI</option>
                <option value="3">Kelas XII</option>
              </select>
            </div>
            <FormInput
              label={editingStudent ? 'Password Baru (opsional)' : 'Password'}
              type="password"
              value={studentForm.password}
              onChange={(value) => setStudentForm((current) => ({ ...current, password: value }))}
              placeholder={editingStudent ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={submitStudent}
              disabled={saving}
              className="rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black text-slate-950">Daftar Siswa</h2>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari nama/email siswa..."
            className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:max-w-sm"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <p className="py-8 text-center text-sm font-bold text-slate-500">Memuat data...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="py-8 text-center text-sm font-bold text-slate-500">Data siswa belum ada.</p>
          ) : (
            <table className="min-w-[920px] w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-black text-slate-700">Siswa</th>
                  <th className="px-4 py-3 text-center font-black text-slate-700">Poin</th>
                  <th className="px-4 py-3 text-center font-black text-slate-700">Buku</th>
                  <th className="px-4 py-3 text-center font-black text-slate-700">Progress</th>
                  <th className="px-4 py-3 text-center font-black text-slate-700">Kuis Avg</th>
                  <th className="px-4 py-3 text-right font-black text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-black text-slate-950">{student.name}</p>
                      <p className="text-xs font-semibold text-slate-500">{student.email}</p>
                      <p className="text-xs font-bold text-emerald-700">{student.class_name || '-'}</p>
                    </td>
                    <td className="px-4 py-4 text-center font-black text-emerald-700">{student.total_points || 0}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700">{student.books_read || 0}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700">{Math.round(student.reading_progress || 0)}%</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700">{(student.quiz_average_score || 0).toFixed(1)}%</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(student)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">Edit</button>
                        <button type="button" onClick={() => resetPassword(student)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">Reset</button>
                        <button type="button" onClick={() => deleteStudent(student)} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-800">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10"
      />
    </div>
  );
}

export default function GuruCrudOverlay() {
  return (
    <Suspense fallback={null}>
      <GuruCrudOverlayInner />
    </Suspense>
  );
}
