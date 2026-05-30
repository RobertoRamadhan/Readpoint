'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { normalizeFileUrl } from '@/lib/file-url';

type TabType = 'overview' | 'ebooks' | 'quizzes' | 'rewards' | 'activity';

interface SiswaStats {
  total_points: number;
  books_read: number;
  pages_read: number;
  quizzes_taken: number;
}

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  poin_per_halaman: number;
  category: string;
  cover_image?: string;
  cover_image_url?: string;
  pdf_file?: string;
  pdf_file_url?: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  image?: string;
  image_url?: string;
}

interface Quiz {
  id: number;
  ebook_id?: number;
  ebook_title?: string;
  title?: string;
  total_questions?: number;
  difficulty?: string;
  points_reward?: number;
}

let dashboardCache: {
  stats: SiswaStats | null;
  ebooks: Ebook[];
  rewards: Reward[];
  quizzes: Quiz[];
  cachedAt: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000;

function normalizeCover(book?: Ebook | null) {
  return normalizeFileUrl(book?.cover_image_url || book?.cover_image);
}

function normalizeReward(reward?: Reward | null) {
  return normalizeFileUrl(reward?.image_url || reward?.image);
}

function getStatsFromResponse(value: unknown): SiswaStats | null {
  const response = value as { data?: unknown } | null;
  const payload = response && typeof response === 'object' && 'data' in response ? response.data : value;

  if (!payload || typeof payload !== 'object') return null;

  const raw = payload as Partial<SiswaStats>;

  return {
    total_points: Number(raw.total_points ?? 0),
    books_read: Number(raw.books_read ?? 0),
    pages_read: Number(raw.pages_read ?? 0),
    quizzes_taken: Number(raw.quizzes_taken ?? 0),
  };
}

function getArrayFromResponse<T>(value: unknown): T[] {
  const response = value as { data?: unknown } | null;
  const data = response?.data;

  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }

  return [];
}

