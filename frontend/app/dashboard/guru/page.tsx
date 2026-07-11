'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Activity, BookOpen, CheckCircle2, ClipboardCheck, ClipboardList, Gift, GraduationCap, History, Library, ListChecks, Loader2, Menu, PenLine, Plus, Search, Settings, Trash2, Trophy, Users, X, type LucideIcon } from 'lucide-react';
import styles from '../admin/admin-dashboard.module.css';

type GuruTab = 'beranda' | 'validasi' | 'kuis' | 'siswa' | 'histori' | 'pengaturan';
type AnswerKey = 'a' | 'b' | 'c' | 'd';

type GuruStats = {
  total_siswa?: number;
  total_kuis_dibuat?: number;
  validasi_pending?: number;
  siswa_aktif_hari_ini?: number;
};

type ReadingActivity = {
  id: number;
  user_id?: number;
  ebook_id?: number;
  status?: string;
  current_page?: number;
  final_page?: number;
  duration_minutes?: number;
  notes?: string;
  user?: { id: number; name: string; email?: string; class_name?: string };
  ebook?: { id: number; title: string; author?: string; pages?: number; poin_per_halaman?: number };
};

type Student = {
  id: number;
  name: string;
  email: string;
  class_name?: string;
  grade_level?: string;
  total_points?: number;
  books_read?: number;
  reading_progress?: number;
  quiz_average_score?: number;
  quizzes_passed?: number;
  profile_photo_url?: string;
};

type Ebook = { id: number; title: string; author?: string };
type QuizSummary = { ebook_id?: number; ebook_title?: string; question_count?: number; attempt_count?: number };
type QuestionForm = { question: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: AnswerKey };
type StudentForm = { name: string; email: string; password: string; grade_level: string; class_name: string };

type StudentDetail = Student & { reading_progress?: number; quiz_average_score?: number; quizzes_passed?: number };

const tabs = new Set<GuruTab>(['beranda', 'validasi', 'kuis', 'siswa', 'histori', 'pengaturan']);
const emptyQuestion = (): QuestionForm => ({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' });
const defaultStudentForm: StudentForm = { name: '', email: '', password: '', grade_level: '10', class_name: '' };

function normalizeTab(tab: string | null): GuruTab { return tab && tabs.has(tab as GuruTab) ? (tab as GuruTab) : 'beranda'; }
function record(value: unknown): Record<string, unknown> | null { return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null; }
function arrayOf<T>(payload: unknown): T[] { if (Array.isArray(payload)) return payload as T[]; const r = record(payload); if (!r) return []; if (Array.isArray(r.data)) return r.data as T[]; if (Array.isArray(r.students)) return r.students as T[]; if (Array.isArray(r.questions)) return r.questions as T[]; const d = record(r.data); if (d && Array.isArray(d.data)) return d.data as T[]; if (d && Array.isArray(d.students)) return d.students as T[]; if (d && Array.isArray(d.questions)) return d.questions as T[]; return []; }
function statsOf(payload: unknown): GuruStats { const r = record(payload); if (!r) return {}; const d = record(r.data); return (d || r) as GuruStats; }
function n(value: unknown): number { const parsed = Number(value ?? 0); return Number.isFinite(parsed) ? parsed : 0; }
function fmt(value: unknown): string { return n(value).toLocaleString('id-ID'); }
function errText(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; }
function normalizeClassValue(value?: string | number | null): string { return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ''); }
function isSameClass(left: { grade_level?: string; class_name?: string; class_id?: string | number | null }, right: { grade_level?: string; class_name?: string; class_id?: string | number | null }): boolean {
  if (left.class_id != null && right.class_id != null && String(left.class_id) === String(right.class_id)) return true;
  const leftKey = [normalizeClassValue(left.grade_level), normalizeClassValue(left.class_name)].filter(Boolean).join('|');
  const rightKey = [normalizeClassValue(right.grade_level), normalizeClassValue(right.class_name)].filter(Boolean).join('|');
  return Boolean(leftKey && rightKey && leftKey === rightKey);
}

function LoadingScreen() { return <div className={styles.loading}><div><Loader2 className="mx-auto mb-3 animate-spin text-emerald-700" size={34} />Memuat dashboard guru...</div></div>; }

export default function GuruDashboardPage() {
  return <Suspense fallback={<LoadingScreen />}><GuruDashboardContent /></Suspense>;
}

function GuruDashboardContent() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = normalizeTab(searchParams.get('tab'));
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<GuruStats>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (!loading && (!isAuthenticated || (user?.role !== 'guru' && user?.role !== 'admin'))) router.replace('/login'); }, [loading, isAuthenticated, user?.role, router]);
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'guru' && user?.role !== 'admin')) return;
    let ignore = false;
    async function loadStats() { try { setDataLoading(true); setError(''); const res = await api.dashboard.guruStats(); if (!ignore) setStats(statsOf(res)); } catch (error) { if (!ignore) setError(errText(error, 'Gagal memuat dashboard guru')); } finally { if (!ignore) setDataLoading(false); } }
    loadStats(); return () => { ignore = true; };
  }, [isAuthenticated, user?.role]);

  if (loading || !mounted || (user?.role !== 'guru' && user?.role !== 'admin')) return null;

  return <div className={styles.page}><button type="button" className={styles.mobileMenuButton} onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu size={22} /></button>{sidebarOpen && <button type="button" className={`${styles.backdrop} md:hidden`} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" />}<AdminSidebar activeTab={activeTab} sidebarOpen={sidebarOpen} onTabChange={() => undefined} onCloseSidebar={() => setSidebarOpen(false)} role="guru" user={user} /><main className={styles.content}>{error && <div className={styles.alert}>{error}</div>}{activeTab === 'beranda' && <Overview stats={stats} loading={dataLoading} />}{activeTab === 'validasi' && <ValidasiTab />}{activeTab === 'kuis' && <QuizTab />}{activeTab === 'siswa' && <StudentListTab />}{activeTab === 'histori' && <HistoriTab />}{activeTab === 'pengaturan' && <SettingsTab refreshUser={refreshUser} />}</main></div>;
}

