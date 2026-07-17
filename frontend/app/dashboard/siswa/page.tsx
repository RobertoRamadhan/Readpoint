'use client';
'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, CheckCircle2, Clock3, Gift, HelpCircle, History,
  Home, LogOut, Search, Sparkles, User, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { normalizeFileUrl } from '@/lib/file-url';
import s from './siswa-dashboard.module.css';

/* ── Types ──────────────────────────────────────────────────── */
type TabType = 'overview' | 'ebooks' | 'quizzes' | 'rewards' | 'account' | 'history';

interface SiswaStats { total_points: number; books_read: number; pages_read: number; quizzes_taken: number; }
interface Ebook {
  id: number; title: string; author: string; pages: number;
  poin_per_halaman: number; category: string;
  cover_image?: string; cover_image_url?: string;
  pdf_file?: string; pdf_file_url?: string;
}
interface Reward {
  id: number; name: string; description: string;
  points_required: number; stock: number;
  image?: string; image_url?: string;
}
interface Quiz {
  id: number; ebook_id?: number; ebook_title?: string; title?: string;
  total_questions?: number; points_reward?: number;
  already_attempted?: boolean; last_score?: number | null; passed?: boolean;
}
interface ReadingActivityItem {
  id: number; ebook_id: number; status: string;
  current_page: number; final_page?: number; duration_minutes: number;
  started_at: string; completed_at?: string;
  ebook?: { id: number; title: string; author: string; pages: number };
}
interface HistoryData {
  reading_history: Array<{
    id: number; type: 'reading';
    ebook?: { id: number; title: string; author: string; cover_image?: string };
    status: string; current_page: number; final_page?: number;
    duration_minutes: number; started_at: string; completed_at?: string;
    created_at: string;
    validation?: { status: string; validated_at: string; notes?: string };
  }>;
  quiz_history: Array<{
    id: number; type: 'quiz';
    ebook?: { id: number; title: string; author: string };
    score: number; correct_answers: number; total_questions: number;
    passed: boolean; created_at: string;
  }>;
  point_history: Array<{
    id: number; points: number; type: string; description: string; created_at: string;
  }>;
  redemption_history: Array<{
    id: number; claim_code: string; status: string; points_used: number;
    quantity: number; created_at: string; claimed_at?: string;
    reward?: { id: number; name: string; points_required: number };
  }>;
  summary: {
    total_reading: number; completed_reading: number; total_quiz_attempts: number;
    total_points_earned: number; total_points_used: number; total_redemptions: number;
  };
}

/* ── Cache & constants ──────────────────────────────────────── */
let dashboardCache: {
  stats: SiswaStats | null; ebooks: Ebook[]; rewards: Reward[];
  quizzes: Quiz[]; activities: ReadingActivityItem[]; cachedAt: number;
} | null = null;
const CACHE_TTL = 5 * 60 * 1000;

const tabs: Array<{ key: TabType; label: string; Icon: LucideIcon }> = [
  { key: 'overview', label: 'Beranda', Icon: Home },
  { key: 'ebooks',   label: 'Buku',    Icon: BookOpen },
  { key: 'quizzes',  label: 'Kuis',    Icon: CheckCircle2 },
  { key: 'rewards',  label: 'Hadiah',  Icon: Gift },
  { key: 'history',  label: 'Histori', Icon: History },
  { key: 'account',  label: 'Akun',    Icon: User },
];

const normalizeCover  = (b?: Ebook | null)  => normalizeFileUrl(b?.cover_image_url  || b?.cover_image);
const normalizeReward = (r?: Reward | null) => normalizeFileUrl(r?.image_url         || r?.image);
const fmtNum          = (v: number)         => v.toLocaleString('id-ID');

function getStats(val: unknown): SiswaStats | null {
  const r = val as { data?: unknown } | null;
  const p = r && 'data' in r ? r.data : val;
  if (!p || typeof p !== 'object') return null;
  const raw = p as Partial<SiswaStats>;
  return { total_points: Number(raw.total_points ?? 0), books_read: Number(raw.books_read ?? 0), pages_read: Number(raw.pages_read ?? 0), quizzes_taken: Number(raw.quizzes_taken ?? 0) };
}

function getArr<T>(val: unknown): T[] {
  const r = val as { data?: unknown } | null;
  const d = r?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && Array.isArray((d as { data?: unknown }).data)) return (d as { data: T[] }).data;
  return [];
}

