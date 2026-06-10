'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { normalizeFileUrl } from '@/lib/file-url';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Gift,
  GraduationCap,
  Library,
  ListChecks,
  Loader2,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

interface AdminStats {
  total_siswa?: number;
  total_guru?: number;
  total_ebook?: number;
  total_ebooks?: number;
  total_books?: number;
  total_reward?: number;
  total_rewards?: number;
  siswa_aktif_hari_ini?: number;
  buku_dibaca_hari_ini?: number;
  kuis_dikerjakan_hari_ini?: number;
  reward_diklaim_hari_ini?: number;
}

interface Ebook {
  id: number;
  title: string;
  author?: string;
  pages?: number;
  category?: string;
  grade_level?: string;
  is_active?: boolean | number;
  poin_per_halaman?: number;
  cover_image?: string;
  cover_url?: string;
  pdf_file?: string;
  pdf_url?: string;
}

interface Reward {
  id: number;
  name: string;
  description?: string;
  points_required?: number;
  stock?: number;
  is_active?: boolean | number;
  image?: string;
  icon?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  class_name?: string;
  profile_photo_url?: string;
}

interface TopStudent {
  id: number;
  name: string;
  email: string;
  total_points?: number;
}

type AdminTab = 'beranda' | 'ebooks' | 'rewards' | 'users' | 'pengaturan';
type Tone = 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'slate';

const adminTabs = new Set<AdminTab>(['beranda', 'ebooks', 'rewards', 'users', 'pengaturan']);

function normalizeAdminTab(tab: string | null): AdminTab {
  return tab && adminTabs.has(tab as AdminTab) ? (tab as AdminTab) : 'beranda';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];

  const record = asRecord(response);
  if (!record) return [];

  if (Array.isArray(record.data)) return record.data as T[];
  if (Array.isArray(record.items)) return record.items as T[];

  const dataRecord = asRecord(record.data);
  if (dataRecord) {
    if (Array.isArray(dataRecord.data)) return dataRecord.data as T[];
    if (Array.isArray(dataRecord.items)) return dataRecord.items as T[];
    if (Array.isArray(dataRecord.results)) return dataRecord.results as T[];
  }

  return [];
}

function extractObject<T extends Record<string, unknown>>(response: unknown): Partial<T> {
  const record = asRecord(response);
  if (!record) return {};

  const dataRecord = asRecord(record.data);
  if (dataRecord) return dataRecord as Partial<T>;

  return record as Partial<T>;
}

function toNumber(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatNumber(value: unknown): string {
  return toNumber(value).toLocaleString('id-ID');
}

function isActive(value: boolean | number | undefined): boolean {
  return value === undefined || value === true || value === 1;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function AdminDashboardFallback() {
  return (
    <div className="grid min-h-[520px] place-items-center bg-slate-50">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-700" aria-hidden="true" />
        <p className="mt-4 text-sm font-black text-slate-700">Memuat dashboard admin...</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardFallback />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = normalizeAdminTab(searchParams.get('tab'));

  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats>({});
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        setError('');

        const [statsResponse, topStudentsResponse] = await Promise.all([
          api.dashboard.adminStats(),
          api.dashboard.adminTopStudents(),
        ]);

        if (cancelled) return;

        setStats(extractObject<AdminStats>(statsResponse) as AdminStats);
        setTopStudents(extractArray<TopStudent>(topStudentsResponse));
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Gagal memuat ringkasan dashboard'));
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.role]);

  if (loading || !mounted || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] w-full overflow-hidden rounded-none bg-slate-50 md:rounded-3xl md:border md:border-slate-200 md:bg-white md:shadow-sm">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-20 z-40 grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg transition hover:bg-emerald-800 md:hidden"
        aria-label="Buka menu admin"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 top-14 z-30 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu admin"
        />
      )}

      <AdminSidebar
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onTabChange={() => undefined}
        onCloseSidebar={() => setSidebarOpen(false)}
        role="admin"
        user={user}
      />

      <main className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {activeTab === 'beranda' && (
            <AdminOverviewDashboard stats={stats} topStudents={topStudents} dataLoading={dataLoading} />
          )}
          {activeTab === 'ebooks' && <EbookManagementTab />}
          {activeTab === 'rewards' && <RewardManagementTab />}
          {activeTab === 'users' && <UserManagementTab />}
          {activeTab === 'pengaturan' && <ProfileSettings />}
        </div>
      </main>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">{description}</p>
      </div>
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Icon size={26} aria-hidden="true" />
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="text-base font-black text-slate-800">{title}</p>
      <p className="mt-2 text-sm font-medium text-slate-500">{description}</p>
    </div>
  );
}