export default function SiswaDashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<SiswaStats | null>(dashboardCache?.stats ?? null);
  const [ebooks, setEbooks] = useState<Ebook[]>(dashboardCache?.ebooks ?? []);
  const [rewards, setRewards] = useState<Reward[]>(dashboardCache?.rewards ?? []);
  const [quizzes, setQuizzes] = useState<Quiz[]>(dashboardCache?.quizzes ?? []);
  const isCacheFresh = dashboardCache && Date.now() - dashboardCache.cachedAt < CACHE_TTL_MS;
  const [loadingData, setLoadingData] = useState(!isCacheFresh);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'siswa') {
      router.push('/login');
      return;
    }

    if (isCacheFresh) {
      setStats(dashboardCache!.stats);
      setEbooks(dashboardCache!.ebooks);
      setRewards(dashboardCache!.rewards);
      setQuizzes(dashboardCache!.quizzes);
      setLoadingData(false);
      return;
    }

    if (fetchedRef.current) return;

    fetchedRef.current = true;
    loadDashboardData();
  }, [mounted, loading, isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      const [statsRes, ebooksRes, rewardsRes, quizzesRes] = await Promise.allSettled([
        api.dashboard.siswaStats(),
        api.ebooks.list(),
        api.rewards.list(),
        api.getAllQuizzes(),
      ]);

      const newStats = statsRes.status === 'fulfilled' ? getStatsFromResponse(statsRes.value) : null;
      const newEbooks = ebooksRes.status === 'fulfilled' ? getArrayFromResponse<Ebook>(ebooksRes.value) : [];
      const newRewards = rewardsRes.status === 'fulfilled' ? getArrayFromResponse<Reward>(rewardsRes.value) : [];
      const newQuizzes = quizzesRes.status === 'fulfilled' ? getArrayFromResponse<Quiz>(quizzesRes.value) : [];

      setStats(newStats);
      setEbooks(newEbooks);
      setRewards(newRewards);
      setQuizzes(newQuizzes);

      dashboardCache = {
        stats: newStats,
        ebooks: newEbooks,
        rewards: newRewards,
        quizzes: newQuizzes,
        cachedAt: Date.now(),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard siswa');
    } finally {
      setLoadingData(false);
    }
  };

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return ebooks;

    return ebooks.filter((book) =>
      `${book.title || ''} ${book.author || ''} ${book.category || ''}`.toLowerCase().includes(query)
    );
  }, [ebooks, searchQuery]);

  const totalPoints = stats?.total_points ?? 0;
  const continueBook = ebooks[0] || null;
  const recommendedBooks = filteredBooks.slice(0, 4);
  const visibleRewards = rewards.slice(0, 4);
  const visibleQuizzes = quizzes.slice(0, 6);
  const levelProgress = Math.min(100, Math.round((totalPoints / 500) * 100));

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const redeemReward = async (rewardId: number) => {
    try {
      await api.rewards.redeem(rewardId);
      dashboardCache = null;
      fetchedRef.current = false;
      await loadDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menukar reward');
    }
  };

  if (!mounted || loading) return <DashboardLoading text="Memuat dashboard..." />;
  if (!isAuthenticated || !user || user.role !== 'siswa') return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white px-8 py-7 lg:flex lg:flex-col">
          <BrandBlock />

          <nav className="mt-9 space-y-2">
            <SidebarButton active={activeTab === 'overview'} label="Overview" onClick={() => setActiveTab('overview')} />
            <SidebarButton active={activeTab === 'ebooks'} label="E-Books" onClick={() => setActiveTab('ebooks')} />
            <SidebarButton active={activeTab === 'quizzes'} label="Kuis" onClick={() => setActiveTab('quizzes')} />
            <SidebarButton active={activeTab === 'rewards'} label="Rewards" onClick={() => setActiveTab('rewards')} />

            <div className="my-5 border-t border-slate-200" />

            <SidebarButton active={activeTab === 'activity'} label="Aktivitas" onClick={() => setActiveTab('activity')} />
            <SidebarButton active={false} label="Profil" onClick={() => router.push('/dashboard/siswa/profile')} />
          </nav>

          <div className="mt-9 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 font-black text-white">★</div>
              <div>
                <p className="font-black text-slate-900">Level 2</p>
                <p className="text-xs font-semibold text-slate-500">Pembaca Aktif</p>
              </div>
            </div>

            <div className="mb-3 h-2 rounded-full bg-emerald-100">
              <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${levelProgress}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-800">{totalPoints} / 500 poin</span>
              <span className="text-emerald-700">Detail →</span>
            </div>
          </div>

          <button onClick={handleLogout} className="mt-auto rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100">
            Keluar
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur lg:px-8">
            <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-6">
              <div className="flex shrink-0 items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">RP</div>
                <div>
                  <h1 className="text-lg font-black leading-none text-slate-950">READPOINT</h1>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">Dashboard Siswa</p>
                </div>
              </div>

              <div className="hidden flex-1 lg:block" />

              <SearchInput value={searchQuery} onChange={setSearchQuery} desktop />

              <div className="ml-auto hidden w-44 shrink-0 text-right sm:block">
                <p className="truncate text-sm font-black leading-4 text-slate-900">{user.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Siswa</p>
              </div>
            </div>

            <div className="space-y-3 pb-4 md:hidden">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['overview', 'ebooks', 'quizzes', 'rewards', 'activity'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-black capitalize ${activeTab === tab ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}
                  >
                    {tab === 'ebooks' ? 'E-Books' : tab === 'quizzes' ? 'Kuis' : tab === 'activity' ? 'Aktivitas' : tab}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 lg:px-8 lg:py-6">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

            <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard title="Total Poin" value={totalPoints} helper="Poin tersedia" />
              <StatCard title="Buku Dibaca" value={stats?.books_read ?? 0} helper="Selesai dibaca" />
              <StatCard title="Halaman" value={(stats?.pages_read ?? 0).toLocaleString('id-ID')} helper="Total halaman" />
              <StatCard title="Kuis" value={stats?.quizzes_taken ?? 0} helper="Sudah dikerjakan" />
            </section>

            {loadingData ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                <p className="text-sm font-bold text-slate-600">Memuat data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewContent
                    continueBook={continueBook}
                    books={recommendedBooks}
                    rewards={visibleRewards}
                    totalPoints={totalPoints}
                    onRead={(id) => router.push(`/dashboard/siswa/read/${id}`)}
                    onRedeem={redeemReward}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'ebooks' && (
                  <ContentPanel title="Daftar E-Books" action="Semua buku tersedia untuk dibaca siswa">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredBooks.map((book) => <BookCard key={book.id} book={book} onClick={() => router.push(`/dashboard/siswa/read/${book.id}`)} />)}
                    </div>
                  </ContentPanel>
                )}

                {activeTab === 'quizzes' && (
                  <ContentPanel title="Daftar Kuis" action="Kerjakan kuis untuk menambah poin">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {visibleQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} onClick={() => router.push(`/dashboard/siswa/quiz/${quiz.ebook_id || quiz.id}`)} />)}
                    </div>
                  </ContentPanel>
                )}

                {activeTab === 'rewards' && (
                  <ContentPanel title="Daftar Rewards" action="Tukar poin kamu dengan reward">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {rewards.map((reward) => <RewardCard key={reward.id} reward={reward} totalPoints={totalPoints} onRedeem={() => redeemReward(reward.id)} />)}
                    </div>
                  </ContentPanel>
                )}

                {activeTab === 'activity' && (
                  <ContentPanel title="Aktivitas Terbaru" action="Riwayat singkat aktivitas literasi">
                    <ActivityList />
                  </ContentPanel>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardLoading({ text }: { text: string }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center"><div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" /><p className="text-sm font-semibold text-emerald-700">{text}</p></div></div>;
}

function BrandBlock() {
  return <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">RP</div><div className="min-w-0"><h1 className="text-2xl font-black leading-none text-slate-950">READPOINT</h1><p className="mt-2 text-xs font-black uppercase tracking-widest text-emerald-700">Dashboard Siswa</p></div></div>;
}

function SearchInput({ value, onChange, desktop = false }: { value: string; onChange: (value: string) => void; desktop?: boolean }) {
  return <div className={`${desktop ? 'hidden h-12 w-full max-w-lg shrink-0 md:flex' : 'flex min-h-12 w-full'} items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm`}><span className="mr-3 text-lg text-slate-400">⌕</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={desktop ? 'Cari buku berdasarkan judul, penulis, atau kategori...' : 'Cari buku...'} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400" /></div>;
}

function SidebarButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><span className={`h-4 w-4 rounded-full ${active ? 'bg-emerald-600' : 'bg-slate-200'}`} />{label}</button>;
}

function StatCard({ title, value, helper }: { title: string; value: number | string; helper: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">{title}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-emerald-600">{helper}</p></div>;
}

function OverviewContent({ continueBook, books, rewards, totalPoints, onRead, onRedeem, setActiveTab }: { continueBook: Ebook | null; books: Ebook[]; rewards: Reward[]; totalPoints: number; onRead: (id: number) => void; onRedeem: (id: number) => void; setActiveTab: (tab: TabType) => void }) {
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><div className="min-w-0 space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeader title="Lanjutkan Membaca" />{continueBook ? <div className="mt-5 flex gap-4"><div className="h-44 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-200">{normalizeCover(continueBook) ? <img src={normalizeCover(continueBook)} alt={continueBook.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl">📕</div>}</div><div className="min-w-0 flex-1"><h3 className="line-clamp-2 text-lg font-black text-slate-950">{continueBook.title}</h3><p className="mt-1 text-sm font-medium text-slate-500">{continueBook.author}</p><p className="mt-8 text-xs font-semibold text-slate-500">Halaman 68 dari {continueBook.pages}</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 w-[57%] rounded-full bg-emerald-600" /></div><button onClick={() => onRead(continueBook.id)} className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">Lanjutkan</button></div></div> : <p className="mt-5 text-sm font-semibold text-slate-500">Belum ada buku tersedia.</p>}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeader title="Aktivitas Terbaru" action="Lihat semua →" onAction={() => setActiveTab('activity')} /><ActivityList /></section></div><div className="min-w-0 space-y-6 xl:col-span-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeader title="Rekomendasi Buku" action="Lihat semua →" onAction={() => setActiveTab('ebooks')} /><div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">{books.map((book) => <BookMiniCard key={book.id} book={book} onClick={() => onRead(book.id)} />)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeader title="Reward Tersedia" action="Lihat semua →" onAction={() => setActiveTab('rewards')} /><div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{rewards.map((reward) => <RewardMiniCard key={reward.id} reward={reward} disabled={totalPoints < reward.points_required || reward.stock <= 0} onRedeem={() => onRedeem(reward.id)} />)}</div></section></div></div>;
}

function ContentPanel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionHeader title={title} action={action} /><div className="mt-5">{children}</div></section>;
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-black text-slate-950">{title}</h2>{action && <button onClick={onAction} className="text-xs font-black text-emerald-700 hover:text-emerald-800">{action}</button>}</div>;
}