const tabSubtitles: Record<TabType, string> = {
  overview: 'Dashboard Siswa',
  ebooks:   'Koleksi Buku',
  quizzes:  'Kuis Buku',
  rewards:  'Tukar Poin',
  history:  'Riwayat Aktivitas',
  account:  'Profil & Pengaturan',
};

/* ── Main dashboard component ───────────────────────────────── */
export default function SiswaDashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted]           = useState(false);
  const [activeTab, setActiveTab]       = useState<TabType>('overview');
  const [searchQuery, setSearchQuery]   = useState('');
  const [stats, setStats]               = useState<SiswaStats | null>(dashboardCache?.stats ?? null);
  const [ebooks, setEbooks]             = useState<Ebook[]>(dashboardCache?.ebooks ?? []);
  const [rewards, setRewards]           = useState<Reward[]>(dashboardCache?.rewards ?? []);
  const [quizzes, setQuizzes]           = useState<Quiz[]>(dashboardCache?.quizzes ?? []);
  const [activities, setActivities]     = useState<ReadingActivityItem[]>(dashboardCache?.activities ?? []);
  const [historyData, setHistoryData]   = useState<HistoryData | null>(null);
  const [historyLoading, setHLoading]   = useState(false);
  const [loadingData, setLoadingData]   = useState(!(dashboardCache && Date.now() - dashboardCache.cachedAt < CACHE_TTL));
  const [error, setError]               = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }
    const fresh = dashboardCache && Date.now() - dashboardCache.cachedAt < CACHE_TTL;
    if (fresh) {
      setStats(dashboardCache!.stats);
      setEbooks(dashboardCache!.ebooks);
      setRewards(dashboardCache!.rewards);
      setQuizzes(dashboardCache!.quizzes);
      setLoadingData(false);
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void loadData();
  }, [mounted, loading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setLoadingData(true); setError(null);
      const [sR, eR, rR, qR, aR] = await Promise.allSettled([
        api.dashboard.siswaStats(), api.ebooks.list(),
        api.rewards.list(), api.getAllQuizzes(), api.getMyActivities(),
      ]);
      const ns = sR.status === 'fulfilled' ? getStats(sR.value) : null;
      const ne = eR.status === 'fulfilled' ? getArr<Ebook>(eR.value)                : [];
      const nr = rR.status === 'fulfilled' ? getArr<Reward>(rR.value)               : [];
      const nq = qR.status === 'fulfilled' ? getArr<Quiz>(qR.value)                 : [];
      const na = aR.status === 'fulfilled' ? getArr<ReadingActivityItem>(aR.value)  : [];
      setStats(ns); setEbooks(ne); setRewards(nr); setQuizzes(nq); setActivities(na);
      dashboardCache = { stats: ns, ebooks: ne, rewards: nr, quizzes: nq, activities: na, cachedAt: Date.now() };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const loadHistory = async () => {
    if (historyData || historyLoading) return;
    try {
      setHLoading(true);
      const res = await api.dashboard.siswaHistory();
      const d = (res as any)?.data;
      if (d) setHistoryData(d as HistoryData);
    } catch { /* not critical */ } finally { setHLoading(false); }
  };

  useEffect(() => { if (activeTab === 'history') loadHistory(); }, [activeTab]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ebooks;
    return ebooks.filter((b) => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q));
  }, [ebooks, searchQuery]);

  const totalPoints     = stats?.total_points ?? 0;
  const ongoing         = activities.find((a) => a.status === 'ongoing') ?? activities[0] ?? null;
  const continueBook    = ongoing ? (ebooks.find((e) => e.id === ongoing.ebook_id) ?? ebooks[0] ?? null) : ebooks[0] ?? null;
  const continueProgress = ongoing && continueBook
    ? Math.min(100, Math.round((ongoing.current_page / (continueBook.pages || 1)) * 100))
    : 0;
  const levelProgress   = Math.min(100, Math.round((totalPoints / 500) * 100));

  const handleLogout = async () => { await logout(); router.push('/login'); };
  const redeemReward = async (id: number) => {
    try { await api.rewards.redeem(id, { quantity: 1 }); dashboardCache = null; fetchedRef.current = false; await loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Gagal menukar reward'); }
  };

  if (!mounted || loading) return <LoadingSpinner full />;
  if (!isAuthenticated || !user || user.role !== 'siswa') return null;

  return (
    <div className={s.shell}>
      <div className={s.body}>
        <DesktopRail
          activeTab={activeTab} levelProgress={levelProgress}
          totalPoints={totalPoints} onChangeTab={setActiveTab} onLogout={handleLogout}
        />
        <main className={s.main}>
          <PageHeader userName={user.name} subtitle={tabSubtitles[activeTab]} searchQuery={searchQuery} onSearch={setSearchQuery} />
          <div className={s.content}>
            {error && <div className={s.errorBanner}>{error}</div>}

            {activeTab === 'overview' && (
              <StatsGrid stats={stats} totalPoints={totalPoints} />
            )}

            {loadingData ? (
              <LoadingSpinner />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewScreen
                    continueBook={continueBook} continueProgress={continueProgress}
                    books={filteredBooks} rewards={rewards.slice(0, 4)}
                    totalPoints={totalPoints} activities={activities}
                    onRead={(id) => router.push(`/dashboard/siswa/read/${id}`)}
                    onRedeem={redeemReward} setActiveTab={setActiveTab}
                  />
                )}
                {activeTab === 'ebooks'  && <BooksScreen  books={filteredBooks} onRead={(id) => router.push(`/dashboard/siswa/read/${id}`)} />}
                {activeTab === 'quizzes' && <QuizzesScreen quizzes={quizzes}    onStart={(id) => router.push(`/dashboard/siswa/quiz/${id}`)} />}
                {activeTab === 'rewards' && <RewardsScreen rewards={rewards} totalPoints={totalPoints} onRedeem={redeemReward} activities={activities} />}
                {activeTab === 'history' && <HistoryScreen data={historyData} loading={historyLoading} />}
                {activeTab === 'account' && <AccountScreen userName={user.name} totalPoints={totalPoints} onNavigate={setActiveTab} onLogout={handleLogout} />}
              </>
            )}
          </div>
        </main>
      </div>
      <MobileTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