function LoadingBlock({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-9 w-9 animate-spin text-emerald-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-black text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function AdminOverviewDashboard({
  stats,
  topStudents,
  dataLoading,
}: {
  stats: AdminStats;
  topStudents: TopStudent[];
  dataLoading: boolean;
}) {
  if (dataLoading) {
    return <LoadingBlock label="Memuat ringkasan dashboard admin..." />;
  }

  const totalSiswa = toNumber(stats.total_siswa);
  const totalGuru = toNumber(stats.total_guru);
  const totalEbook = toNumber(stats.total_ebook ?? stats.total_ebooks ?? stats.total_books);
  const totalReward = toNumber(stats.total_reward ?? stats.total_rewards);
  const todayActive = toNumber(stats.siswa_aktif_hari_ini);
  const todayBooks = toNumber(stats.buku_dibaca_hari_ini);
  const todayQuizzes = toNumber(stats.kuis_dikerjakan_hari_ini);
  const todayRewards = toNumber(stats.reward_diklaim_hari_ini);
  const todayTotal = todayActive + todayBooks + todayQuizzes + todayRewards;
  const totalUsers = totalSiswa + totalGuru;

  const metricCards = [
    { title: 'Total Siswa', value: totalSiswa, helper: 'Akun siswa yang terdaftar di sistem READPOINT.', Icon: GraduationCap, tone: 'emerald' as Tone },
    { title: 'Total Guru', value: totalGuru, helper: 'Guru yang bisa memantau aktivitas dan validasi siswa.', Icon: Users, tone: 'blue' as Tone },
    { title: 'Total E-Book', value: totalEbook, helper: 'Koleksi bacaan digital yang tersedia untuk siswa.', Icon: BookOpen, tone: 'violet' as Tone },
    { title: 'Total Reward', value: totalReward, helper: 'Hadiah aktif yang bisa ditukar menggunakan poin.', Icon: Gift, tone: 'amber' as Tone },
  ];

  const todayCards = [
    { title: 'Siswa Aktif', value: todayActive, helper: 'Siswa yang beraktivitas hari ini.', Icon: Activity },
    { title: 'Buku Dibaca', value: todayBooks, helper: 'Aktivitas membaca yang masuk hari ini.', Icon: Library },
    { title: 'Kuis Dikerjakan', value: todayQuizzes, helper: 'Attempt kuis yang diselesaikan hari ini.', Icon: ListChecks },
    { title: 'Reward Diklaim', value: todayRewards, helper: 'Penukaran reward yang diproses hari ini.', Icon: PackageCheck },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles size={16} aria-hidden="true" />
              Dashboard Admin
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-white lg:text-5xl">
              Panel kontrol READPOINT yang lebih rapi dan siap dipakai.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-300 lg:text-base">
              Pantau siswa, guru, e-book, reward, dan aktivitas harian dari satu tempat. Data ringkasan tetap aman meskipun API mengembalikan format array langsung atau format wrapper.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Aktivitas Hari Ini</p>
                <p className="mt-2 text-4xl font-black leading-none text-white">{formatNumber(todayTotal)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">Total akun</p>
                <p className="mt-1 text-lg font-black text-white">{formatNumber(totalUsers)}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {todayCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">{card.title}</p>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-200">
                      <card.Icon size={16} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black leading-none text-white">{formatNumber(card.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <AdminMetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Monitoring</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Aktivitas hari ini</h2>
            </div>
            <Activity className="h-8 w-8 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {todayCards.map((card) => (
              <AdminTodayCard key={card.title} {...card} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Leaderboard</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Siswa teratas</h2>
            </div>
            <Trophy className="h-8 w-8 text-amber-500" aria-hidden="true" />
          </div>

          <div className="mt-5 space-y-3">
            {topStudents.length > 0 ? (
              topStudents.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{student.name}</p>
                      <p className="truncate text-xs font-semibold text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-700">{formatNumber(student.total_points)}</p>
                    <p className="text-[11px] font-bold text-slate-500">poin</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Belum ada data siswa" description="Leaderboard akan muncul setelah siswa mulai mengumpulkan poin." />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminPriorityCard Icon={BookOpen} title="Koleksi Buku" description="Pastikan cover, PDF, kategori, dan poin baca lengkap sebelum dipublikasikan." />
        <AdminPriorityCard Icon={Gift} title="Reward Sekolah" description="Pantau stok hadiah agar penukaran siswa tetap lancar." />
        <AdminPriorityCard Icon={ClipboardList} title="Data Pengguna" description="Rapikan akun siswa, guru, dan admin sesuai kelas serta perannya." />
      </section>
    </div>
  );
}

function AdminMetricCard({
  title,
  value,
  helper,
  Icon,
  tone,
}: {
  title: string;
  value: number;
  helper: string;
  Icon: LucideIcon;
  tone: Tone;
}) {
  const toneClass: Record<Tone, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return (
    <article className="relative min-h-[190px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl ring-1 ${toneClass[tone]}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="pr-16">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{title}</p>
        <p className="mt-3 text-4xl font-black leading-none text-slate-950">{formatNumber(value)}</p>
      </div>
      <p className="mt-5 text-sm font-medium leading-6 text-slate-500">{helper}</p>
    </article>
  );
}

function AdminTodayCard({ title, value, helper, Icon }: { title: string; value: number; helper: string; Icon: LucideIcon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{formatNumber(value)}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 ring-1 ring-slate-200">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{helper}</p>
    </article>
  );
}

function AdminPriorityCard({ Icon, title, description }: { Icon: LucideIcon; title: string; description: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</div>;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}>
      <CheckCircle2 size={13} aria-hidden="true" />
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

function EbookManagementTab() {
  const [data, setData] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.ebooks.list();
      setData(extractArray<Ebook>(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data e-book'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return data;
    return data.filter((item) =>
      `${item.title} ${item.author ?? ''} ${item.category ?? ''}`.toLowerCase().includes(keyword)
    );
  }, [data, searchTerm]);

  const openCreateForm = () => {
    setEditingEbook(null);
    setShowForm(true);
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus e-book ini?')) return;

    try {
      setError('');
      await api.ebooks.delete(id);
      await fetchEbooks();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus e-book'));
    }
  };

  const handleSuccess = async () => {
    setShowForm(false);
    setEditingEbook(null);
    await fetchEbooks();
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Manajemen Konten"
        title="Kelola E-Book"
        description="Tambah, ubah, cari, dan hapus koleksi bacaan digital yang akan digunakan siswa. Tampilan kartu dibuat lebih rapi agar cover dan PDF mudah dicek."
        Icon={BookOpen}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {showForm && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Form E-Book</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{editingEbook ? 'Edit E-Book' : 'Tambah E-Book Baru'}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEbook(null);
                }}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200 transition hover:text-red-600"
                aria-label="Tutup form e-book"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <EbookForm editingEbook={editingEbook} onSuccess={handleSuccess} onCancel={() => { setShowForm(false); setEditingEbook(null); }} />
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Cari judul, pengarang, atau kategori e-book..." />
          {!showForm && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800"
            >
              <Plus size={18} aria-hidden="true" />
              Tambah E-Book
            </button>
          )}
        </div>

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingBlock />
        ) : filteredData.length === 0 ? (
          <EmptyState title="E-book belum ditemukan" description="Tambah e-book baru atau ubah kata kunci pencarian." />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((ebook) => {
              const coverUrl = ebook.cover_image || ebook.cover_url;
              const pdfUrl = ebook.pdf_file || ebook.pdf_url;

              return (
                <article key={ebook.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex gap-4 p-4">
                    <div className="shrink-0">
                      {coverUrl ? (
                        <img
                          src={normalizeFileUrl(coverUrl)}
                          alt={ebook.title}
                          className="h-32 w-24 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="grid h-32 w-24 place-items-center rounded-2xl bg-white text-3xl ring-1 ring-slate-200">📚</div>
                      )}
                      {pdfUrl && (
                        <a
                          href={normalizeFileUrl(pdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                        >
                          Lihat PDF
                        </a>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950">{ebook.title}</h3>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{ebook.author || 'Tanpa pengarang'}</p>
                        </div>
                        <StatusBadge active={isActive(ebook.is_active)} />
                      </div>

                      <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600">
                        <p>{formatNumber(ebook.pages)} halaman</p>
                        <p>Kategori: {ebook.category || '-'}</p>
                        <p>Poin/halaman: {formatNumber(ebook.poin_per_halaman)}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(ebook)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(ebook.id)} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-100">
                          <Trash2 size={13} aria-hidden="true" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EbookForm({
  onSuccess,
  editingEbook,
  onCancel,
}: {
  onSuccess: () => void | Promise<void>;
  editingEbook: Ebook | null;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: 100,
    category: '',
    poin_per_halaman: 5,
    grade_level: '10',
    pdf_file: null as File | null,
    cover_image: null as File | null,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingEbook) return;
    setFormData({
      title: editingEbook.title || '',
      author: editingEbook.author || '',
      pages: toNumber(editingEbook.pages) || 1,
      category: editingEbook.category || '',
      poin_per_halaman: toNumber(editingEbook.poin_per_halaman) || 5,
      grade_level: editingEbook.grade_level || '10',
      pdf_file: null,
      cover_image: null,
    });
  }, [editingEbook]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, field: 'pdf_file' | 'cover_image') => {
    setFormData((current) => ({ ...current, [field]: event.target.files?.[0] || null }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.category.trim()) {
      setError('Judul, pengarang, dan kategori harus diisi');
      return;
    }

    if (!editingEbook && !formData.pdf_file) {
      setError('PDF wajib diupload untuk e-book baru');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('author', formData.author.trim());
    payload.append('pages', String(formData.pages));
    payload.append('category', formData.category.trim());
    payload.append('poin_per_halaman', String(formData.poin_per_halaman));
    payload.append('grade_level', formData.grade_level);

    if (formData.pdf_file) payload.append('pdf_file', formData.pdf_file);
    if (formData.cover_image) payload.append('cover_image', formData.cover_image);

    try {
      setSubmitting(true);
      if (editingEbook) {
        await api.ebooks.update(editingEbook.id, payload);
      } else {
        await api.ebooks.create(payload);
      }
      await onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan e-book'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Judul Buku *">
          <input type="text" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} className="form-input" placeholder="Contoh: Laskar Pelangi" required />
        </Field>
        <Field label="Pengarang *">
          <input type="text" value={formData.author} onChange={(event) => setFormData({ ...formData, author: event.target.value })} className="form-input" placeholder="Nama pengarang" required />
        </Field>
        <Field label="Total Halaman *">
          <input type="number" value={formData.pages} min={1} onChange={(event) => setFormData({ ...formData, pages: Number(event.target.value) || 1 })} className="form-input" required />
        </Field>
        <Field label="Kategori *">
          <input type="text" value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} className="form-input" placeholder="Novel, Fiksi, Pengetahuan" required />
        </Field>
        <Field label="Poin per Halaman *">
          <input type="number" value={formData.poin_per_halaman} min={1} onChange={(event) => setFormData({ ...formData, poin_per_halaman: Number(event.target.value) || 1 })} className="form-input" required />
        </Field>
        <Field label="Tingkat/Kelas">
          <select value={formData.grade_level} onChange={(event) => setFormData({ ...formData, grade_level: event.target.value })} className="form-input">
            <option value="10">Kelas 10</option>
            <option value="11">Kelas 11</option>
            <option value="12">Kelas 12</option>
            <option value="umum">Umum</option>
          </select>
        </Field>
        <Field label={editingEbook ? 'File PDF Baru (opsional)' : 'File PDF *'}>
          <input type="file" accept="application/pdf,.pdf" onChange={(event) => handleFileChange(event, 'pdf_file')} className="form-file" required={!editingEbook} />
          {formData.pdf_file && <p className="mt-2 truncate text-xs font-bold text-emerald-700">{formData.pdf_file.name}</p>}
        </Field>
        <Field label="Cover Buku (opsional)">
          <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 'cover_image')} className="form-file" />
          {formData.cover_image && <p className="mt-2 truncate text-xs font-bold text-emerald-700">{formData.cover_image.name}</p>}
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-emerald-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
          Batal
        </button>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Menyimpan...' : 'Simpan E-Book'}
        </button>
      </div>
    </form>
  );
}

function RewardManagementTab() {
  const [data, setData] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.rewards.list();
      setData(extractArray<Reward>(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data reward'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return data;
    return data.filter((item) => `${item.name} ${item.description ?? ''}`.toLowerCase().includes(keyword));
  }, [data, searchTerm]);

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus reward ini?')) return;

    try {
      setError('');
      await api.rewards.delete(id);
      await fetchRewards();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus reward'));
    }
  };

  const handleSuccess = async () => {
    setShowForm(false);
    setEditingReward(null);
    await fetchRewards();
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Manajemen Hadiah"
        title="Kelola Reward"
        description="Atur hadiah, stok, dan jumlah poin yang diperlukan siswa. Kartu reward dibuat lebih jelas agar admin mudah melihat stok dan status."
        Icon={Gift}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {showForm && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Form Reward</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{editingReward ? 'Edit Reward' : 'Tambah Reward Baru'}</h2>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditingReward(null); }} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200 transition hover:text-red-600" aria-label="Tutup form reward">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <RewardForm editingReward={editingReward} onSuccess={handleSuccess} onCancel={() => { setShowForm(false); setEditingReward(null); }} />
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Cari nama atau deskripsi reward..." />
          {!showForm && (
            <button type="button" onClick={() => { setEditingReward(null); setShowForm(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800">
              <Plus size={18} aria-hidden="true" />
              Tambah Reward
            </button>
          )}
        </div>

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingBlock />
        ) : filteredData.length === 0 ? (
          <EmptyState title="Reward belum ditemukan" description="Tambah reward baru atau ubah kata kunci pencarian." />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((reward) => (
              <article key={reward.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    {reward.image ? (
                      <img src={normalizeFileUrl(reward.image)} alt={reward.name} className="h-32 w-24 rounded-2xl object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="grid h-32 w-24 place-items-center rounded-2xl bg-white text-4xl ring-1 ring-slate-200">{reward.icon || '🎁'}</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black text-slate-950">{reward.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-slate-500">{reward.description || 'Tanpa deskripsi'}</p>
                      </div>
                      <StatusBadge active={isActive(reward.is_active)} />
                    </div>

                    <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600">
                      <p>Poin: {formatNumber(reward.points_required)}</p>
                      <p>Stok: {formatNumber(reward.stock)}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => handleEdit(reward)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(reward.id)} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-100">
                        <Trash2 size={13} aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RewardForm({
  onSuccess,
  editingReward,
  onCancel,
}: {
  onSuccess: () => void | Promise<void>;
  editingReward: Reward | null;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 100,
    stock: 10,
    image: null as File | null,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingReward) return;
    setFormData({
      name: editingReward.name || '',
      description: editingReward.description || '',
      points_required: toNumber(editingReward.points_required) || 1,
      stock: toNumber(editingReward.stock),
      image: null,
    });
  }, [editingReward]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Nama reward dan deskripsi harus diisi');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('points_required', String(formData.points_required));
    payload.append('stock', String(formData.stock));
    if (formData.image) payload.append('image', formData.image);

    try {
      setSubmitting(true);
      if (editingReward) {
        await api.rewards.update(editingReward.id, payload);
      } else {
        await api.rewards.create(payload);
      }
      await onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan reward'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama Reward *">
          <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="form-input" placeholder="Contoh: Buku tulis" required />
        </Field>
        <Field label="Poin Diperlukan *">
          <input type="number" min={1} value={formData.points_required} onChange={(event) => setFormData({ ...formData, points_required: Number(event.target.value) || 1 })} className="form-input" required />
        </Field>
        <Field label="Stok *">
          <input type="number" min={0} value={formData.stock} onChange={(event) => setFormData({ ...formData, stock: Number(event.target.value) || 0 })} className="form-input" required />
        </Field>
        <Field label="Gambar Reward (opsional)">
          <input type="file" accept="image/*" onChange={(event) => setFormData({ ...formData, image: event.target.files?.[0] || null })} className="form-file" />
          {formData.image && <p className="mt-2 truncate text-xs font-bold text-emerald-700">{formData.image.name}</p>}
        </Field>
        <Field label="Deskripsi *" className="md:col-span-2">
          <textarea value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className="form-input min-h-28 resize-y" placeholder="Deskripsi singkat reward" required />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-emerald-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
          Batal
        </button>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Menyimpan...' : 'Simpan Reward'}
        </button>
      </div>
    </form>
  );
}

function UserManagementTab() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.users.list();
      setData(extractArray<User>(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data pengguna'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return data.filter((item) => {
      const matchesSearch = !keyword || `${item.name} ${item.email} ${item.class_name ?? ''}`.toLowerCase().includes(keyword);
      const matchesRole = !roleFilter || item.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, roleFilter]);

  const handleEdit = (selectedUser: User) => {
    setEditingUser(selectedUser);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

    try {
      setError('');
      await api.users.delete(id);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus user'));
    }
  };

  const handleSuccess = async () => {
    setShowForm(false);
    setEditingUser(null);
    await fetchUsers();
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Manajemen Akun"
        title="Kelola User"
        description="Tambah akun siswa, guru, atau admin. Filter dan pencarian dibuat lebih jelas agar data pengguna mudah diperiksa."
        Icon={Users}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {showForm && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Form User</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200 transition hover:text-red-600" aria-label="Tutup form user">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <UserForm editingUser={editingUser} onSuccess={handleSuccess} onCancel={() => { setShowForm(false); setEditingUser(null); }} />
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Cari nama, email, atau kelas..." />
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          {!showForm && (
            <button type="button" onClick={() => { setEditingUser(null); setShowForm(true); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800">
              <Plus size={18} aria-hidden="true" />
              Tambah User
            </button>
          )}
        </div>

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingBlock />
        ) : filteredData.length === 0 ? (
          <EmptyState title="User belum ditemukan" description="Tambah user baru atau ubah filter pencarian." />
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Nama</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Kelas/Divisi</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredData.map((account) => (
                    <tr key={account.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                            {account.profile_photo_url ? <img src={account.profile_photo_url} alt={account.name} className="h-full w-full object-cover" /> : account.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-black text-slate-950">{account.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{account.email}</td>
                      <td className="px-5 py-4"><RoleBadge role={account.role} /></td>
                      <td className="px-5 py-4 font-semibold text-slate-600">{account.class_name || '-'}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleEdit(account)} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(account.id)} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-100">
                            <Trash2 size={13} aria-hidden="true" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleClass: Record<string, string> = {
    admin: 'bg-slate-950 text-white ring-slate-950',
    guru: 'bg-blue-50 text-blue-700 ring-blue-100',
    siswa: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${roleClass[role] || 'bg-slate-100 text-slate-700 ring-slate-200'}`}>
      {role || 'user'}
    </span>
  );
}

function UserForm({
  onSuccess,
  editingUser,
  onCancel,
}: {
  onSuccess: () => void | Promise<void>;
  editingUser: User | null;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'siswa',
    class_name: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingUser) return;
    setFormData({
      name: editingUser.name || '',
      email: editingUser.email || '',
      password: '',
      password_confirmation: '',
      role: editingUser.role || 'siswa',
      class_name: editingUser.class_name || '',
    });
  }, [editingUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Nama dan email harus diisi');
      return;
    }

    if (!editingUser && (!formData.password || !formData.password_confirmation)) {
      setError('Password harus diisi untuk user baru');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        class_name: formData.class_name.trim() || undefined,
        ...(formData.role === 'siswa' && { grade_level: '10' }),
        ...(formData.password && {
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      };

      if (editingUser) {
        await api.users.update(editingUser.id, payload);
      } else {
        await api.users.create(payload);
      }

      await onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan user'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama Lengkap *">
          <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="form-input" placeholder="Nama lengkap" required />
        </Field>
        <Field label="Email *">
          <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="form-input" placeholder="email@example.com" required />
        </Field>
        <Field label="Role *">
          <select value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} className="form-input" required>
            <option value="siswa">Siswa</option>
            <option value="guru">Guru</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label="Kelas/Divisi">
          <input type="text" value={formData.class_name} onChange={(event) => setFormData({ ...formData, class_name: event.target.value })} className="form-input" placeholder="Contoh: X IPA 1" />
        </Field>
        <Field label={editingUser ? 'Password Baru (opsional)' : 'Password *'}>
          <input type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} className="form-input" placeholder="Minimal 6 karakter" required={!editingUser} minLength={6} />
        </Field>
        <Field label={editingUser ? 'Konfirmasi Password Baru' : 'Konfirmasi Password *'}>
          <input type="password" value={formData.password_confirmation} onChange={(event) => setFormData({ ...formData, password_confirmation: event.target.value })} className="form-input" placeholder="Ulangi password" required={!editingUser || Boolean(formData.password)} minLength={formData.password ? 6 : undefined} />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-emerald-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
          Batal
        </button>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Menyimpan...' : 'Simpan User'}
        </button>
      </div>
    </form>
  );
}

function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    password_confirmation: '',
    avatar: null as File | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData((current) => ({
      ...current,
      name: user.name,
      email: user.email,
      avatar: null,
    }));
  }, [user]);

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Nama dan email harus diisi');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('email', formData.email.trim());
    if (formData.avatar) payload.append('avatar', formData.avatar);

    try {
      setSubmitting(true);
      await api.me.updateProfile(payload);
      await refreshUser();
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memperbarui profil'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.current_password || !formData.new_password) {
      setError('Password saat ini dan password baru harus diisi');
      return;
    }

    if (formData.new_password !== formData.password_confirmation) {
      setError('Password baru tidak cocok dengan konfirmasi');
      return;
    }

    try {
      setSubmitting(true);
      await api.me.updateProfile({
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.password_confirmation,
      });
      setSuccess('Password berhasil diperbarui');
      setFormData((current) => ({ ...current, current_password: '', new_password: '', password_confirmation: '' }));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memperbarui password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Pengaturan"
        title="Pengaturan Profil Admin"
        description="Perbarui nama, email, foto profil, dan password akun admin yang sedang login."
        Icon={Settings}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-slate-950">Informasi Profil</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">Data ini digunakan untuk identitas admin di dashboard.</p>

          <div className="mt-5 space-y-3">
            <ErrorAlert message={error} />
            {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</div>}
          </div>

          <form onSubmit={handleProfileUpdate} className="mt-5 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-slate-100 text-3xl font-black text-slate-400 ring-1 ring-slate-200">
                {formData.avatar ? (
                  <img src={URL.createObjectURL(formData.avatar)} alt="Preview avatar" className="h-full w-full object-cover" />
                ) : user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              <Field label="Foto Profil">
                <input type="file" accept="image/*" onChange={(event) => setFormData({ ...formData, avatar: event.target.files?.[0] || null })} className="form-file" />
              </Field>
            </div>

            <Field label="Nama Lengkap *">
              <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="form-input" required />
            </Field>
            <Field label="Email *">
              <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="form-input" required />
            </Field>

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-black text-slate-950">Ubah Password</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">Gunakan password yang kuat agar akun admin tetap aman.</p>

          <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
            <Field label="Password Saat Ini *">
              <input type="password" value={formData.current_password} onChange={(event) => setFormData({ ...formData, current_password: event.target.value })} className="form-input" required />
            </Field>
            <Field label="Password Baru *">
              <input type="password" value={formData.new_password} onChange={(event) => setFormData({ ...formData, new_password: event.target.value })} className="form-input" required minLength={6} />
            </Field>
            <Field label="Konfirmasi Password Baru *">
              <input type="password" value={formData.password_confirmation} onChange={(event) => setFormData({ ...formData, password_confirmation: event.target.value })} className="form-input" required minLength={6} />
            </Field>

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Ubah Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}
