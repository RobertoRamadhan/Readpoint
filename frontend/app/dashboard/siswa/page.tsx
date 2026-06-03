'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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

const tabs: Array<{ key: TabType; label: string; icon: string }> = [
  { key: 'overview', label: 'Home', icon: '⌂' },
  { key: 'ebooks', label: 'Buku', icon: '▤' },
  { key: 'quizzes', label: 'Kuis', icon: '◈' },
  { key: 'rewards', label: 'Gift', icon: '✦' },
  { key: 'activity', label: 'Log', icon: '☷' },
];

const getArrayFromResponse = <T,>(value: unknown): T[] => {
  const response = value as { data?: unknown } | null;
  const data = response?.data;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
};

const getStatsFromResponse = (value: unknown): SiswaStats | null => {
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
};

const getCoverUrl = (book?: Ebook | null) => normalizeFileUrl(book?.cover_image_url || book?.cover_image);
const getRewardUrl = (reward?: Reward | null) => normalizeFileUrl(reward?.image_url || reward?.image);
const formatNumber = (value: number) => value.toLocaleString('id-ID');

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
    void loadDashboardData();
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
    return ebooks.filter((book) => `${book.title || ''} ${book.author || ''} ${book.category || ''}`.toLowerCase().includes(query));
  }, [ebooks, searchQuery]);

  const totalPoints = stats?.total_points ?? 0;
  const continueBook = ebooks[0] ?? null;
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

  if (!mounted || loading) return <FullLoading text="Memuat dashboard..." />;
  if (!isAuthenticated || !user || user.role !== 'siswa') return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-950">
      <div className="flex min-h-screen min-w-0">
        <DesktopRail activeTab={activeTab} levelProgress={levelProgress} totalPoints={totalPoints} onChangeTab={setActiveTab} onLogout={handleLogout} />

        <main className="min-w-0 flex-1 pb-28 lg:pb-0">
          <Header userName={user.name} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          <div className="mx-auto w-full max-w-[1440px] space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
            {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">{error}</div>}

            <MobileStats stats={stats} totalPoints={totalPoints} />
            <DesktopStats stats={stats} totalPoints={totalPoints} />

            {loadingData ? (
              <Panel>
                <FullLoading text="Memuat data..." inline />
              </Panel>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <Overview
                    continueBook={continueBook}
                    books={filteredBooks}
                    rewards={rewards.slice(0, 4)}
                    totalPoints={totalPoints}
                    onRead={(id) => router.push(`/dashboard/siswa/read/${id}`)}
                    onRedeem={redeemReward}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'ebooks' && (
                  <Panel title="Daftar E-Books" subtitle="Semua buku tersedia untuk dibaca siswa">
                    {filteredBooks.length ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                        {filteredBooks.map((book) => (
                          <BookCard key={book.id} book={book} onClick={() => router.push(`/dashboard/siswa/read/${book.id}`)} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="Buku tidak ditemukan" />
                    )}
                  </Panel>
                )}

                {activeTab === 'quizzes' && (
                  <Panel title="Daftar Kuis" subtitle="Kerjakan kuis untuk menambah poin">
                    {quizzes.length ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {quizzes.slice(0, 6).map((quiz) => (
                          <QuizCard key={quiz.id} quiz={quiz} onClick={() => router.push(`/dashboard/siswa/quiz/${quiz.ebook_id || quiz.id}`)} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="Belum ada kuis" />
                    )}
                  </Panel>
                )}

                {activeTab === 'rewards' && (
                  <Panel title="Daftar Rewards" subtitle="Tukar poin kamu dengan reward">
                    {rewards.length ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {rewards.map((reward) => (
                          <RewardCard key={reward.id} reward={reward} totalPoints={totalPoints} onRedeem={() => redeemReward(reward.id)} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="Belum ada reward" />
                    )}
                  </Panel>
                )}

                {activeTab === 'activity' && (
                  <Panel title="Aktivitas Terbaru" subtitle="Riwayat singkat aktivitas literasi">
                    <ActivityList />
                  </Panel>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <MobileTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

function DesktopRail({
  activeTab,
  levelProgress,
  totalPoints,
  onChangeTab,
  onLogout,
}: {
  activeTab: TabType;
  levelProgress: number;
  totalPoints: number;
  onChangeTab: (tab: TabType) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[120px] shrink-0 flex-col items-center border-r border-[#eee7dc] bg-white px-4 py-5 lg:flex">
      <button onClick={() => onChangeTab('overview')} className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-950 text-sm font-black text-white shadow-lg">
        RP
      </button>
      <nav className="mt-9 flex flex-1 flex-col items-center gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChangeTab(tab.key)}
            className={`flex w-full flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-[10px] font-black transition ${
              activeTab === tab.key ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-[#f6f2ea] hover:text-slate-800'
            }`}
            title={tab.label}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="mb-4 w-full rounded-[28px] border border-emerald-100 bg-emerald-50 p-3 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white">★</div>
        <p className="mt-2 text-[11px] font-black text-slate-900">Level 2</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${levelProgress}%` }} />
        </div>
        <p className="mt-2 text-[10px] font-black text-emerald-700">{formatNumber(totalPoints)} poin</p>
      </div>
      <button onClick={onLogout} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-lg font-black text-red-500 hover:bg-red-100" aria-label="Keluar">
        ↪
      </button>
    </aside>
  );
}

function Header({ userName, searchQuery, onSearchChange }: { userName: string; searchQuery: string; onSearchChange: (value: string) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#eee7dc] bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4 lg:hidden">
          <div className="min-w-0">
            <h1 className="text-xl font-black leading-none">READPOINT</h1>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700">Dashboard Siswa</p>
          </div>
          <Avatar name={userName} />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-700">READPOINT</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Halo, {userName}</h1>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-3xl">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
          <button className="hidden h-12 shrink-0 rounded-2xl border border-[#eee7dc] bg-white px-4 text-sm font-black text-slate-700 shadow-sm sm:block">ID</button>
          <button className="hidden h-12 w-12 shrink-0 rounded-2xl border border-[#eee7dc] bg-white text-lg shadow-sm sm:block">🔔</button>
          <div className="hidden lg:block">
            <Avatar name={userName} withName />
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-[#eee7dc] bg-white px-4 py-3 shadow-sm">
      <span className="mr-3 text-lg text-slate-400">⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari buku, penulis, atau kategori..."
        className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function Avatar({ name, withName = false }: { name: string; withName?: boolean }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'S';
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#eee7dc] bg-white px-3 py-2 shadow-sm">
      {withName && (
        <div className="hidden min-w-0 text-right sm:block">
          <p className="max-w-[160px] truncate text-sm font-black leading-4 text-slate-900">{name}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Siswa</p>
        </div>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{initial}</div>
    </div>
  );
}

function MobileStats({ stats, totalPoints }: { stats: SiswaStats | null; totalPoints: number }) {
  const items = [
    ['TOTAL POIN', formatNumber(totalPoints), 'Siap ditukar', '✦'],
    ['BUKU DIBACA', String(stats?.books_read ?? 0), 'Selesai', '▤'],
    ['HALAMAN', formatNumber(stats?.pages_read ?? 0), 'Total halaman', '◷'],
    ['KUIS', String(stats?.quizzes_taken ?? 0), 'Dikerjakan', '◈'],
  ];

  return (
    <section className="lg:hidden">
      <div className="mb-3">
        <h2 className="text-lg font-black tracking-tight">Ringkasan Literasi</h2>
        <p className="text-xs font-semibold text-slate-500">Pantau poin dan progres membaca kamu</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(([title, value, helper, icon]) => (
          <div key={title} className="min-w-0 rounded-[22px] border border-[#eee7dc] bg-white p-3 shadow-[0_12px_28px_rgba(45,34,18,0.05)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
                <p className="mt-1 truncate text-xl font-black text-slate-950">{value}</p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#f6f2ea] text-xs font-black text-emerald-700">{icon}</div>
            </div>
            <p className="mt-2 truncate text-[11px] font-black text-emerald-700">{helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DesktopStats({ stats, totalPoints }: { stats: SiswaStats | null; totalPoints: number }) {
  return (
    <section className="hidden grid-cols-4 gap-4 lg:grid">
      <StatCard title="Total Poin" value={formatNumber(totalPoints)} helper="Siap ditukar" icon="✦" />
      <StatCard title="Buku Dibaca" value={stats?.books_read ?? 0} helper="Selesai dibaca" icon="▤" />
      <StatCard title="Halaman" value={formatNumber(stats?.pages_read ?? 0)} helper="Total halaman" icon="◷" />
      <StatCard title="Kuis" value={stats?.quizzes_taken ?? 0} helper="Sudah dikerjakan" icon="◈" />
    </section>
  );
}

function StatCard({ title, value, helper, icon }: { title: string; value: number | string; helper: string; icon: string }) {
  return (
    <div className="rounded-[24px] border border-[#eee7dc] bg-white p-5 shadow-[0_14px_35px_rgba(45,34,18,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 truncate text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f6f2ea] text-lg text-emerald-700">{icon}</div>
      </div>
      <p className="mt-2 text-xs font-bold text-emerald-700">{helper}</p>
    </div>
  );
}

function Overview({
  continueBook,
  books,
  rewards,
  totalPoints,
  onRead,
  onRedeem,
  setActiveTab,
}: {
  continueBook: Ebook | null;
  books: Ebook[];
  rewards: Reward[];
  totalPoints: number;
  onRead: (id: number) => void;
  onRedeem: (id: number) => void;
  setActiveTab: (tab: TabType) => void;
}) {
  const latest = books.slice(0, 8);
  const popular = books.slice(2, 10).length ? books.slice(2, 10) : latest;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4 sm:space-y-5">
        <ContinueCard book={continueBook} onRead={onRead} />
        <Shelf title="Terbaru" books={latest} onRead={onRead} onViewAll={() => setActiveTab('ebooks')} />
        <Shelf title="Direkomendasikan" books={latest} onRead={onRead} onViewAll={() => setActiveTab('ebooks')} />
        <Shelf title="Populer" books={popular} onRead={onRead} onViewAll={() => setActiveTab('ebooks')} />
      </div>
      <aside className="min-w-0 space-y-4 sm:space-y-5">
        <Panel title="Reward" action="Lihat semua →" onAction={() => setActiveTab('rewards')} compact>
          {rewards.length ? (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <RewardRow key={reward.id} reward={reward} disabled={totalPoints < reward.points_required || reward.stock <= 0} onRedeem={() => onRedeem(reward.id)} />
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada reward" />
          )}
        </Panel>
        <Panel title="Aktivitas" action="Lihat semua →" onAction={() => setActiveTab('activity')} compact>
          <ActivityList />
        </Panel>
      </aside>
    </div>
  );
}

function ContinueCard({ book, onRead }: { book: Ebook | null; onRead: (id: number) => void }) {
  if (!book) {
    return (
      <Panel>
        <EmptyState title="Belum ada buku" />
      </Panel>
    );
  }

  const cover = getCoverUrl(book);
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#eee7dc] bg-white shadow-[0_18px_45px_rgba(45,34,18,0.06)] sm:rounded-[32px]">
      <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5 sm:p-5 lg:grid-cols-[210px_minmax(0,1fr)] lg:p-6">
        <div className="w-full overflow-hidden rounded-[18px] bg-[#f0eadf] shadow-lg sm:rounded-[24px] lg:rounded-[26px]">
          {cover ? <img src={cover} alt={book.title} className="aspect-[3/4] h-full w-full object-cover" /> : <BookPlaceholder />}
        </div>
        <div className="flex min-w-0 flex-col justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 sm:text-xs">Lanjutkan Membaca</span>
            <h2 className="mt-2 line-clamp-2 text-lg font-black tracking-tight text-slate-950 sm:mt-3 sm:text-2xl lg:text-4xl">{book.title}</h2>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500 sm:text-sm lg:text-base">{book.author}</p>
            <div className="mt-3 hidden grid-cols-3 gap-3 sm:grid">
              <Info label="Kategori" value={book.category || 'Umum'} />
              <Info label="Halaman" value={`${book.pages || 0}`} />
              <Info label="Poin/hal" value={`${book.poin_per_halaman || 0}`} />
            </div>
          </div>
          <div className="mt-3 min-w-0 sm:mt-5">
            <div className="flex items-center justify-between text-[10px] font-black text-slate-500 sm:text-xs">
              <span>Progress</span>
              <span>57%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f0eadf] sm:h-2.5">
              <div className="h-full w-[57%] rounded-full bg-emerald-600" />
            </div>
            <button onClick={() => onRead(book.id)} className="mt-3 w-full rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-lg hover:bg-emerald-700 sm:mt-4 sm:w-auto sm:px-6 sm:py-3 sm:text-sm">
              Baca Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Shelf({ title, books, onRead, onViewAll }: { title: string; books: Ebook[]; onRead: (id: number) => void; onViewAll: () => void }) {
  return (
    <Panel title={title} subtitle="Koleksi buku yang bisa langsung kamu baca" action="Lihat semua →" onAction={onViewAll}>
      {books.length ? (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 sm:gap-4 sm:pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {books.map((book) => (
            <BookCard key={`${title}-${book.id}`} book={book} onClick={() => onRead(book.id)} shelf />
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada buku" />
      )}
    </Panel>
  );
}

function Panel({
  title,
  subtitle,
  action,
  onAction,
  compact = false,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`min-w-0 rounded-[24px] border border-[#eee7dc] bg-white ${compact ? 'p-4 sm:p-5' : 'p-4 sm:p-6'} shadow-[0_18px_45px_rgba(45,34,18,0.06)] sm:rounded-[28px]`}>
      {title && (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black tracking-tight sm:text-2xl">{title}</h2>
            {subtitle && <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500 sm:text-sm">{subtitle}</p>}
          </div>
          {action && (
            <button onClick={onAction} className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700 hover:bg-emerald-100 sm:text-xs">
              {action}
            </button>
          )}
        </div>
      )}
      <div className={title ? 'mt-4 sm:mt-5' : ''}>{children}</div>
    </section>
  );
}

function BookCard({ book, onClick, shelf = false }: { book: Ebook; onClick: () => void; shelf?: boolean }) {
  const cover = getCoverUrl(book);
  return (
    <article className={`${shelf ? 'w-[96px] shrink-0 snap-start sm:w-[138px] md:w-[160px] xl:w-[180px]' : 'min-w-0'} group`}>
      <button onClick={onClick} className="block w-full text-left">
        <div className="overflow-hidden rounded-[18px] bg-[#f0eadf] shadow-[0_12px_28px_rgba(45,34,18,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl sm:rounded-[24px]">
          {cover ? <img src={cover} alt={book.title} className="aspect-[3/4] h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <BookPlaceholder />}
        </div>
        <h3 className="mt-2 line-clamp-2 text-xs font-black leading-snug text-slate-950 sm:mt-3 sm:text-base">{book.title}</h3>
        <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-slate-500 sm:text-xs">{book.author || 'Penulis tidak tersedia'}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#f6f2ea] px-2 py-1 text-[9px] font-black text-slate-500 sm:text-[10px]">{book.pages || 0} hal</span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700 sm:text-[10px]">+{book.poin_per_halaman || 0}/hal</span>
        </div>
      </button>
    </article>
  );
}

function BookPlaceholder() {
  return (
    <div className="flex aspect-[3/4] w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-[#f0eadf] text-3xl sm:text-4xl">
      <span>📘</span>
      <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 sm:text-xs">READPOINT</span>
    </div>
  );
}

function RewardRow({ reward, disabled, onRedeem }: { reward: Reward; disabled: boolean; onRedeem: () => void }) {
  const image = getRewardUrl(reward);
  return (
    <div className="flex gap-3 rounded-2xl border border-[#eee7dc] bg-[#fbfaf7] p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
        {image ? <img src={image} alt={reward.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🎁</div>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-black">{reward.name}</h3>
        <p className="mt-1 text-xs font-bold text-emerald-700">{formatNumber(reward.points_required)} poin</p>
        <button onClick={onRedeem} disabled={disabled} className="mt-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white disabled:bg-slate-200 disabled:text-slate-400">
          {disabled ? 'Terkunci' : 'Tukar'}
        </button>
      </div>
    </div>
  );
}

function RewardCard({ reward, totalPoints, onRedeem }: { reward: Reward; totalPoints: number; onRedeem: () => void }) {
  const image = getRewardUrl(reward);
  const disabled = totalPoints < reward.points_required || reward.stock <= 0;
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#eee7dc] bg-white shadow-md">
      <div className="h-44 bg-[#f0eadf]">
        {image ? <img src={image} alt={reward.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl">🎁</div>}
      </div>
      <div className="p-5">
        <h3 className="font-black">{reward.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500">{reward.description}</p>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fbfaf7] p-3 text-sm font-black">
          <span>{formatNumber(reward.points_required)} poin</span>
          <span>{reward.stock} stok</span>
        </div>
        <button onClick={onRedeem} disabled={disabled} className="mt-4 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400">
          {disabled ? 'Belum Bisa Ditukar' : 'Tukar Reward'}
        </button>
      </div>
    </div>
  );
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-[26px] border border-[#eee7dc] bg-white p-5 text-left shadow-md transition hover:-translate-y-1 hover:bg-[#fbfaf7]">
      <p className="text-sm font-black text-emerald-700">Kuis Buku</p>
      <h3 className="mt-2 line-clamp-2 text-lg font-black">{quiz.ebook_title || quiz.title || 'Kuis'}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">{quiz.total_questions || 5} soal • {quiz.points_reward || 50} poin</p>
      <span className="mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">Mulai Kuis</span>
    </button>
  );
}

function ActivityList() {
  const activities = [
    ['Membaca 20 halaman', 'Si Pangeran Kecil', '+20 poin'],
    ['Menyelesaikan kuis', 'Perahu Kertas', '+50 poin'],
    ['Bonus login harian', 'Hari ini', '+15 poin'],
    ['Membaca 15 halaman', 'Harry Potter', '+15 poin'],
  ];
  return (
    <div className="space-y-3 sm:space-y-4">
      {activities.map(([title, subtitle, point]) => (
        <div key={title} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbfaf7] p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-50" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{title}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{subtitle}</p>
            </div>
          </div>
          <p className="shrink-0 text-xs font-black text-emerald-700">{point}</p>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#fbfaf7] p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#e5dccf] bg-[#fbfaf7] p-6 text-center sm:p-8">
      <p className="text-3xl">📚</p>
      <h3 className="mt-3 text-base font-black">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-slate-500">Data akan muncul setelah tersedia.</p>
    </div>
  );
}

function MobileTabBar({ activeTab, onChangeTab }: { activeTab: TabType; onChangeTab: (tab: TabType) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#eee7dc] bg-white/95 px-2 py-2 shadow-[0_-16px_40px_rgba(45,34,18,0.12)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChangeTab(tab.key)}
            className={`rounded-2xl px-2 py-2 text-center text-[10px] font-black transition ${activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-[#f6f2ea]'}`}
          >
            <span className="block text-lg leading-none">{tab.icon}</span>
            <span className="mt-1 block">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function FullLoading({ text, inline = false }: { text: string; inline?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${inline ? 'py-12' : 'min-h-screen bg-[#fbfaf7]'}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <p className="text-sm font-semibold text-emerald-700">{text}</p>
      </div>
    </div>
  );
}