/* ── Desktop Rail ───────────────────────────────────────────── */
function DesktopRail({ activeTab, levelProgress, totalPoints, onChangeTab, onLogout }: {
  activeTab: TabType; levelProgress: number; totalPoints: number;
  onChangeTab: (t: TabType) => void; onLogout: () => void;
}) {
  return (
    <aside className={s.rail}>
      <button className={s.railLogo} onClick={() => onChangeTab('overview')}>RP</button>

      <nav className={s.railNav}>
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`${s.railBtn} ${activeTab === key ? s.railBtnActive : ''}`}
            onClick={() => onChangeTab(key)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={s.railPoints}>
        <div className={s.railPointsIcon}><Sparkles size={16} /></div>
        <p className={s.railPointsLabel}>Level 2</p>
        <div className={s.railPointsBar}>
          <div className={s.railPointsBarFill} style={{ width: `${levelProgress}%` }} />
        </div>
        <p className={s.railPointsValue}>{fmtNum(totalPoints)} poin</p>
      </div>

      <button className={s.railLogout} onClick={onLogout} title="Keluar">
        <LogOut size={18} />
      </button>
    </aside>
  );
}

/* ── Page Header ────────────────────────────────────────────── */
function PageHeader({ userName, subtitle, searchQuery, onSearch }: {
  userName: string; subtitle: string; searchQuery: string; onSearch: (v: string) => void;
}) {
  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <div className={s.headerTop}>
          <div className={s.headerBrand}>
            <h1 className={s.headerTitle}>READPOINT</h1>
            <p className={s.headerSubtitle}>{subtitle}</p>
          </div>
          <div className={s.headerAvatar}>
            {userName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
        </div>
        <div className={s.searchBar}>
          <Search size={16} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari buku, penulis, atau kategori..."
          />
        </div>
      </div>
    </header>
  );
}

