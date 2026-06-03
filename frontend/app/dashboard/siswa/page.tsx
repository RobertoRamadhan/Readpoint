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

const toArray = <T,>(value: unknown): T[] => {
  const data = (value as { data?: unknown } | null)?.data;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) return (data as { data: T[] }).data;
  return [];
};

const toStats = (value: unknown): SiswaStats | null => {
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

const coverUrl = (book?: Ebook | null) => normalizeFileUrl(book?.cover_image_url || book?.cover_image);
const rewardUrl = (reward?: Reward | null) => normalizeFileUrl(reward?.image_url || reward?.image);
const rupiahLike = (value: number) => value.toLocaleString('id-ID');

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
      const newStats = statsRes.status === 'fulfilled' ? toStats(statsRes.value) : null;
      const newEbooks = ebooksRes.status === 'fulfilled' ? toArray<Ebook>(ebooksRes.value) : [];
      const newRewards = rewardsRes.status === 'fulfilled' ? toArray<Reward>(rewardsRes.value) : [];
      const newQuizzes = quizzesRes.status === 'fulfilled' ? toArray<Quiz>(quizzesRes.value) : [];
      setStats(newStats);
      setEbooks(newEbooks);
      setRewards(newRewards);
      setQuizzes(newQuizzes);
      dashboardCache = { stats: newStats, ebooks: newEbooks, rewards: newRewards, quizzes: newQuizzes, cachedAt: Date.now() };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard siswa');
    } finally {
      setLoadingData(false);
    }
  };

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ebooks;
    return ebooks.filter((book) => `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query));
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
    <div className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[120px] shrink-0 flex-col items-center border-r border-[#eee7dc] bg-white px-4 py-5 lg:flex">
          <button onClick={() => setActiveTab('overview')} className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-950 text-sm font-black text-white shadow-lg">RP</button>
          <nav className="mt-9 flex flex-1 flex-col items-center gap-3">
            {tabs.map((tab) => <RailButton key={tab.key} tab={tab} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />)}
          </nav>
          <div className="mb-4 w-full rounded-[28px] border border-emerald-100 bg-emerald-50 p-3 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white">★</div>
            <p className="mt-2 text-[11px] font-black text-slate-900">Level 2</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${levelProgress}%` }} /></div>
            <p className="mt-2 text-[10px] font-black text-emerald-700">{rupiahLike(totalPoints)} poin</p>
          </div>
          <button onClick={handleLogout} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-lg font-black text-red-500 hover:bg-red-100" aria-label="Keluar">↪</button>
        </aside>

        <main className="min-w-0 flex-1 pb-28 lg:pb-0">
          <header className="sticky top-0 z-40 border-b border-[#eee7dc] bg-[#fbfaf7]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-4 lg:hidden">
                <div><h1 className="text-xl font-black leading-none">READPOINT</h1><p className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700">Dashboard Siswa</p></div>
                <Avatar name={user.name} />
              </div>
              <div className="hidden lg:block"><p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-700">READPOINT</p><h1 className="mt-1 text-3xl font-black tracking-tight">Halo, {user.name}</h1></div>
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-3xl">
                <SearchInput value={searchQuery} onChange={setSearchQuery} />
                <button className="hidden h-12 shrink-0 rounded-2xl border border-[#eee7dc] bg-white px-4 text-sm font-black text-slate-700 shadow-sm sm:block">ID</button>
                <button className="hidden h-12 w-12 shrink-0 rounded-2xl border border-[#eee7dc] bg-white text-lg shadow-sm sm:block">🔔</button>
                <div className="hidden lg:block"><Avatar name={user.name} withName /></div>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">{error}</div>}
            <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <StatCard title="Total Poin" value={rupiahLike(totalPoints)} helper="Siap ditukar" icon="✦" />
              <StatCard title="Buku Dibaca" value={stats?.books_read ?? 0} helper="Selesai dibaca" icon="▤" />
              <StatCard title="Halaman" value={rupiahLike(stats?.pages_read ?? 0)} helper="Total halaman" icon="◷" />
              <StatCard title="Kuis" value={stats?.quizzes_taken ?? 0} helper="Sudah dikerjakan" icon="◈" />
            </section>

            {loadingData ? <ContentBox><FullLoading text="Memuat data..." inline /></ContentBox> : (
              <>
                {activeTab === 'overview' && <Overview continueBook={continueBook} books={filteredBooks} rewards={rewards.slice(0, 4)} totalPoints={totalPoints} onRead={(id) => router.push(`/dashboard/siswa/read/${id}`)} onRedeem={redeemReward} setActiveTab={setActiveTab} />}
                {activeTab === 'ebooks' && <ContentBox title="Daftar E-Books" subtitle="Semua buku tersedia untuk dibaca siswa">{filteredBooks.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{filteredBooks.map((book) => <BookCard key={book.id} book={book} onClick={() => router.push(`/dashboard/siswa/read/${book.id}`)} />)}</div> : <EmptyState title="Buku tidak ditemukan" />}</ContentBox>}
                {activeTab === 'quizzes' && <ContentBox title="Daftar Kuis" subtitle="Kerjakan kuis untuk menambah poin">{quizzes.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{quizzes.slice(0, 6).map((quiz) => <QuizCard key={quiz.id} quiz={quiz} onClick={() => router.push(`/dashboard/siswa/quiz/${quiz.ebook_id || quiz.id}`)} />)}</div> : <EmptyState title="Belum ada kuis" />}</ContentBox>}
                {activeTab === 'rewards' && <ContentBox title="Daftar Rewards" subtitle="Tukar poin kamu dengan reward">{rewards.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{rewards.map((reward) => <RewardCard key={reward.id} reward={reward} totalPoints={totalPoints} onRedeem={() => redeemReward(reward.id)} />)}</div> : <EmptyState title="Belum ada reward" />}</ContentBox>}
                {activeTab === 'activity' && <ContentBox title="Aktivitas Terbaru" subtitle="Riwayat singkat aktivitas literasi"><ActivityList /></ContentBox>}
              </>
            )}
          </div>
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#eee7dc] bg-white/95 px-2 py-2 shadow-[0_-16px_40px_rgba(45,34,18,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-2xl px-2 py-2 text-center text-[10px] font-black transition ${activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-[#f6f2ea]'}`}><span className="block text-lg leading-none">{tab.icon}</span><span className="mt-1 block">{tab.label}</span></button>)}</div>
      </nav>
    </div>
  );
}