function Overview({ stats, loading }: { stats: GuruStats; loading: boolean }) {
  if (loading) return <LoadingScreen />;
  const totalSiswa = n(stats.total_siswa); const totalKuis = n(stats.total_kuis_dibuat); const pending = n(stats.validasi_pending); const aktif = n(stats.siswa_aktif_hari_ini); const rate = totalSiswa ? Math.min(100, Math.round((aktif / totalSiswa) * 100)) : 0;
  const metrics = [
    { title: 'Total Siswa', value: totalSiswa, desc: 'Siswa dalam pemantauan kelas.', Icon: Users },
    { title: 'Kuis Dibuat', value: totalKuis, desc: 'Materi evaluasi yang sudah dibuat.', Icon: PenLine },
    { title: 'Validasi Pending', value: pending, desc: pending > 0 ? 'Perlu ditinjau hari ini.' : 'Semua aktivitas aman.', Icon: ClipboardCheck },
    { title: 'Aktif Hari Ini', value: aktif, desc: `${rate}% dari total siswa.`, Icon: Activity },
  ];
  const flow = [
    { title: 'Validasi Aktivitas', desc: 'Cek progres baca yang masuk dari siswa.', Icon: CheckCircle2 },
    { title: 'Buat Kuis', desc: 'Tambahkan pertanyaan untuk e-book yang dipilih.', Icon: ListChecks },
    { title: 'Pantau Siswa', desc: 'Lihat poin, progres, dan data kelas.', Icon: GraduationCap },
  ];
  return <div className={styles.stack}><section className={styles.hero} ><div><div className={styles.badge}>Dashboard Guru</div><h1 className={styles.heroTitle}>Pantau literasi kelas dengan lebih cepat.</h1><p className={styles.heroText}>Validasi aktivitas membaca, kelola kuis, dan lihat keterlibatan siswa dari satu ruang kerja yang rapi dan mudah dibaca.</p></div><div className={styles.heroPanel}><div className={styles.heroPanelTop}><div><p className={styles.kicker}>Tingkat Aktif</p><p className={styles.bigNumber}>{rate}%</p></div><div className={styles.accountPill}><p>Total Siswa</p><p>{fmt(totalSiswa)}</p></div></div><div className={styles.heroMiniGrid}><div className={styles.heroMiniCard}><p>Aktif Hari Ini</p><p>{fmt(aktif)}</p></div><div className={styles.heroMiniCard}><p>Pending</p><p>{fmt(pending)}</p></div></div></div></section><section className={styles.metricGrid}>{metrics.map((m) => <Metric key={m.title} {...m} />)}</section><section className={styles.twoColumn}><div className={styles.panel}><PanelHeader eyebrow="Alur Kerja" title="Fokus hari ini" Icon={ClipboardList} /><div className={styles.todayGrid}>{flow.map((item) => <Priority key={item.title} title={item.title} desc={item.desc} Icon={item.Icon} />)}</div></div><div className={styles.panel}><PanelHeader eyebrow="Prioritas" title="Validasi" Icon={ClipboardCheck} />{pending > 0 ? <div className={styles.leaderItem}><span className={styles.rank}>{pending}</span><div><p className={styles.leaderName}>Aktivitas menunggu validasi</p><p className={styles.leaderEmail}>Buka menu Validasi Pembacaan untuk meninjau.</p></div></div> : <Empty text="Semua aktivitas sudah divalidasi." />}</div></section></div>;
}