function BookMiniCard({ book, onClick }: { book: Ebook; onClick: () => void }) {
  const cover = normalizeCover(book);
  return <div className="min-w-0"><button onClick={onClick} className="block w-full text-left"><div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-200">{cover ? <img src={cover} alt={book.title} className="h-full w-full object-cover transition hover:scale-105" /> : <div className="flex h-full items-center justify-center text-3xl">📕</div>}</div><h3 className="mt-3 line-clamp-2 text-base font-black text-slate-950">{book.title}</h3><p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{book.author}</p></button><button onClick={onClick} className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">Lihat Detail</button></div>;
}

function BookCard({ book, onClick }: { book: Ebook; onClick: () => void }) {
  const cover = normalizeCover(book);
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="aspect-[3/4] bg-slate-200">{cover ? <img src={cover} alt={book.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl">📕</div>}</div><div className="p-4"><h3 className="line-clamp-2 font-black text-slate-950">{book.title}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{book.author}</p><p className="mt-3 text-xs font-bold text-slate-500">{book.pages} halaman • {book.poin_per_halaman} poin/hal</p><button onClick={onClick} className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700">Baca Sekarang</button></div></div>;
}

function RewardMiniCard({ reward, disabled, onRedeem }: { reward: Reward; disabled: boolean; onRedeem: () => void }) {
  const image = normalizeReward(reward);
  return <div className="rounded-xl border border-slate-200 bg-white p-4 text-center"><div className="mx-auto mb-3 h-20 w-24 overflow-hidden rounded-lg bg-slate-100">{image ? <img src={image} alt={reward.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🎁</div>}</div><h3 className="line-clamp-2 text-sm font-black text-slate-950">{reward.name}</h3><p className="mt-2 text-lg font-black text-emerald-700">{reward.points_required} poin</p><button onClick={onRedeem} disabled={disabled} className="mt-3 w-full rounded-lg bg-emerald-50 py-2 text-xs font-black text-emerald-700 disabled:bg-slate-100 disabled:text-slate-400">Tukar</button></div>;
}

function RewardCard({ reward, totalPoints, onRedeem }: { reward: Reward; totalPoints: number; onRedeem: () => void }) {
  const image = normalizeReward(reward);
  const disabled = totalPoints < reward.points_required || reward.stock <= 0;
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-44 bg-slate-100">{image ? <img src={image} alt={reward.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl">🎁</div>}</div><div className="p-4"><h3 className="font-black text-slate-950">{reward.name}</h3><p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500">{reward.description}</p><div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-black"><span>{reward.points_required} poin</span><span>{reward.stock} stok</span></div><button onClick={onRedeem} disabled={disabled} className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400">{disabled ? 'Belum Bisa Ditukar' : 'Tukar Reward'}</button></div></div>;
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:bg-slate-50"><p className="text-sm font-bold text-emerald-700">Kuis Buku</p><h3 className="mt-2 text-lg font-black text-slate-950">{quiz.ebook_title || quiz.title || 'Kuis'}</h3><p className="mt-2 text-sm font-semibold text-slate-500">{quiz.total_questions || 5} soal • {quiz.points_reward || 50} poin</p><span className="mt-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Mulai Kuis</span></button>;
}

function ActivityList() {
  const activities = [['Membaca 20 halaman', 'Si Pangeran Kecil', '+20 poin'], ['Menyelesaikan kuis', 'Perahu Kertas', '+50 poin'], ['Bonus login harian', 'Hari ini', '+15 poin'], ['Membaca 15 halaman', 'Harry Potter', '+15 poin']];
  return <div className="mt-5 space-y-4">{activities.map(([title, subtitle, point]) => <div key={title} className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-emerald-50" /><div><p className="text-sm font-black text-slate-900">{title}</p><p className="text-xs font-semibold text-slate-500">{subtitle}</p></div></div><p className="text-xs font-black text-emerald-700">{point}</p></div>)}</div>;
}