function RailButton({ tab, active, onClick }: { tab: { label: string; icon: string }; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex w-full flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-[10px] font-black transition ${active ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-[#f6f2ea] hover:text-slate-800'}`} title={tab.label}><span className="text-xl leading-none">{tab.icon}</span><span>{tab.label}</span></button>;
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-[#eee7dc] bg-white px-4 py-3 shadow-sm"><span className="mr-3 text-lg text-slate-400">⌕</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cari buku, penulis, atau kategori..." className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400" /></div>;
}

function Avatar({ name, withName = false }: { name: string; withName?: boolean }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'S';
  return <div className="flex items-center gap-3 rounded-2xl border border-[#eee7dc] bg-white px-3 py-2 shadow-sm">{withName && <div className="hidden min-w-0 text-right sm:block"><p className="max-w-[160px] truncate text-sm font-black leading-4 text-slate-900">{name}</p><p className="mt-1 text-xs font-semibold text-slate-500">Siswa</p></div>}<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{initial}</div></div>;
}

function StatCard({ title, value, helper, icon }: { title: string; value: number | string; helper: string; icon: string }) {
  return <div className="rounded-[24px] border border-[#eee7dc] bg-white p-4 shadow-[0_14px_35px_rgba(45,34,18,0.05)] sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-slate-400 sm:text-sm">{title}</p><p className="mt-2 truncate text-2xl font-black text-slate-950 sm:text-3xl">{value}</p></div><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f6f2ea] text-lg text-emerald-700">{icon}</div></div><p className="mt-2 text-xs font-bold text-emerald-700">{helper}</p></div>;
}

function Overview({ continueBook, books, rewards, totalPoints, onRead, onRedeem, setActiveTab }: { continueBook: Ebook | null; books: Ebook[]; rewards: Reward[]; totalPoints: number; onRead: (id: number) => void; onRedeem: (id: number) => void; setActiveTab: (tab: TabType) => void }) {
  const latest = books.slice(0, 8);
  const popular = books.slice(2, 10).length ? books.slice(2, 10) : latest;
  return <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="min-w-0 space-y-5"><ContinueCard book={continueBook} onRead={onRead} /><Shelf title="Terbaru" books={latest} onRead={onRead} onViewAll={() => setActiveTab('ebooks')} /><Shelf title="Direkomendasikan" books={latest} onRead={onRead} onViewAll={() => setActiveTab('ebooks')} /><Shelf title="Populer" books={popular} onRead={onRead} onViewAll={() => setActiveTab('ebooks')} /></div><aside className="min-w-0 space-y-5"><ContentBox title="Reward" action="Lihat semua →" onAction={() => setActiveTab('rewards')} compact>{rewards.length ? <div className="space-y-3">{rewards.map((reward) => <RewardRow key={reward.id} reward={reward} disabled={totalPoints < reward.points_required || reward.stock <= 0} onRedeem={() => onRedeem(reward.id)} />)}</div> : <EmptyState title="Belum ada reward" />}</ContentBox><ContentBox title="Aktivitas" action="Lihat semua →" onAction={() => setActiveTab('activity')} compact><ActivityList /></ContentBox></aside></div>;
}

function ContinueCard({ book, onRead }: { book: Ebook | null; onRead: (id: number) => void }) {
  if (!book) return <ContentBox><EmptyState title="Belum ada buku" /></ContentBox>;
  const cover = coverUrl(book);
  return <section className="overflow-hidden rounded-[32px] border border-[#eee7dc] bg-white shadow-[0_22px_55px_rgba(45,34,18,0.08)]"><div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[210px_minmax(0,1fr)]"><div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[26px] bg-[#f0eadf] shadow-lg lg:max-w-none">{cover ? <img src={cover} alt={book.title} className="aspect-[3/4] h-full w-full object-cover" /> : <Placeholder />}</div><div className="flex min-w-0 flex-col justify-between"><div><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">Lanjutkan Membaca</span><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{book.title}</h2><p className="mt-2 text-base font-semibold text-slate-500">{book.author}</p><div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3"><Info label="Kategori" value={book.category || 'Umum'} /><Info label="Halaman" value={`${book.pages || 0}`} /><Info label="Poin/hal" value={`${book.poin_per_halaman || 0}`} /></div></div><div className="mt-8"><div className="flex items-center justify-between text-xs font-black text-slate-500"><span>Progress baca</span><span>57%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#f0eadf]"><div className="h-full w-[57%] rounded-full bg-emerald-600" /></div><button onClick={() => onRead(book.id)} className="mt-5 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-700">Baca Sekarang</button></div></div></div></section>;
}

function Shelf({ title, books, onRead, onViewAll }: { title: string; books: Ebook[]; onRead: (id: number) => void; onViewAll: () => void }) {
  return <ContentBox title={title} subtitle="Koleksi buku yang bisa langsung kamu baca" action="Lihat semua →" onAction={onViewAll}>{books.length ? <div className="flex snap-x gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{books.map((book) => <BookCard key={`${title}-${book.id}`} book={book} onClick={() => onRead(book.id)} shelf />)}</div> : <EmptyState title="Belum ada buku" />}</ContentBox>;
}

function ContentBox({ title, subtitle, action, onAction, compact = false, children }: { title?: string; subtitle?: string; action?: string; onAction?: () => void; compact?: boolean; children: ReactNode }) {
  return <section className={`rounded-[28px] border border-[#eee7dc] bg-white ${compact ? 'p-5' : 'p-5 sm:p-6'} shadow-[0_18px_45px_rgba(45,34,18,0.06)]`}>{title && <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2>{subtitle && <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>}</div>{action && <button onClick={onAction} className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100">{action}</button>}</div>}<div className={title ? 'mt-5' : ''}>{children}</div></section>;
}

function BookCard({ book, onClick, shelf = false }: { book: Ebook; onClick: () => void; shelf?: boolean }) {
  const cover = coverUrl(book);
  return <article className={`${shelf ? 'w-[150px] shrink-0 snap-start sm:w-[178px] xl:w-[198px]' : 'min-w-0'} group`}><button onClick={onClick} className="block w-full text-left"><div className="overflow-hidden rounded-[24px] bg-[#f0eadf] shadow-[0_14px_32px_rgba(45,34,18,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">{cover ? <img src={cover} alt={book.title} className="aspect-[3/4] h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <Placeholder />}</div><h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug sm:text-base">{book.title}</h3><p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{book.author || 'Penulis tidak tersedia'}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full bg-[#f6f2ea] px-2 py-1 text-[10px] font-black text-slate-500">{book.pages || 0} hal</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">+{book.poin_per_halaman || 0}/hal</span></div></button></article>;
}

function Placeholder() {
  return <div className="flex aspect-[3/4] w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-[#f0eadf] text-4xl"><span>📘</span><span className="mt-3 text-xs font-black uppercase tracking-widest text-emerald-700">READPOINT</span></div>;
}

function RewardRow({ reward, disabled, onRedeem }: { reward: Reward; disabled: boolean; onRedeem: () => void }) {
  const image = rewardUrl(reward);
  return <div className="flex gap-3 rounded-2xl border border-[#eee7dc] bg-[#fbfaf7] p-3"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">{image ? <img src={image} alt={reward.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🎁</div>}</div><div className="min-w-0 flex-1"><h3 className="line-clamp-1 text-sm font-black">{reward.name}</h3><p className="mt-1 text-xs font-bold text-emerald-700">{rupiahLike(reward.points_required)} poin</p><button onClick={onRedeem} disabled={disabled} className="mt-2 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-black text-white disabled:bg-slate-200 disabled:text-slate-400">{disabled ? 'Terkunci' : 'Tukar'}</button></div></div>;
}

function RewardCard({ reward, totalPoints, onRedeem }: { reward: Reward; totalPoints: number; onRedeem: () => void }) {
  const image = rewardUrl(reward);
  const disabled = totalPoints < reward.points_required || reward.stock <= 0;
  return <div className="overflow-hidden rounded-[28px] border border-[#eee7dc] bg-white shadow-md"><div className="h-44 bg-[#f0eadf]">{image ? <img src={image} alt={reward.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl">🎁</div>}</div><div className="p-5"><h3 className="font-black">{reward.name}</h3><p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500">{reward.description}</p><div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fbfaf7] p-3 text-sm font-black"><span>{rupiahLike(reward.points_required)} poin</span><span>{reward.stock} stok</span></div><button onClick={onRedeem} disabled={disabled} className="mt-4 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400">{disabled ? 'Belum Bisa Ditukar' : 'Tukar Reward'}</button></div></div>;
}

function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-[26px] border border-[#eee7dc] bg-white p-5 text-left shadow-md transition hover:-translate-y-1 hover:bg-[#fbfaf7]"><p className="text-sm font-black text-emerald-700">Kuis Buku</p><h3 className="mt-2 line-clamp-2 text-lg font-black">{quiz.ebook_title || quiz.title || 'Kuis'}</h3><p className="mt-2 text-sm font-semibold text-slate-500">{quiz.total_questions || 5} soal • {quiz.points_reward || 50} poin</p><span className="mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">Mulai Kuis</span></button>;
}

function ActivityList() {
  const activities = [['Membaca 20 halaman', 'Si Pangeran Kecil', '+20 poin'], ['Menyelesaikan kuis', 'Perahu Kertas', '+50 poin'], ['Bonus login harian', 'Hari ini', '+15 poin'], ['Membaca 15 halaman', 'Harry Potter', '+15 poin']];
  return <div className="space-y-4">{activities.map(([title, subtitle, point]) => <div key={title} className="flex items-center justify-between gap-4 rounded-2xl bg-[#fbfaf7] p-3"><div className="flex min-w-0 items-center gap-3"><div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-50" /><div className="min-w-0"><p className="truncate text-sm font-black">{title}</p><p className="truncate text-xs font-semibold text-slate-500">{subtitle}</p></div></div><p className="shrink-0 text-xs font-black text-emerald-700">{point}</p></div>)}</div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#fbfaf7] p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div>;
}

function EmptyState({ title }: { title: string }) {
  return <div className="rounded-3xl border border-dashed border-[#e5dccf] bg-[#fbfaf7] p-8 text-center"><p className="text-3xl">📚</p><h3 className="mt-3 text-base font-black">{title}</h3><p className="mt-1 text-sm font-semibold text-slate-500">Data akan muncul setelah tersedia.</p></div>;
}

function FullLoading({ text, inline = false }: { text: string; inline?: boolean }) {
  return <div className={`flex items-center justify-center ${inline ? 'py-12' : 'min-h-screen bg-[#fbfaf7]'}`}><div className="text-center"><div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" /><p className="text-sm font-semibold text-emerald-700">{text}</p></div></div>;
}