/* ── Stats Grid ─────────────────────────────────────────────── */
function StatsGrid({ stats, totalPoints }: { stats: SiswaStats | null; totalPoints: number }) {
  const items: Array<{ label: string; value: string; helper: string; Icon: LucideIcon }> = [
    { label: 'Total Poin',   value: fmtNum(totalPoints),          helper: 'Siap ditukar',   Icon: Sparkles },
    { label: 'Buku Dibaca',  value: String(stats?.books_read ?? 0),  helper: 'Selesai',       Icon: BookOpen },
    { label: 'Halaman',      value: fmtNum(stats?.pages_read ?? 0),  helper: 'Total halaman', Icon: Clock3 },
    { label: 'Kuis',         value: String(stats?.quizzes_taken ?? 0), helper: 'Dikerjakan',  Icon: CheckCircle2 },
  ];
  return (
    <section className={s.statsSection}>
      <div className={s.statsSectionHead}>
        <h2 className={s.statsSectionTitle}>Ringkasan Literasi</h2>
        <p className={s.statsSectionDesc}>Pantau poin dan progres membaca kamu</p>
      </div>
      <div className={s.statsGrid}>
        {items.map(({ label, value, helper, Icon }) => (
          <div key={label} className={s.statCard}>
            <div className={s.statCardTop}>
              <p className={s.statCardLabel}>{label}</p>
              <div className={s.statCardIcon}><Icon size={16} /></div>
            </div>
            <p className={s.statCardValue}>{value}</p>
            <p className={s.statCardHelper}>{helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Overview Screen ────────────────────────────────────────── */
function OverviewScreen({ continueBook, continueProgress, books, rewards, totalPoints, activities, onRead, onRedeem, setActiveTab }: {
  continueBook: Ebook | null; continueProgress: number; books: Ebook[];
  rewards: Reward[]; totalPoints: number; activities: ReadingActivityItem[];
  onRead: (id: number) => void; onRedeem: (id: number) => void;
  setActiveTab: (t: TabType) => void;
}) {
  return (
    <div className={s.overviewGrid}>
      <div>
        <ContinueCard book={continueBook} progress={continueProgress} onRead={onRead} />
        <div style={{ marginTop: 16 }}>
          <Panel title="Buku Terbaru" subtitle="Koleksi yang bisa langsung kamu baca" action="Lihat semua →" onAction={() => setActiveTab('ebooks')}>
            {books.length > 0 ? (
              <div className={s.shelf}>
                {books.slice(0, 8).map((book) => (
                  <div key={book.id} className={s.bookCardShelf}>
                    <BookCard book={book} onClick={() => onRead(book.id)} />
                  </div>
                ))}
              </div>
            ) : <EmptyState title="Belum ada buku" />}
          </Panel>
        </div>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Panel title="Reward" action="Lihat semua →" onAction={() => setActiveTab('rewards')} compact>
          {rewards.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rewards.map((r) => (
                <RewardRow key={r.id} reward={r}
                  disabled={totalPoints < r.points_required || r.stock <= 0}
                  onRedeem={() => onRedeem(r.id)}
                />
              ))}
            </div>
          ) : <EmptyState title="Belum ada reward" />}
        </Panel>
        <Panel title="Aktivitas" action="Lihat semua →" onAction={() => setActiveTab('history')} compact>
          <ActivityList activities={activities} />
        </Panel>
      </aside>
    </div>
  );
}

/* ── Continue Card ──────────────────────────────────────────── */
function ContinueCard({ book, progress, onRead }: { book: Ebook | null; progress: number; onRead: (id: number) => void }) {
  if (!book) return (
    <Panel><EmptyState title="Belum ada buku" /></Panel>
  );
  const cover = normalizeCover(book);
  return (
    <section className={s.continueCard}>
      <div className={s.continueCardInner}>
        <div className={s.continueCover}>
          <SafeImage src={cover} alt={book.title} style={{ aspectRatio: '3/4', width: '100%', objectFit: 'cover' }} fallback={<BookPlaceholder />} />
        </div>
        <div className={s.continueInfo}>
          <div>
            <span className={s.continueBadge}>Lanjutkan Membaca</span>
            <h2 className={s.continueTitle}>{book.title}</h2>
            <p className={s.continueAuthor}>{book.author}</p>
          </div>
          <div className={s.continueProgressWrap}>
            {progress > 0 && (
              <>
                <div className={s.continueProgressLabel}>
                  <span>Progress baca</span><span>{progress}%</span>
                </div>
                <div className={s.continueProgressBar}>
                  <div className={s.continueProgressFill} style={{ width: `${progress}%` }} />
                </div>
              </>
            )}
            <button className={s.continueBtn} onClick={() => onRead(book.id)}>
              Baca Sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Panel ──────────────────────────────────────────────────── */
function Panel({ title, subtitle, action, onAction, compact = false, children }: {
  title?: string; subtitle?: string; action?: string; onAction?: () => void;
  compact?: boolean; children: ReactNode;
}) {
  return (
    <section className={`${s.panel} ${compact ? s.panelCompact : ''}`}>
      {title && (
        <div className={s.panelHead}>
          <div style={{ minWidth: 0 }}>
            <h2 className={s.panelTitle}>{title}</h2>
            {subtitle && <p className={s.panelSubtitle}>{subtitle}</p>}
          </div>
          {action && <button className={s.panelAction} onClick={onAction}>{action}</button>}
        </div>
      )}
      {children}
    </section>
  );
}

/* ── Books Screen ───────────────────────────────────────────── */
function BooksScreen({ books, onRead }: { books: Ebook[]; onRead: (id: number) => void }) {
  return (
    <Panel title="Semua E-Book" subtitle="Pilih buku dan mulai membaca">
      {books.length > 0 ? (
        <div className={s.booksGrid}>
          {books.map((book) => <BookCard key={book.id} book={book} onClick={() => onRead(book.id)} />)}
        </div>
      ) : <EmptyState title="Buku tidak ditemukan" />}
    </Panel>
  );
}

/* ── Book Card ──────────────────────────────────────────────── */
function BookCard({ book, onClick }: { book: Ebook; onClick: () => void }) {
  const cover = normalizeCover(book);
  return (
    <article className={s.bookCard}>
      <button onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}>
        <div className={s.bookCover}>
          <SafeImage src={cover} alt={book.title} style={{ aspectRatio: '3/4', width: '100%', objectFit: 'cover' }} fallback={<BookPlaceholder />} />
        </div>
        <h3 className={s.bookTitle}>{book.title}</h3>
        <p className={s.bookAuthor}>{book.author || 'Penulis tidak tersedia'}</p>
        <div className={s.bookTags}>
          <span className={`${s.bookTag} ${s.bookTagGray}`}>{book.pages || 0} hal</span>
          <span className={`${s.bookTag} ${s.bookTagGreen}`}>+{book.poin_per_halaman || 0}/hal</span>
        </div>
      </button>
    </article>
  );
}

/* ── Quizzes Screen ─────────────────────────────────────────── */
function QuizzesScreen({ quizzes, onStart }: { quizzes: Quiz[]; onStart: (id: number) => void }) {
  return (
    <Panel title="Kuis Buku" subtitle="Kerjakan kuis untuk menambah poin">
      {quizzes.length > 0 ? (
        <div className={s.quizGrid}>
          {quizzes.slice(0, 9).map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onClick={() => onStart(quiz.ebook_id || quiz.id)} />
          ))}
        </div>
      ) : <EmptyState title="Belum ada kuis tersedia" />}
    </Panel>
  );
}

/* ── Quiz Card ──────────────────────────────────────────────── */
function QuizCard({ quiz, onClick }: { quiz: Quiz; onClick: () => void }) {
  const attempted = quiz.already_attempted;
  const score = quiz.last_score;
  return (
    <button className={s.quizCard} onClick={onClick}>
      <div className={s.quizCardTop}>
        <span className={s.quizCardEyebrow}>Kuis Buku</span>
        {attempted && score != null && (
          <span className={`${s.quizCardScore} ${quiz.passed ? s.quizCardScorePass : s.quizCardScoreFail}`}>
            {quiz.passed ? '✓ ' : ''}{Math.round(score)}%
          </span>
        )}
      </div>
      <h3 className={s.quizCardTitle}>{quiz.ebook_title || quiz.title || 'Kuis'}</h3>
      <p className={s.quizCardMeta}>{quiz.total_questions || 5} soal • {quiz.points_reward || 50} poin</p>
      <span className={`${s.quizCardCta} ${attempted ? s.quizCardCtaRetry : s.quizCardCtaNew}`}>
        {attempted ? 'Kerjakan Lagi' : 'Mulai Kuis'}
      </span>
    </button>
  );
}

/* ── Rewards Screen ─────────────────────────────────────────── */
function RewardsScreen({ rewards, totalPoints, onRedeem, activities }: {
  rewards: Reward[]; totalPoints: number; onRedeem: (id: number) => void; activities: ReadingActivityItem[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={s.pointsBanner}>
        <p className={s.pointsBannerLabel}>Poin Kamu</p>
        <div className={s.pointsBannerRow}>
          <p className={s.pointsBannerValue}>{fmtNum(totalPoints)}</p>
          <span className={s.pointsBannerBadge}>{totalPoints > 0 ? 'Siap tukar' : 'Belum cukup'}</span>
        </div>
      </div>

      {rewards.length > 0 ? (
        <div className={s.rewardsGrid}>
          {rewards.map((r) => (
            <RewardCard key={r.id} reward={r} totalPoints={totalPoints} onRedeem={() => onRedeem(r.id)} />
          ))}
        </div>
      ) : <Panel><EmptyState title="Belum ada reward" /></Panel>}

      <Panel title="Riwayat Aktivitas" compact>
        <ActivityList activities={activities} />
      </Panel>
    </div>
  );
}

/* ── Reward Row (compact, sidebar) ──────────────────────────── */
function RewardRow({ reward, disabled, onRedeem }: { reward: Reward; disabled: boolean; onRedeem: () => void }) {
  const img = normalizeReward(reward);
  return (
    <div className={s.rewardRow}>
      <div className={s.rewardRowImg}>
        <SafeImage src={img} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Gift size={20} color="#059669" /></div>} />
      </div>
      <div className={s.rewardRowInfo}>
        <p className={s.rewardRowName}>{reward.name}</p>
        <p className={s.rewardRowPts}>{fmtNum(reward.points_required)} poin</p>
        <button
          className={`${s.rewardRowBtn} ${disabled ? s.rewardRowBtnLocked : ''}`}
          disabled={disabled} onClick={onRedeem}
        >
          {disabled ? 'Terkunci' : 'Tukar'}
        </button>
      </div>
    </div>
  );
}

/* ── Reward Card (full grid) ────────────────────────────────── */
function RewardCard({ reward, totalPoints, onRedeem }: { reward: Reward; totalPoints: number; onRedeem: () => void }) {
  const img = normalizeReward(reward);
  const disabled = totalPoints < reward.points_required || reward.stock <= 0;
  return (
    <div className={s.rewardCard}>
      <div className={s.rewardCardImg}>
        <SafeImage src={img} alt={reward.name} style={{ maxHeight: 140, objectFit: 'contain', padding: 12 }}
          fallback={<Gift size={36} color="#059669" />}
        />
      </div>
      <div className={s.rewardCardBody}>
        <div>
          <h3 className={s.rewardCardName}>{reward.name}</h3>
          <p className={s.rewardCardDesc}>{reward.description}</p>
        </div>
        <div className={s.rewardCardMeta}>
          <span>{fmtNum(reward.points_required)} poin</span>
          <span>{reward.stock} stok</span>
        </div>
        <button
          className={`${s.rewardCardBtn} ${disabled ? s.rewardCardBtnLocked : ''}`}
          disabled={disabled} onClick={onRedeem}
        >
          {disabled ? 'Belum Bisa Ditukar' : 'Tukar Reward'}
        </button>
      </div>
    </div>
  );
}

/* ── Account Screen ─────────────────────────────────────────── */
function AccountScreen({ userName, totalPoints, onNavigate, onLogout }: {
  userName: string; totalPoints: number; onNavigate: (t: TabType) => void; onLogout: () => void;
}) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className={s.accountProfile}>
        <div className={s.accountAvatar}>{userName?.charAt(0)?.toUpperCase() || 'S'}</div>
        <div style={{ minWidth: 0 }}>
          <p className={s.accountName}>{userName}</p>
          <p className={s.accountRole}>Siswa · READPOINT</p>
          <span className={s.accountPoinBadge}>{fmtNum(totalPoints)} poin</span>
        </div>
      </div>

      <div className={s.accountMenuList}>
        <AccountItem icon={<User size={18} />}    title="Profil Saya"          subtitle="Data akun siswa"          onClick={() => router.push('/dashboard/siswa/profile')} />
        <AccountItem icon={<History size={18} />} title="Riwayat Aktivitas"    subtitle="Baca, kuis, poin & reward" onClick={() => onNavigate('history')} />
        <AccountItem icon={<HelpCircle size={18} />} title="Bantuan"           subtitle="Cara pakai aplikasi"       onClick={() => alert('Hubungi guru atau admin untuk bantuan')} />
        <AccountItem icon={<LogOut size={18} />}  title="Logout"               subtitle="Keluar dari akun"          onClick={onLogout} danger />
      </div>
    </div>
  );
}

function AccountItem({ icon, title, subtitle, onClick, danger = false }: {
  icon: ReactNode; title: string; subtitle: string; onClick?: () => void; danger?: boolean;
}) {
  return (
    <button
      className={`${s.accountMenuItem} ${danger ? s.accountMenuItemDanger : ''}`}
      onClick={onClick}
    >
      <div className={`${s.accountMenuIcon} ${danger ? s.accountMenuIconDanger : ''}`}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p className={`${s.accountMenuTitle} ${danger ? s.accountMenuTitleDanger : ''}`}>{title}</p>
        <p className={s.accountMenuSub}>{subtitle}</p>
      </div>
    </button>
  );
}

/* ── Activity List ──────────────────────────────────────────── */
function ActivityList({ activities }: { activities: ReadingActivityItem[] }) {
  if (!activities?.length) return <EmptyState title="Belum ada aktivitas" />;
  const badge: Record<string, string> = {
    ongoing:            s.badgeBlue,
    pending_validation: s.badgeAmber,
    completed:          s.badgeGreen,
    rejected:           s.badgeRed,
  };
  const label: Record<string, string> = {
    ongoing: 'Sedang Baca', pending_validation: 'Menunggu Validasi',
    completed: 'Selesai',   rejected: 'Ditolak',
  };
  return (
    <div className={s.activityList}>
      {activities.slice(0, 10).map((a) => (
        <div key={a.id} className={s.activityItem}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className={s.activityTitle}>{a.ebook?.title ?? `Buku #${a.ebook_id}`}</p>
            <p className={s.activityMeta}>
              Hal {a.current_page}{a.final_page ? `→${a.final_page}` : ''} · {a.duration_minutes} menit
            </p>
          </div>
          <span className={`${s.badge} ${badge[a.status] ?? s.badgeGray}`}>
            {label[a.status] ?? a.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── History Screen ─────────────────────────────────────────── */
function HistoryScreen({ data, loading }: { data: HistoryData | null; loading: boolean }) {
  const [tab, setTab] = useState<'reading' | 'quiz' | 'points' | 'rewards'>('reading');
  if (loading) return <Panel><LoadingSpinner /></Panel>;
  if (!data)   return <Panel><EmptyState title="Riwayat belum tersedia" /></Panel>;

  const { reading_history, quiz_history, point_history, redemption_history, summary } = data;

  const summaryItems = [
    { label: 'Total Baca',       value: summary.total_reading },
    { label: 'Selesai',          value: summary.completed_reading },
    { label: 'Kuis Dikerjakan',  value: summary.total_quiz_attempts },
    { label: 'Poin Diperoleh',   value: fmtNum(summary.total_points_earned) },
    { label: 'Poin Dipakai',     value: fmtNum(summary.total_points_used) },
    { label: 'Reward Ditukar',   value: summary.total_redemptions },
  ];

  const historyTabs = [
    { key: 'reading' as const,  label: 'Baca',    count: summary.total_reading },
    { key: 'quiz'    as const,  label: 'Kuis',    count: summary.total_quiz_attempts },
    { key: 'points'  as const,  label: 'Poin',    count: point_history.length },
    { key: 'rewards' as const,  label: 'Reward',  count: summary.total_redemptions },
  ];

  const readStatus: Record<string, { label: string; cls: string }> = {
    ongoing:            { label: 'Sedang Baca',        cls: s.badgeBlue },
    pending_validation: { label: 'Menunggu Validasi',  cls: s.badgeAmber },
    completed:          { label: 'Selesai',            cls: s.badgeGreen },
    rejected:           { label: 'Ditolak',            cls: s.badgeRed },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary */}
      <div className={s.historySummary}>
        {summaryItems.map((item) => (
          <div key={item.label} className={s.historySummaryCard}>
            <p className={s.historySummaryValue}>{item.value}</p>
            <p className={s.historySummaryLabel}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className={s.historyTabBar}>
        {historyTabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`${s.historyTab} ${tab === t.key ? s.historyTabActive : ''}`}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Reading */}
      {tab === 'reading' && (
        <Panel title="Riwayat Membaca">
          {reading_history.length === 0 ? <EmptyState title="Belum ada riwayat membaca" /> : (
            <div className={s.historyList}>
              {reading_history.map((item) => {
                const st = readStatus[item.status] ?? { label: item.status, cls: s.badgeGray };
                return (
                  <div key={item.id} className={s.historyItem}>
                    <div className={s.historyItemTop}>
                      <div style={{ minWidth: 0 }}>
                        <p className={s.historyItemTitle}>{item.ebook?.title ?? `Buku #${item.id}`}</p>
                        <p className={s.historyItemSub}>{item.ebook?.author}</p>
                      </div>
                      <span className={`${s.badge} ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className={s.historyItemMeta}>
                      <span>Hal {item.current_page}{item.final_page ? `→${item.final_page}` : ''}</span>
                      <span>{item.duration_minutes} menit</span>
                      <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    {item.validation && (
                      <div className={`${s.historyValidation} ${item.validation.status === 'approved' ? s.historyValidationOk : s.historyValidationBad}`}>
                        Validasi: {item.validation.status === 'approved' ? '✓ Disetujui' : '✗ Ditolak'}
                        {item.validation.notes && ` — ${item.validation.notes}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {/* Quiz */}
      {tab === 'quiz' && (
        <Panel title="Riwayat Kuis">
          {quiz_history.length === 0 ? <EmptyState title="Belum ada riwayat kuis" /> : (
            <div className={s.historyList}>
              {quiz_history.map((item) => (
                <div key={item.id} className={s.historyItem}>
                  <div className={s.historyScoreRow}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className={s.historyItemTitle}>{item.ebook?.title ?? 'Kuis'}</p>
                      <p className={s.historyItemSub}>
                        {item.correct_answers}/{item.total_questions} benar · {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p className={`${s.historyScore} ${item.passed ? s.historyScorePass : s.historyScoreFail}`}>{Math.round(item.score)}%</p>
                      <p className={`${s.historyScoreLabel} ${item.passed ? s.historyScoreLabelPass : s.historyScoreLabelFail}`}>{item.passed ? 'Lulus' : 'Belum Lulus'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Points */}
      {tab === 'points' && (
        <Panel title="Riwayat Poin">
          {point_history.length === 0 ? <EmptyState title="Belum ada transaksi poin" /> : (
            <div className={s.historyList}>
              {point_history.map((item) => (
                <div key={item.id} className={s.historyItem}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p className={s.historyItemTitle}>{item.description}</p>
                      <p className={s.historyItemSub}>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`${s.pointAmount} ${item.points > 0 ? s.pointAmountPos : s.pointAmountNeg}`}>
                      {item.points > 0 ? '+' : ''}{fmtNum(item.points)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Redemptions */}
      {tab === 'rewards' && (
        <Panel title="Riwayat Penukaran Reward">
          {redemption_history.length === 0 ? <EmptyState title="Belum ada penukaran reward" /> : (
            <div className={s.historyList}>
              {redemption_history.map((item) => {
                const stCls = item.status === 'claimed' ? s.badgeGreen : item.status === 'expired' ? s.badgeGray : s.badgeAmber;
                const stLabel = item.status === 'claimed' ? 'Sudah Diambil' : item.status === 'expired' ? 'Kedaluwarsa' : 'Menunggu';
                return (
                  <div key={item.id} className={s.historyItem}>
                    <div className={s.historyItemTop}>
                      <div style={{ minWidth: 0 }}>
                        <p className={s.historyItemTitle}>{item.reward?.name ?? 'Reward'}</p>
                        <p className={s.historyItemSub}>{fmtNum(item.points_used)} poin · {item.quantity}x</p>
                      </div>
                      <span className={`${s.badge} ${stCls}`}>{stLabel}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={s.claimCode}>{item.claim_code}</span>
                      <span className={s.historyItemSub}>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

/* ── Mobile Tab Bar ─────────────────────────────────────────── */
function MobileTabBar({ activeTab, onChangeTab }: { activeTab: TabType; onChangeTab: (t: TabType) => void }) {
  return (
    <nav className={s.mobileBar}>
      <div className={s.mobileBarGrid}>
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`${s.mobileBarBtn} ${activeTab === key ? s.mobileBarBtnActive : ''}`}
            onClick={() => onChangeTab(key)}
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ── Shared utility components ──────────────────────────────── */
function EmptyState({ title }: { title: string }) {
  return (
    <div className={s.empty}>
      <BookOpen size={28} color="#94a3b8" />
      <p className={s.emptyTitle}>{title}</p>
      <p className={s.emptySub}>Data akan muncul setelah tersedia.</p>
    </div>
  );
}

function LoadingSpinner({ full = false }: { full?: boolean }) {
  return (
    <div className={`${s.loading} ${full ? s.loadingFull : ''}`}>
      <div className={s.loadingInner}>
        <div className={s.spinner} />
        <p className={s.loadingText}>Memuat...</p>
      </div>
    </div>
  );
}

function SafeImage({ src, alt, style, fallback }: {
  src?: string | null; alt: string; style?: React.CSSProperties; fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />;
}

function BookPlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '3/4', width: '100%', background: 'linear-gradient(135deg,#f0fdf4,#f1f5f9)', color: '#059669' }}>
      <BookOpen size={28} />
      <span style={{ marginTop: 6, fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>READPOINT</span>
    </div>
  );
}