function Metric({ title, value, desc, Icon }: { title: string; value: number; desc: string; Icon: LucideIcon }) { return <article className={styles.metricCard}><span className={`${styles.iconBox} ${styles.metricIcon}`}><Icon size={21} /></span><p className={styles.metricLabel}>{title}</p><p className={styles.metricValue}>{fmt(value)}</p><p className={styles.metricHelp}>{desc}</p></article>; }
function PanelHeader({ eyebrow, title, Icon }: { eyebrow: string; title: string; Icon: LucideIcon }) { return <div className={styles.panelHeader}><div><p className={styles.panelEyebrow}>{eyebrow}</p><h2 className={styles.panelTitle}>{title}</h2></div><span className={styles.iconBox}><Icon size={22} /></span></div>; }
function Priority({ Icon, title, desc }: { Icon: LucideIcon; title: string; desc: string }) { return <article className={styles.priorityCard}><span className={styles.iconBox}><Icon size={21} /></span><h3>{title}</h3><p>{desc}</p></article>; }
function SectionHeader({ eyebrow, title, desc, Icon }: { eyebrow: string; title: string; desc: string; Icon: LucideIcon }) { return <div className={styles.sectionHeader}><div><p className={styles.sectionEyebrow}>{eyebrow}</p><h1 className={styles.sectionTitle}>{title}</h1><p className={styles.sectionDescription}>{desc}</p></div><span className={styles.iconBox}><Icon size={24} /></span></div>; }
function Empty({ text }: { text: string }) { return <div className={styles.empty}>{text}</div>; }
function ErrorBox({ message }: { message: string }) { return message ? <div className={styles.alert}>{message}</div> : null; }
function SuccessBox({ message }: { message: string }) { return message ? <div className={styles.success}>{message}</div> : null; }
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <div className={styles.searchWrap}><Search className={styles.searchIcon} size={18} /><input className={`${styles.input} ${styles.searchInput}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>; }
function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) { return <label className={`${styles.field} ${full ? styles.fieldFull : ''}`}><span className={styles.label}>{label}</span>{children}</label>; }
function FormBox({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className={styles.formBox}><div className={styles.formHeader}><h2 className={styles.formTitle}>{title}</h2><button type="button" className={styles.closeButton} onClick={onClose}><X size={18} /></button></div>{children}</div>; }
function FormActions({ saving, onCancel, label = 'Simpan' }: { saving: boolean; onCancel: () => void; label?: string }) { return <div className={styles.formActions}><button type="button" className={styles.secondaryButton} onClick={onCancel}>Batal</button><button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : null}{label}</button></div>; }

function ValidasiTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<ReadingActivity[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [selected, setSelected] = useState<ReadingActivity | null>(null); const [rejectNote, setRejectNote] = useState(''); const [processing, setProcessing] = useState(false);
  const assignedGradeLevel = (user as { grade_level?: string } | undefined)?.grade_level?.trim() || '';
  const assignedClassName = user?.class_name?.trim() || '';
  const assignedClassId = (user as { class_id?: string | number } | undefined)?.class_id;
  async function load() { try { setLoading(true); setError(''); setItems(arrayOf<ReadingActivity>(await api.validations.getPending())); } catch (error) { setError(errText(error, 'Gagal memuat validasi')); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function approve(id: number) { try { setProcessing(true); await api.validations.approve(id); setSelected(null); await load(); } catch (error) { setError(errText(error, 'Gagal approve aktivitas')); } finally { setProcessing(false); } }
  async function reject(id: number) { if (!rejectNote.trim()) return setError('Alasan penolakan harus diisi'); try { setProcessing(true); await api.validations.reject(id, rejectNote.trim()); setSelected(null); setRejectNote(''); await load(); } catch (error) { setError(errText(error, 'Gagal reject aktivitas')); } finally { setProcessing(false); } }
  const visibleItems = useMemo(() => items.filter((activity) => {
    if (!assignedClassName && !assignedGradeLevel && assignedClassId == null) return true;
    return isSameClass(
      { grade_level: assignedGradeLevel, class_name: assignedClassName, class_id: assignedClassId },
      { grade_level: undefined, class_name: activity.user?.class_name, class_id: (activity.user as { class_id?: string | number } | undefined)?.class_id },
    );
  }), [items, assignedClassName, assignedGradeLevel, assignedClassId]);
  return <div><SectionHeader eyebrow="Validasi Pembacaan" title="Aktivitas siswa pending" desc="Tinjau progres membaca siswa sebelum poin diberikan." Icon={ClipboardCheck} /><div className={styles.managementShell}><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat validasi...</div> : visibleItems.length === 0 ? <Empty text="Semua aktivitas sudah divalidasi." /> : <div className={styles.leaderList}>{visibleItems.map((a) => <button key={a.id} type="button" className={styles.leaderItem} onClick={() => setSelected(a)}><div className="min-w-0 text-left"><p className={styles.leaderName}>{a.ebook?.title || 'E-Book'}</p><p className={styles.leaderEmail}>{a.user?.name || 'Siswa'} • {a.user?.class_name || 'Tanpa kelas'}</p><p className={styles.mutedText}>Halaman {fmt(a.current_page)} / {fmt(a.ebook?.pages)} • {fmt(a.duration_minutes)} menit</p></div><span className={styles.statusBadge}>Pending</span></button>)}</div>}</div>{selected && <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4" onClick={(e) => { if (e.currentTarget === e.target) setSelected(null); }}><div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"><div className={styles.formHeader}><div><p className={styles.sectionEyebrow}>Detail Validasi</p><h2 className={styles.formTitle}>{selected.ebook?.title || 'Aktivitas Membaca'}</h2></div><button className={styles.closeButton} onClick={() => setSelected(null)}><X size={18} /></button></div><div className={styles.formGrid}><Info label="Siswa" value={`${selected.user?.name || '-'} (${selected.user?.class_name || '-'})`} /><Info label="Halaman" value={`${fmt(selected.final_page || selected.current_page)} / ${fmt(selected.ebook?.pages)}`} /><Info label="Durasi" value={`${fmt(selected.duration_minutes)} menit`} /><Info label="Status" value={selected.status || 'pending'} /><Field label="Catatan Siswa" full><textarea className={styles.textarea} value={selected.notes || '-'} readOnly /></Field><Field label="Alasan penolakan" full><textarea className={styles.textarea} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Isi jika aktivitas ditolak" /></Field></div><div className={styles.formActions}><button className={styles.dangerButton} disabled={processing} onClick={() => reject(selected.id)}>Tolak</button><button className={styles.primaryButton} disabled={processing} onClick={() => approve(selected.id)}>Approve</button></div></div></div>}</div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className={styles.todayCard}><p>{label}</p><p className="!text-lg">{value}</p></div>; }

function QuizTab() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]); const [quizzes, setQuizzes] = useState<QuizSummary[]>([]); const [selectedBook, setSelectedBook] = useState<Ebook | null>(null); const [questions, setQuestions] = useState<QuestionForm[]>(Array.from({ length: 5 }, emptyQuestion)); const [loading, setLoading] = useState(true); const [formOpen, setFormOpen] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  async function load() { try { setLoading(true); setError(''); const [booksRes, quizRes] = await Promise.all([api.ebooks.list(), api.dashboard.guruQuizzes()]); setEbooks(arrayOf<Ebook>(booksRes)); setQuizzes(arrayOf<QuizSummary>(quizRes)); } catch (error) { setError(errText(error, 'Gagal memuat kuis')); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  function changeQuestion(index: number, key: keyof QuestionForm, value: string) { setQuestions((current) => current.map((q, i) => i === index ? { ...q, [key]: key === 'correct_answer' ? value as AnswerKey : value } : q)); }
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); setSuccess(''); if (!selectedBook) return setError('Pilih e-book terlebih dahulu'); if (!questions.every((q) => q.question && q.option_a && q.option_b && q.option_c && q.option_d)) return setError('Semua pertanyaan dan opsi wajib diisi'); try { setSaving(true); await api.quiz.create({ ebook_id: selectedBook.id, questions }); setSuccess('Kuis berhasil disimpan'); setQuestions(Array.from({ length: 5 }, emptyQuestion)); setSelectedBook(null); setFormOpen(false); await load(); } catch (error) { setError(errText(error, 'Gagal menyimpan kuis')); } finally { setSaving(false); } }
  const filled = questions.filter((q) => q.question.trim()).length;
  return <div><SectionHeader eyebrow="Manajemen Kuis" title="Kelola Kuis" desc="Buat 5 pertanyaan pilihan ganda untuk setiap e-book." Icon={PenLine} /><div className={styles.managementShell}><ErrorBox message={error} /><SuccessBox message={success} /><div className={styles.toolbar}><div /><button className={styles.primaryButton} onClick={() => setFormOpen((v) => !v)}>{formOpen ? 'Lihat Daftar Kuis' : <><Plus size={18} />Buat Kuis Baru</>}</button></div>{formOpen ? <FormBox title="Buat Kuis" onClose={() => setFormOpen(false)}><form onSubmit={submit}><div className={styles.formGrid}><Field label="Pilih E-Book" full><select className={styles.select} value={selectedBook?.id || ''} onChange={(e) => setSelectedBook(ebooks.find((b) => b.id === Number(e.target.value)) || null)}><option value="">Pilih e-book...</option>{ebooks.map((b) => <option key={b.id} value={b.id}>{b.title} • {b.author || '-'}</option>)}</select></Field></div><p className={styles.metricHelp}>Progres pertanyaan: {filled}/5</p><div className="space-y-4">{questions.map((q, index) => <div key={index} className={styles.profileCard}><h3 className={styles.itemTitle}>Pertanyaan {index + 1}</h3><div className={styles.formGrid}><Field label="Pertanyaan" full><textarea className={styles.textarea} value={q.question} onChange={(e) => changeQuestion(index, 'question', e.target.value)} /></Field>{(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((key, optionIndex) => <Field key={key} label={`Opsi ${String.fromCharCode(65 + optionIndex)}`}><input className={styles.input} value={q[key]} onChange={(e) => changeQuestion(index, key, e.target.value)} /></Field>)}<Field label="Jawaban Benar"><select className={styles.select} value={q.correct_answer} onChange={(e) => changeQuestion(index, 'correct_answer', e.target.value)}><option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option></select></Field></div></div>)}</div><FormActions saving={saving} onCancel={() => setFormOpen(false)} label="Simpan Kuis" /></form></FormBox> : loading ? <div className={styles.loading}>Memuat daftar kuis...</div> : quizzes.length === 0 ? <Empty text="Belum ada kuis yang dibuat." /> : <div className={styles.leaderList}>{quizzes.map((quiz, index) => <div key={`quiz-${index}-${quiz.ebook_id ?? 'none'}`} className={styles.leaderItem}><div><p className={styles.leaderName}>{quiz.ebook_title || 'E-Book'}</p><p className={styles.leaderEmail}>{fmt(quiz.question_count)} pertanyaan</p></div><div><p className={styles.pointsText}>{fmt(quiz.attempt_count)}</p><p className={styles.mutedText}>attempt</p></div></div>)}</div>}</div></div>;
}

function StudentListTab() {
  const { user } = useAuth();
  const assignedGradeLevel = (user as { grade_level?: string } | undefined)?.grade_level?.trim() || '';
  const assignedClassName = user?.class_name?.trim() || '';
  const assignedClassId = (user as { class_id?: string | number } | undefined)?.class_id;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      setStudents(arrayOf<Student>(await api.dashboard.guruStudents()));
    } catch (error) {
      setError(errText(error, 'Gagal memuat siswa'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesQuery = !normalizedQuery || `${student.name} ${student.email} ${student.class_name ?? ''}`.toLowerCase().includes(normalizedQuery);
      const matchesClass = !assignedClassName && !assignedGradeLevel && assignedClassId == null
        ? true
        : isSameClass(
            { grade_level: assignedGradeLevel, class_name: assignedClassName, class_id: assignedClassId },
            { grade_level: student.grade_level, class_name: student.class_name, class_id: (student as Student & { class_id?: string | number }).class_id },
          );
      return matchesQuery && matchesClass;
    });
  }, [students, query, assignedClassName, assignedGradeLevel, assignedClassId]);

  return <div>
    <SectionHeader eyebrow="Daftar Murid" title="Daftar Murid" desc="Lihat daftar murid yang terdaftar pada kelas Anda." Icon={Users} />
    <div className={styles.managementShell}>
      <ErrorBox message={error} />
      <SuccessBox message={success} />
      <div className={styles.toolbar}>
        <SearchBox value={query} onChange={setQuery} placeholder="Cari murid..." />
      </div>
      {loading ? <div className={styles.loading}>Memuat murid...</div> : filtered.length === 0 ? <Empty text="Murid belum ditemukan." /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email</th><th>Kelas</th><th>Poin</th><th>Buku</th></tr></thead><tbody>{filtered.map((s) => <tr key={s.id}><td><div className={styles.avatarCell}><span className={styles.avatar}>{s.profile_photo_url ? <img src={s.profile_photo_url} alt={s.name} /> : s.name.charAt(0).toUpperCase()}</span>{s.name}</div></td><td>{s.email}</td><td>{s.class_name || '-'}</td><td>{fmt(s.total_points)}</td><td>{fmt(s.books_read)}</td></tr>)}</tbody></table></div>}
    </div>
  </div>;

}

function SettingsTab({ refreshUser }: { refreshUser: () => Promise<void> }) {
  const { user } = useAuth(); const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', avatar: null as File | null }); const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' }); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [saving, setSaving] = useState(false);
  async function saveProfile(e: FormEvent) { e.preventDefault(); const fd = new FormData(); fd.append('name', profile.name); fd.append('email', profile.email); if (profile.avatar) fd.append('avatar', profile.avatar); try { setSaving(true); setError(''); setSuccess(''); await api.me.updateProfile(fd); await refreshUser(); setSuccess('Profil berhasil diperbarui'); } catch (error) { setError(errText(error, 'Gagal update profil')); } finally { setSaving(false); } }
  async function savePassword(e: FormEvent) { e.preventDefault(); if (password.password !== password.password_confirmation) return setError('Konfirmasi password tidak cocok'); try { setSaving(true); setError(''); setSuccess(''); await api.me.updateProfile(password); setPassword({ current_password: '', password: '', password_confirmation: '' }); setSuccess('Password berhasil diperbarui'); } catch (error) { setError(errText(error, 'Gagal update password')); } finally { setSaving(false); } }
  return <div><SectionHeader eyebrow="Pengaturan" title="Pengaturan Profil Guru" desc="Perbarui profil dan password akun guru." Icon={Settings} /><ErrorBox message={error} /><SuccessBox message={success} /><div className={styles.profileGrid}><div className={styles.profileCard}><h2 className={styles.profileTitle}>Informasi Profil</h2><p className={styles.profileSubtitle}>Data guru yang sedang login.</p><form onSubmit={saveProfile} className="mt-4 space-y-4"><div className={styles.avatarPreviewRow}><div className={styles.avatarPreview}>{profile.avatar ? <img src={URL.createObjectURL(profile.avatar)} alt="Preview" /> : user?.profile_photo_url ? <img src={user.profile_photo_url} alt={user.name} /> : user?.name?.charAt(0).toUpperCase()}</div><Field label="Foto Profil"><input className={styles.fileInput} type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, avatar: e.target.files?.[0] || null })} /></Field></div><Field label="Nama"><input className={styles.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field><Field label="Email"><input className={styles.input} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field><div className={styles.formActions}><button className={styles.primaryButton} disabled={saving}>Simpan Profil</button></div></form></div><div className={styles.profileCard}><h2 className={styles.profileTitle}>Ubah Password</h2><p className={styles.profileSubtitle}>Gunakan password yang aman.</p><form onSubmit={savePassword} className="mt-4 space-y-4"><Field label="Password Saat Ini"><input className={styles.input} type="password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} /></Field><Field label="Password Baru"><input className={styles.input} type="password" value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} /></Field><Field label="Konfirmasi Password Baru"><input className={styles.input} type="password" value={password.password_confirmation} onChange={(e) => setPassword({ ...password, password_confirmation: e.target.value })} /></Field><div className={styles.formActions}><button className={styles.primaryButton} disabled={saving}>Ubah Password</button></div></form></div></div></div>;
}

// ─── HistoriTab Guru ──────────────────────────────────────────────────────────

type GuruValidationItem = {
  id: number;
  status: 'approved' | 'rejected';
  validated_at: string;
  notes?: string;
  reading_activity?: {
    id: number;
    status: string;
    current_page?: number;
    final_page?: number;
    duration_minutes?: number;
    user?: { id: number; name: string; email?: string; class_name?: string; grade_level?: string };
    ebook?: { id: number; title: string; author?: string; pages?: number; poin_per_halaman?: number };
  };
};

type GuruHistoryStats = {
  total_approved: number;
  total_rejected: number;
  this_month: number;
  total_points_awarded: number;
};

function HistoriTab() {
  const [items, setItems] = useState<GuruValidationItem[]>([]);
  const [stats, setStats] = useState<GuruHistoryStats>({ total_approved: 0, total_rejected: 0, this_month: 0, total_points_awarded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  async function load(p = 1) {
    try {
      setLoading(true);
      setError('');
      const res = await api.dashboard.guruHistory() as any;
      setItems(arrayOf<GuruValidationItem>(res));
      if (res?.stats) setStats(res.stats);
      if (res?.pagination) {
        setLastPage(res.pagination.last_page ?? 1);
        setPage(res.pagination.current_page ?? 1);
      }
    } catch (e) {
      setError(errText(e, 'Gagal memuat histori validasi'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchStatus = filter === 'all' || item.status === filter;
      const matchQuery = !q || [
        item.reading_activity?.ebook?.title,
        item.reading_activity?.user?.name,
        item.reading_activity?.user?.class_name,
        item.notes,
      ].some((v) => v?.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [items, filter, query]);

  const statCards = [
    { label: 'Total Disetujui', value: fmt(stats.total_approved), cls: 'text-emerald-700' },
    { label: 'Total Ditolak', value: fmt(stats.total_rejected), cls: 'text-red-600' },
    { label: 'Bulan Ini', value: fmt(stats.this_month), cls: 'text-blue-700' },
    { label: 'Poin Diberikan', value: fmt(stats.total_points_awarded), cls: 'text-amber-700' },
  ];

  return (
    <div>
      <SectionHeader eyebrow="Histori" title="Histori Validasi" desc="Rekam jejak seluruh aktivitas validasi yang sudah kamu lakukan." Icon={Trophy} />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.managementShell}>
        <ErrorBox message={error} />

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <SearchBox value={query} onChange={setQuery} placeholder="Cari siswa atau buku..." />
          <div className="flex gap-2">
            {(['all', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${filter === f ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {f === 'all' ? 'Semua' : f === 'approved' ? '✓ Disetujui' : '✗ Ditolak'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Memuat histori...</div>
        ) : filtered.length === 0 ? (
          <Empty text="Belum ada histori validasi." />
        ) : (
          <div className={styles.leaderList}>
            {filtered.map((item) => {
              const isApproved = item.status === 'approved';
              const activity = item.reading_activity;
              return (
                <div key={item.id} className={styles.leaderItem}>
                  <div className="min-w-0 flex-1">
                    <p className={styles.leaderName}>{activity?.ebook?.title || 'E-Book'}</p>
                    <p className={styles.leaderEmail}>
                      {activity?.user?.name || '-'} • {activity?.user?.class_name || 'Tanpa kelas'}
                    </p>
                    <p className={styles.mutedText}>
                      Hal {fmt(activity?.final_page || activity?.current_page)} / {fmt(activity?.ebook?.pages)} •{' '}
                      {fmt(activity?.duration_minutes)} menit •{' '}
                      {new Date(item.validated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {item.notes && (
                      <p className="mt-1 text-xs italic text-slate-400">&ldquo;{item.notes}&rdquo;</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {isApproved ? '✓ Disetujui' : '✗ Ditolak'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className={`${styles.secondaryButton} disabled:opacity-40`}>← Prev</button>
            <span className="flex items-center px-3 text-sm font-black text-slate-600">{page} / {lastPage}</span>
            <button disabled={page >= lastPage} onClick={() => load(page + 1)} className={`${styles.secondaryButton} disabled:opacity-40`}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
