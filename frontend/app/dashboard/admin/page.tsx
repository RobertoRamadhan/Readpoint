'use client';

import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { normalizeFileUrl } from '@/lib/file-url';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Gift,
  GraduationCap,
  History,
  Library,
  ListChecks,
  Loader2,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings,
  Trash2,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import styles from './admin-dashboard.module.css';

type AdminTab = 'beranda' | 'ebooks' | 'rewards' | 'users' | 'kelas' | 'siswa' | 'admin' | 'histori' | 'pengaturan';
type Role = 'admin' | 'guru' | 'siswa';

type AdminStats = {
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
};

type Ebook = {
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
};

type Reward = {
  id: number;
  name: string;
  description?: string;
  points_required?: number;
  stock?: number;
  is_active?: boolean | number;
  image?: string;
  icon?: string;
};

type UserAccount = {
  id: number;
  name: string;
  email: string;
  role: Role | string;
  class_name?: string;
  grade_level?: string;
  profile_photo_url?: string;
};

type SchoolClass = {
  id: number | string;
  grade_level?: string;
  class_name?: string;
  teacher_id?: number;
  teacher_name?: string;
  teacher_email?: string;
  student_count?: number;
  students?: Array<{ id: number; name: string; email: string }>;
};

type TopStudent = {
  id: number;
  name: string;
  email: string;
  total_points?: number;
};

const CLASS_STORAGE_KEY = 'readpoint_admin_classes_v1';

const adminTabs = new Set<AdminTab>(['beranda', 'ebooks', 'rewards', 'users', 'kelas', 'siswa', 'admin', 'histori', 'pengaturan']);

function getClassStorageKey(item: Pick<SchoolClass, 'grade_level' | 'class_name'>): string {
  return `${item.grade_level ?? ''}|${item.class_name ?? ''}`.trim();
}

function getClassIdentity(item: Pick<SchoolClass, 'grade_level' | 'class_name'>): string {
  return getClassStorageKey(item);
}

function readStoredClasses(): SchoolClass[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLASS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is SchoolClass => !!item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

function writeStoredClasses(classes: SchoolClass[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(classes));
}

function mergeClasses(...sources: Array<SchoolClass[]>) {
  const map = new Map<string, SchoolClass>();

  sources.flat().forEach((item) => {
    const key = getClassIdentity(item) || String(item.id ?? '');
    if (!key) return;

    const existing = map.get(key);
    const mergedStudents = [...(existing?.students ?? []), ...(item.students ?? [])].filter((student, index, arr) => {
      const identity = `${student.name ?? ''}|${student.email ?? ''}`;
      return arr.findIndex((candidate) => `${candidate.name ?? ''}|${candidate.email ?? ''}` === identity) === index;
    });

    map.set(key, {
      ...(existing ?? {}),
      ...item,
      id: existing?.id ?? item.id ?? key,
      grade_level: item.grade_level || existing?.grade_level || '',
      class_name: item.class_name || existing?.class_name || '',
      teacher_id: item.teacher_id ?? existing?.teacher_id,
      teacher_name: item.teacher_name || existing?.teacher_name || '',
      teacher_email: item.teacher_email || existing?.teacher_email || '',
      student_count: Math.max(Number(existing?.student_count ?? 0), Number(item.student_count ?? 0), mergedStudents.length),
      students: mergedStudents,
    });
  });

  return Array.from(map.values()).filter((item) => item.grade_level || item.class_name);
}

function upsertStoredClass(nextClass: SchoolClass): SchoolClass {
  const normalized = {
    ...nextClass,
    id: String(nextClass.id ?? getClassStorageKey(nextClass)),
  };
  const existing = readStoredClasses();
  const index = existing.findIndex((item) => String(item.id) === String(normalized.id) || getClassStorageKey(item) === getClassStorageKey(normalized));

  if (index >= 0) {
    existing[index] = { ...existing[index], ...normalized };
  } else {
    existing.push(normalized);
  }

  writeStoredClasses(existing);
  return normalized;
}

function normalizeAdminTab(tab: string | null): AdminTab {
  return tab && adminTabs.has(tab as AdminTab) ? (tab as AdminTab) : 'beranda';
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const first = record(response);
  if (!first) return [];
  if (Array.isArray(first.data)) return first.data as T[];
  if (Array.isArray(first.items)) return first.items as T[];
  const data = record(first.data);
  if (data && Array.isArray(data.data)) return data.data as T[];
  if (data && Array.isArray(data.items)) return data.items as T[];
  return [];
}

function extractStats(response: unknown): AdminStats {
  const first = record(response);
  if (!first) return {};
  const data = record(first.data);
  return (data || first) as AdminStats;
}

function n(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function fmt(value: unknown): string {
  return n(value).toLocaleString('id-ID');
}

function active(value: boolean | number | undefined): boolean {
  return value === undefined || value === true || value === 1;
}

function errText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function LoadingScreen() {
  return (
    <div className={styles.loading}>
      <div>
        <Loader2 className="mx-auto mb-3 animate-spin text-emerald-700" size={34} />
        Memuat dashboard admin...
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = normalizeAdminTab(searchParams.get('tab'));
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({});
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) router.replace('/login');
  }, [loading, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    let ignore = false;

    async function load() {
      try {
        setDataLoading(true);
        setError('');
        const [statsRes, topRes] = await Promise.all([
          api.dashboard.adminStats(),
          api.dashboard.adminTopStudents(),
        ]);
        if (ignore) return;
        setStats(extractStats(statsRes));
        setTopStudents(extractArray<TopStudent>(topRes));
      } catch (error) {
        if (!ignore) setError(errText(error, 'Gagal memuat data dashboard'));
      } finally {
        if (!ignore) setDataLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.role]);

  if (loading || !mounted || user?.role !== 'admin') return null;

  return (
    <div className={styles.page}>
      <button type="button" className={styles.mobileMenuButton} onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
        <Menu size={22} />
      </button>
      {sidebarOpen && <button type="button" className={styles.backdrop} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu" />}

      <AdminSidebar activeTab={activeTab} sidebarOpen={sidebarOpen} onTabChange={() => undefined} onCloseSidebar={() => setSidebarOpen(false)} role="admin" user={user} />

      <main className={styles.content}>
        {error && <div className={styles.alert}>{error}</div>}
        {activeTab === 'beranda' && <Overview stats={stats} topStudents={topStudents} loading={dataLoading} />}
        {activeTab === 'ebooks' && <EbooksTab />}
        {activeTab === 'rewards' && <RewardsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'kelas' && <ClassesTab />}
        {activeTab === 'siswa' && <StudentsTab />}
        {activeTab === 'admin' && <AdminsTab />}
        {activeTab === 'histori' && <HistoriTab />}
        {activeTab === 'pengaturan' && <SettingsTab refreshUser={refreshUser} />}
      </main>
    </div>
  );
}

function Overview({ stats, topStudents, loading }: { stats: AdminStats; topStudents: TopStudent[]; loading: boolean }) {
  if (loading) return <LoadingScreen />;

  const totalSiswa = n(stats.total_siswa);
  const totalGuru = n(stats.total_guru);
  const totalEbook = n(stats.total_ebook ?? stats.total_ebooks ?? stats.total_books);
  const totalReward = n(stats.total_reward ?? stats.total_rewards);
  const todayActive = n(stats.siswa_aktif_hari_ini);
  const todayBooks = n(stats.buku_dibaca_hari_ini);
  const todayQuiz = n(stats.kuis_dikerjakan_hari_ini);
  const todayReward = n(stats.reward_diklaim_hari_ini);
  const todayTotal = todayActive + todayBooks + todayQuiz + todayReward;
  const totalUsers = totalSiswa + totalGuru;

  const metrics = [
    { title: 'Total Siswa', value: totalSiswa, desc: 'Akun siswa yang terdaftar di sistem.', Icon: GraduationCap },
    { title: 'Total Guru', value: totalGuru, desc: 'Guru yang mengelola kelas dan validasi.', Icon: Users },
    { title: 'E-Book', value: totalEbook, desc: 'Koleksi bacaan digital untuk siswa.', Icon: BookOpen },
    { title: 'Reward', value: totalReward, desc: 'Hadiah yang dapat ditukar dengan poin.', Icon: Gift },
  ];

  const today = [
    { title: 'Siswa Aktif', value: todayActive, desc: 'Akun siswa yang aktif hari ini.', Icon: Activity },
    { title: 'Buku Dibaca', value: todayBooks, desc: 'E-book yang dibuka/dibaca hari ini.', Icon: Library },
    { title: 'Kuis Dikerjakan', value: todayQuiz, desc: 'Attempt kuis yang masuk hari ini.', Icon: ListChecks },
    { title: 'Reward Diklaim', value: todayReward, desc: 'Penukaran reward hari ini.', Icon: PackageCheck },
  ];

  return (
    <div className={styles.stack}>
      <section className={styles.hero}>
        <div>
          <div className={styles.badge}>Dashboard Admin</div>
          <h1 className={styles.heroTitle}>Kontrol literasi sekolah dalam satu panel.</h1>
          <p className={styles.heroText}>Pantau siswa, guru, e-book, reward, dan aktivitas harian READPOINT dengan tampilan yang rapi dan mudah dibaca.</p>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.heroPanelTop}>
            <div>
              <p className={styles.kicker}>Aktivitas Hari Ini</p>
              <p className={styles.bigNumber}>{fmt(todayTotal)}</p>
            </div>
            <div className={styles.accountPill}>
              <p>Total Akun</p>
              <p>{fmt(totalUsers)}</p>
            </div>
          </div>
          <div className={styles.heroMiniGrid}>
            {today.map((item) => (
              <div key={item.title} className={styles.heroMiniCard}>
                <p>{item.title}</p>
                <p>{fmt(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.metricGrid}>
        {metrics.map((item) => <Metric key={item.title} {...item} />)}
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.panel}>
          <PanelHeader eyebrow="Monitoring" title="Aktivitas hari ini" Icon={Activity} />
          <div className={styles.todayGrid}>
            {today.map((item) => <TodayCard key={item.title} {...item} />)}
          </div>
        </div>
        <div className={styles.panel}>
          <PanelHeader eyebrow="Leaderboard" title="Siswa teratas" Icon={Trophy} />
          <div className={styles.leaderList}>
            {topStudents.length === 0 ? <Empty text="Belum ada data siswa." /> : topStudents.slice(0, 5).map((student, index) => (
              <div key={student.id} className={styles.leaderItem}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={styles.rank}>{index + 1}</span>
                  <div className="min-w-0">
                    <p className={styles.leaderName}>{student.name}</p>
                    <p className={styles.leaderEmail}>{student.email}</p>
                  </div>
                </div>
                <div>
                  <p className={styles.pointsText}>{fmt(student.total_points)}</p>
                  <p className={styles.mutedText}>poin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.priorityGrid}>
        <Priority Icon={BookOpen} title="Koleksi Buku" desc="Pastikan cover, PDF, dan poin baca sudah lengkap sebelum dipublikasikan." />
        <Priority Icon={Gift} title="Reward Sekolah" desc="Pantau stok hadiah agar penukaran siswa tetap lancar." />
        <Priority Icon={ClipboardList} title="Data Pengguna" desc="Rapikan akun siswa, guru, dan admin sesuai kelas dan role." />
      </section>
    </div>
  );
}

function Metric({ title, value, desc, Icon }: { title: string; value: number; desc: string; Icon: LucideIcon }) {
  return (
    <article className={styles.metricCard}>
      <span className={`${styles.iconBox} ${styles.metricIcon}`}><Icon size={21} /></span>
      <p className={styles.metricLabel}>{title}</p>
      <p className={styles.metricValue}>{fmt(value)}</p>
      <p className={styles.metricHelp}>{desc}</p>
    </article>
  );
}

function TodayCard({ title, value, desc }: { title: string; value: number; desc: string; Icon: LucideIcon }) {
  return <article className={styles.todayCard}><p>{title}</p><p>{fmt(value)}</p><p>{desc}</p></article>;
}

function PanelHeader({ eyebrow, title, Icon }: { eyebrow: string; title: string; Icon: LucideIcon }) {
  return <div className={styles.panelHeader}><div><p className={styles.panelEyebrow}>{eyebrow}</p><h2 className={styles.panelTitle}>{title}</h2></div><span className={styles.iconBox}><Icon size={22} /></span></div>;
}

function Priority({ Icon, title, desc }: { Icon: LucideIcon; title: string; desc: string }) {
  return <article className={styles.priorityCard}><span className={styles.iconBox}><Icon size={21} /></span><h3>{title}</h3><p>{desc}</p></article>;
}

function SectionHeader({ eyebrow, title, desc, Icon }: { eyebrow: string; title: string; desc: string; Icon: LucideIcon }) {
  return <div className={styles.sectionHeader}><div><p className={styles.sectionEyebrow}>{eyebrow}</p><h1 className={styles.sectionTitle}>{title}</h1><p className={styles.sectionDescription}>{desc}</p></div><span className={styles.iconBox}><Icon size={24} /></span></div>;
}

function Empty({ text }: { text: string }) {
  return <div className={styles.empty}>{text}</div>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className={styles.searchWrap}><Search className={styles.searchIcon} size={18} /><input className={`${styles.input} ${styles.searchInput}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>;
}

function Status({ value }: { value?: boolean | number }) {
  return <span className={styles.statusBadge}>{active(value) ? 'Aktif' : 'Nonaktif'}</span>;
}

function ErrorBox({ message }: { message: string }) {
  return message ? <div className={styles.alert}>{message}</div> : null;
}

function EbooksTab() {
  const [items, setItems] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ebook | null>(null);

  async function load() {
    try { setLoading(true); setError(''); setItems(extractArray<Ebook>(await api.ebooks.list())); }
    catch (error) { setError(errText(error, 'Gagal memuat e-book')); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((x) => `${x.title} ${x.author ?? ''} ${x.category ?? ''}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function remove(id: number) {
    if (!confirm('Hapus e-book ini?')) return;
    try { await api.ebooks.delete(id); await load(); } catch (error) { setError(errText(error, 'Gagal menghapus e-book')); }
  }

  return <div><SectionHeader eyebrow="Manajemen Konten" title="Kelola E-Book" desc="Tambah, edit, cari, dan hapus koleksi bacaan digital." Icon={BookOpen} /><div className={styles.managementShell}>{formOpen && <EbookForm editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><SearchBox value={query} onChange={setQuery} placeholder="Cari e-book..." />{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah E-Book</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat e-book...</div> : filtered.length === 0 ? <Empty text="E-book belum ditemukan." /> : <div className={styles.cardGrid}>{filtered.map((book) => <BookCard key={book.id} book={book} onEdit={() => { setEditing(book); setFormOpen(true); }} onDelete={() => remove(book.id)} />)}</div>}</div></div>;
}

function BookCard({ book, onEdit, onDelete }: { book: Ebook; onEdit: () => void; onDelete: () => void }) {
  const cover = book.cover_image || book.cover_url;
  const pdf = book.pdf_file || book.pdf_url;
  return <article className={styles.itemCard}><div><div className={styles.cover}>{cover ? <img src={normalizeFileUrl(cover)} alt={book.title} /> : <div className={styles.coverFallback}>📚</div>}</div>{pdf && <a className={styles.smallButton} href={normalizeFileUrl(pdf)} target="_blank" rel="noreferrer">PDF</a>}</div><div className={styles.cardBody}><div className={styles.cardTop}><div className="min-w-0"><h3 className={styles.itemTitle}>{book.title}</h3><p className={styles.itemMeta}>{book.author || '-'}</p></div><Status value={book.is_active} /></div><p className={styles.itemMeta}>{fmt(book.pages)} halaman</p><p className={styles.itemMeta}>🏷️ {book.category || '-'}</p><p className={styles.itemMeta}>⭐ {fmt(book.poin_per_halaman)} poin/halaman</p><div className={styles.cardActions}><button className={styles.editButton} onClick={onEdit}>Edit</button><button className={styles.dangerButton} onClick={onDelete}><Trash2 size={13} />Hapus</button></div></div></article>;
}

function EbookForm({ editing, onClose, onSaved }: { editing: Ebook | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [data, setData] = useState({ title: editing?.title || '', author: editing?.author || '', pages: n(editing?.pages) || 100, category: editing?.category || '', poin_per_halaman: n(editing?.poin_per_halaman) || 5, grade_level: editing?.grade_level || '1', pdf_file: null as File | null, cover_image: null as File | null });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (!data.title || !data.author || !data.category) return setError('Judul, pengarang, dan kategori wajib diisi');
    if (!editing && !data.pdf_file) return setError('PDF wajib diupload untuk e-book baru');
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => { if (value !== null) fd.append(key, value instanceof File ? value : String(value)); });
    try { setSaving(true); editing ? await api.ebooks.update(editing.id, fd) : await api.ebooks.create(fd); await onSaved(); onClose(); }
    catch (error) { setError(errText(error, 'Gagal menyimpan e-book')); }
    finally { setSaving(false); }
  }

  return <FormBox title={editing ? 'Edit E-Book' : 'Tambah E-Book'} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Judul Buku"><input className={styles.input} value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} /></Field><Field label="Pengarang"><input className={styles.input} value={data.author} onChange={(e) => setData({ ...data, author: e.target.value })} /></Field><Field label="Halaman"><input className={styles.input} type="number" value={data.pages} onChange={(e) => setData({ ...data, pages: Number(e.target.value) })} /></Field><Field label="Kategori"><input className={styles.input} value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} /></Field><Field label="Poin/Halaman"><input className={styles.input} type="number" value={data.poin_per_halaman} onChange={(e) => setData({ ...data, poin_per_halaman: Number(e.target.value) })} /></Field><Field label="Kelas"><select className={styles.select} value={data.grade_level} onChange={(e) => setData({ ...data, grade_level: e.target.value })}><option value="1">Kelas 1</option><option value="2">Kelas 2</option><option value="3">Kelas 3</option><option value="all">Semua Kelas</option></select></Field><Field label="PDF"><input className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={(e: ChangeEvent<HTMLInputElement>) => setData({ ...data, pdf_file: e.target.files?.[0] || null })} /></Field><Field label="Cover"><input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setData({ ...data, cover_image: e.target.files?.[0] || null })} /></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
}

function RewardsTab() {
  const [items, setItems] = useState<Reward[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState<Reward | null>(null);
  async function load() { try { setLoading(true); setError(''); setItems(extractArray<Reward>(await api.rewards.list())); } catch (error) { setError(errText(error, 'Gagal memuat reward')); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => items.filter((x) => `${x.name} ${x.description ?? ''}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  async function remove(id: number) { if (!confirm('Hapus reward ini?')) return; try { await api.rewards.delete(id); await load(); } catch (error) { setError(errText(error, 'Gagal menghapus reward')); } }
  return <div><SectionHeader eyebrow="Manajemen Hadiah" title="Kelola Reward" desc="Atur hadiah, stok, dan poin penukaran siswa." Icon={Gift} /><div className={styles.managementShell}>{formOpen && <RewardForm editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><SearchBox value={query} onChange={setQuery} placeholder="Cari reward..." />{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah Reward</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat reward...</div> : filtered.length === 0 ? <Empty text="Reward belum ditemukan." /> : <div className={styles.cardGrid}>{filtered.map((reward) => <RewardCard key={reward.id} reward={reward} onEdit={() => { setEditing(reward); setFormOpen(true); }} onDelete={() => remove(reward.id)} />)}</div>}</div></div>;
}

function RewardCard({ reward, onEdit, onDelete }: { reward: Reward; onEdit: () => void; onDelete: () => void }) {
  return <article className={styles.itemCard}><div className={styles.cover}>{reward.image ? <img src={normalizeFileUrl(reward.image)} alt={reward.name} /> : <div className={styles.coverFallback}>{reward.icon || '🎁'}</div>}</div><div className={styles.cardBody}><div className={styles.cardTop}><div className="min-w-0"><h3 className={styles.itemTitle}>{reward.name}</h3><p className={styles.itemDescription}>{reward.description || '-'}</p></div><Status value={reward.is_active} /></div><p className={styles.itemMeta}>{fmt(reward.points_required)} poin</p><p className={styles.itemMeta}>{fmt(reward.stock)} tersedia</p><div className={styles.cardActions}><button className={styles.editButton} onClick={onEdit}>Edit</button><button className={styles.dangerButton} onClick={onDelete}><Trash2 size={13} />Hapus</button></div></div></article>;
}

function RewardForm({ editing, onClose, onSaved }: { editing: Reward | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [data, setData] = useState({ name: editing?.name || '', description: editing?.description || '', points_required: n(editing?.points_required) || 100, stock: n(editing?.stock) || 0, image: null as File | null }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); if (!data.name || !data.description) return setError('Nama dan deskripsi wajib diisi'); const fd = new FormData(); Object.entries(data).forEach(([key, value]) => { if (value !== null && value !== undefined) fd.append(key, value instanceof File ? value : String(value)); }); try { setSaving(true); editing ? await api.rewards.update(editing.id, fd) : await api.rewards.create(fd); await onSaved(); onClose(); } catch (error) { setError(errText(error, 'Gagal menyimpan reward')); } finally { setSaving(false); } }
  return <FormBox title={editing ? 'Edit Reward' : 'Tambah Reward'} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Nama Reward"><input className={styles.input} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} /></Field><Field label="Poin"><input className={styles.input} type="number" value={data.points_required} onChange={(e) => setData({ ...data, points_required: Number(e.target.value) })} /></Field><Field label="Stok"><input className={styles.input} type="number" value={data.stock} onChange={(e) => setData({ ...data, stock: Number(e.target.value) })} /></Field><Field label="Gambar"><input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setData({ ...data, image: e.target.files?.[0] || null })} /></Field><Field label="Deskripsi" full><textarea className={styles.textarea} value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} /></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
}

function UsersTab() {
  const [items, setItems] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      setItems(extractArray<UserAccount>(await api.users.list()).filter((x) => x.role === 'guru'));
    } catch (error) {
      setError(errText(error, 'Gagal memuat guru'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((x) => `${x.name} ${x.email} ${x.class_name ?? ''}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function remove(id: number) {
    if (!confirm('Hapus akun guru ini?')) return;
    try {
      await api.users.delete(id);
      await load();
    } catch (error: any) {
      // Check if error is due to existing activity records
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('existing activity records') || errorMsg.includes('foreign key') || errorMsg.includes('Cannot delete')) {
        // Ask for force delete confirmation
        if (confirm('Guru ini memiliki data aktivitas. Hapus permanen termasuk semua data terkait?')) {
          try {
            await api.users.delete(id, { force: true });
            await load();
            return;
          } catch (forceError) {
            setError(errText(forceError, 'Gagal menghapus guru secara permanen'));
            return;
          }
        }
      }
      setError(errText(error, 'Gagal menghapus guru'));
    }
  }

  return <div><SectionHeader eyebrow="Manajemen Akun" title="Daftar Guru" desc="Tambah, edit, cari, dan hapus akun guru." Icon={Users} /><div className={styles.managementShell}>{formOpen && <UserForm role="guru" editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><SearchBox value={query} onChange={setQuery} placeholder="Cari guru..." />{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah Guru</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat guru...</div> : filtered.length === 0 ? <Empty text="Guru belum ditemukan." /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>{filtered.map((u) => <tr key={u.id}><td><div className={styles.avatarCell}><span className={styles.avatar}>{u.profile_photo_url ? <img src={u.profile_photo_url} alt={u.name} /> : u.name.charAt(0).toUpperCase()}</span>{u.name}</div></td><td>{u.email}</td><td><span className={styles.roleBadge}>{u.role}</span></td><td>{u.class_name || '-'}</td><td><div className={styles.cardActions}><button className={styles.editButton} onClick={() => { setEditing(u); setFormOpen(true); }}>Edit</button><button className={styles.dangerButton} onClick={() => remove(u.id)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</div></div>;
}

function StudentsTab() {
  const [items, setItems] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      setItems(extractArray<UserAccount>(await api.users.list()).filter((x) => x.role === 'siswa'));
    } catch (error) {
      setError(errText(error, 'Gagal memuat siswa'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((x) => `${x.name} ${x.email} ${x.class_name ?? ''}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function remove(id: number) {
    if (!confirm('Hapus akun siswa ini?')) return;
    try {
      await api.users.delete(id);
      await load();
    } catch (error: any) {
      // Check if error is due to existing activity records
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('existing activity records') || errorMsg.includes('foreign key') || errorMsg.includes('Cannot delete')) {
        // Ask for force delete confirmation
        if (confirm('Siswa ini memiliki data aktivitas. Hapus permanen termasuk semua data terkait (reading progress, quiz, points)?')) {
          try {
            await api.users.delete(id, { force: true });
            await load();
            return;
          } catch (forceError) {
            setError(errText(forceError, 'Gagal menghapus siswa secara permanen'));
            return;
          }
        }
      }
      setError(errText(error, 'Gagal menghapus siswa'));
    }
  }

  return <div><SectionHeader eyebrow="Manajemen Akun" title="Daftar Siswa" desc="Tambah, edit, cari, dan hapus akun siswa." Icon={Users} /><div className={styles.managementShell}>{formOpen && <UserForm role="siswa" editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><SearchBox value={query} onChange={setQuery} placeholder="Cari siswa..." />{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah Siswa</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat siswa...</div> : filtered.length === 0 ? <Empty text="Siswa belum ditemukan." /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>{filtered.map((u) => <tr key={u.id}><td><div className={styles.avatarCell}><span className={styles.avatar}>{u.profile_photo_url ? <img src={u.profile_photo_url} alt={u.name} /> : u.name.charAt(0).toUpperCase()}</span>{u.name}</div></td><td>{u.email}</td><td><span className={styles.roleBadge}>{u.role}</span></td><td>{u.class_name || '-'}</td><td><div className={styles.cardActions}><button className={styles.editButton} onClick={() => { setEditing(u); setFormOpen(true); }}>Edit</button><button className={styles.dangerButton} onClick={() => remove(u.id)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</div></div>;
}

function AdminsTab() {
  const [items, setItems] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      setItems(extractArray<UserAccount>(await api.users.list()).filter((x) => x.role === 'admin'));
    } catch (error) {
      setError(errText(error, 'Gagal memuat admin'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((x) => `${x.name} ${x.email}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function remove(id: number) {
    if (!confirm('Hapus akun admin ini?')) return;
    try {
      await api.users.delete(id);
      await load();
    } catch (error: any) {
      // Check if error is due to existing activity records
      const errorMsg = error?.message || String(error);
      if (errorMsg.includes('existing activity records') || errorMsg.includes('foreign key') || errorMsg.includes('Cannot delete')) {
        // Ask for force delete confirmation
        if (confirm('Admin ini memiliki data terkait. Hapus permanen termasuk semua data?')) {
          try {
            await api.users.delete(id, { force: true });
            await load();
            return;
          } catch (forceError) {
            setError(errText(forceError, 'Gagal menghapus admin secara permanen'));
            return;
          }
        }
      }
      setError(errText(error, 'Gagal menghapus admin'));
    }
  }

  return <div><SectionHeader eyebrow="Manajemen Akun" title="Daftar Admin" desc="Tambah, edit, cari, dan hapus akun admin." Icon={Users} /><div className={styles.managementShell}>{formOpen && <UserForm role="admin" editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><SearchBox value={query} onChange={setQuery} placeholder="Cari admin..." />{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah Admin</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat admin...</div> : filtered.length === 0 ? <Empty text="Admin belum ditemukan." /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead><tbody>{filtered.map((u) => <tr key={u.id}><td><div className={styles.avatarCell}><span className={styles.avatar}>{u.profile_photo_url ? <img src={u.profile_photo_url} alt={u.name} /> : u.name.charAt(0).toUpperCase()}</span>{u.name}</div></td><td>{u.email}</td><td><span className={styles.roleBadge}>{u.role}</span></td><td><div className={styles.cardActions}><button className={styles.editButton} onClick={() => { setEditing(u); setFormOpen(true); }}>Edit</button><button className={styles.dangerButton} onClick={() => remove(u.id)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</div></div>;
}

function UserForm({ editing, onClose, onSaved, role }: { editing: UserAccount | null; onClose: () => void; onSaved: () => Promise<void>; role: 'guru' | 'siswa' | 'admin' }) {
  const [data, setData] = useState({ name: editing?.name || '', email: editing?.email || '', role: editing?.role || role, class_name: editing?.class_name || '', grade_level: editing?.grade_level || '', class_id: '', password: '', password_confirmation: '' });
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [classQuery, setClassQuery] = useState('');
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredClasses = useMemo(() => {
    const query = classQuery.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((item) => `${item.grade_level ?? ''} ${item.class_name ?? ''}`.toLowerCase().includes(query));
  }, [classQuery, classes]);

  useEffect(() => {
    async function loadClasses() {
      try {
        const response = await api.users.list();
        const users = Array.isArray(response?.data) ? response.data : [];
        const seenStudentKeys = new Set<string>();
        const seenTeacherKeys = new Set<string>();
        const grouped = users.reduce<Record<string, SchoolClass>>((acc, user: any) => {
          const role = user?.role;
          const gradeLevel = user?.grade_level;
          const className = user?.class_name;
          if (!gradeLevel || !className) return acc;

          const key = getClassIdentity({ grade_level: gradeLevel, class_name: className });
          if (!acc[key]) {
            acc[key] = {
              id: key,
              grade_level: gradeLevel,
              class_name: className,
              teacher_name: role === 'guru' ? user?.name : undefined,
              student_count: 0,
            };
          }

          const teacherKey = user?.id ? `teacher:${user.id}` : `teacher:${user?.name ?? ''}|${user?.email ?? ''}`;
          const studentKey = user?.id ? `student:${user.id}` : `student:${user?.name ?? ''}|${user?.email ?? ''}`;

          if (role === 'guru' && !seenTeacherKeys.has(teacherKey)) {
            acc[key].teacher_name = user?.name;
            seenTeacherKeys.add(teacherKey);
          }

          if (role === 'siswa' && !seenStudentKeys.has(studentKey)) {
            acc[key].student_count = (acc[key].student_count || 0) + 1;
            seenStudentKeys.add(studentKey);
          }

          return acc;
        }, {});

        const nextClasses = mergeClasses(Object.values(grouped), readStoredClasses());
        setClasses(nextClasses);
        if (editing?.class_name || editing?.grade_level) {
          const currentLabel = `${editing.grade_level ?? ''} ${editing.class_name ?? ''}`.trim();
          setClassQuery(currentLabel);
        }
      } catch {
        const fallback = readStoredClasses();
        setClasses(fallback);
        if (editing?.class_name || editing?.grade_level) {
          const currentLabel = `${editing.grade_level ?? ''} ${editing.class_name ?? ''}`.trim();
          setClassQuery(currentLabel);
        }
      }
    }

    loadClasses();
  }, [editing?.class_name, editing?.grade_level]);

  useEffect(() => {
    if (!editing) return;
    const match = classes.find((item) => item.class_name === editing.class_name && item.grade_level === editing.grade_level);
    if (match) {
      setData((prev) => ({ ...prev, class_id: String(match.id), class_name: editing.class_name || '', grade_level: editing.grade_level || '' }));
    }
  }, [editing, classes]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!data.name || !data.email) return setError('Nama dan email wajib diisi');
    if (!editing && (!data.password || !data.password_confirmation)) return setError('Password wajib diisi untuk guru baru');
    if (data.password && data.password !== data.password_confirmation) return setError('Password tidak sama');

    const selectedClass = classes.find((item) => String(item.id) === data.class_id);
    const payload = {
      name: data.name,
      email: data.email,
      role: editing?.role || role,
      grade_level: selectedClass?.grade_level || data.grade_level || undefined,
      class_name: selectedClass?.class_name || data.class_name || undefined,
      ...(data.class_id ? { class_id: Number(data.class_id) } : {}),
      ...(data.password && { password: data.password, password_confirmation: data.password_confirmation }),
    };

    try {
      setSaving(true);
      editing ? await api.users.update(editing.id, payload) : await api.users.create(payload);
      await onSaved();
      onClose();
    } catch (error) {
      setError(errText(error, `Gagal menyimpan ${role === 'guru' ? 'guru' : role === 'siswa' ? 'siswa' : 'admin'}`));
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = role === 'guru' ? 'Guru' : role === 'siswa' ? 'Siswa' : 'Admin';

  return <FormBox title={editing ? `Edit ${roleLabel}` : `Tambah ${roleLabel}`} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Nama"><input className={styles.input} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} /></Field><Field label="Email"><input className={styles.input} type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></Field><Field label="Role"><select className={styles.select} value={data.role} disabled><option value={data.role}>{roleLabel}</option></select></Field>{role !== 'admin' ? <Field label={role === 'siswa' ? 'Pilih Kelas' : 'Tetapkan Wali Kelas'}><div className="relative w-full"><input className={styles.input} value={classQuery} onChange={(e) => { setClassQuery(e.target.value); setData({ ...data, class_id: '', class_name: '', grade_level: '' }); setShowClassSuggestions(true); }} onFocus={() => setShowClassSuggestions(true)} onBlur={() => setTimeout(() => setShowClassSuggestions(false), 120)} placeholder="Ketik kelas, mis. 1 A" />{showClassSuggestions && filteredClasses.length > 0 ? <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">{filteredClasses.map((item) => <li key={String(item.id)}><button type="button" className="flex w-full items-start rounded px-2 py-2 text-left text-sm hover:bg-slate-100" onMouseDown={(event) => event.preventDefault()} onClick={() => { setData({ ...data, class_id: String(item.id), class_name: item.class_name || '', grade_level: item.grade_level || '' }); setClassQuery(`${item.grade_level || ''} ${item.class_name || ''}`.trim()); setShowClassSuggestions(false); }}><span className="font-medium text-slate-800">{`${item.grade_level || '-'} ${item.class_name || ''}`.trim()}</span>{item.teacher_name ? <span className="ml-2 text-slate-500">{item.teacher_name}</span> : null}</button></li>)}</ul> : null}</div></Field> : null}<Field label="Password"><input className={styles.input} type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} /></Field><Field label="Konfirmasi Password"><input className={styles.input} type="password" value={data.password_confirmation} onChange={(e) => setData({ ...data, password_confirmation: e.target.value })} /></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
}

function ClassesTab() {
  const [items, setItems] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const response = await api.users.classes();
      const classes = Array.isArray(response?.data) ? response.data : [];
      setItems(mergeClasses(classes as SchoolClass[], readStoredClasses()));
    } catch (error) {
      setError(errText(error, 'Gagal memuat daftar kelas'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((item) => `${item.grade_level ?? ''} ${item.class_name ?? ''} ${item.teacher_name ?? ''}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function remove(id: number | string) {
    if (!confirm('Hapus kelas ini?')) return;
    try {
      const nextClasses = readStoredClasses().filter((item) => String(item.id) !== String(id));
      writeStoredClasses(nextClasses);
      await load();
    } catch (error) {
      setError(errText(error, 'Gagal menghapus kelas'));
    }
  }

  return <div><SectionHeader eyebrow="Manajemen Kelas" title="Daftar Kelas" desc="Tambah, edit, cari, dan hapus kelas." Icon={GraduationCap} /><div className={styles.managementShell}>{formOpen && <ClassForm editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><SearchBox value={query} onChange={setQuery} placeholder="Cari kelas..." />{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah Kelas</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat daftar kelas...</div> : filtered.length === 0 ? <Empty text="Belum ada kelas yang terdaftar." /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Kelas</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th>Aksi</th></tr></thead><tbody>{filtered.map((item) => <tr key={String(item.id)}><td>{`${item.grade_level || '-'} ${item.class_name || ''}`.trim()}</td><td>{item.teacher_name || '-'}</td><td>{item.student_count ?? 0}</td><td><div className={styles.cardActions}><button className={styles.editButton} onClick={() => { setEditing(item); setFormOpen(true); }}>Edit</button><button className={styles.dangerButton} onClick={() => remove(item.id)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</div></div>;
}

function ClassForm({ editing, onClose, onSaved }: { editing: SchoolClass | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [data, setData] = useState({ grade_level: editing?.grade_level || '1', class_name: editing?.class_name || '', teacher_id: editing?.teacher_id?.toString() || '' });
  const [teachers, setTeachers] = useState<UserAccount[]>([]);
  const [teacherQuery, setTeacherQuery] = useState(editing?.teacher_name || '');
  const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredTeachers = useMemo(() => {
    const query = teacherQuery.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((teacher) => `${teacher.name} ${teacher.email}`.toLowerCase().includes(query));
  }, [teacherQuery, teachers]);

  useEffect(() => {
    async function loadTeachers() {
      try {
        const response = await api.users.list();
        const items = Array.isArray(response?.data) ? response.data : [];
        const guruList = (items as UserAccount[]).filter((user) => user.role === 'guru');
        setTeachers(guruList);

        if (editing?.teacher_id) {
          const currentTeacher = guruList.find((teacher) => String(teacher.id) === String(editing.teacher_id));
          if (currentTeacher) {
            setTeacherQuery(currentTeacher.name);
          }
        } else if (editing?.teacher_name) {
          setTeacherQuery(editing.teacher_name);
        }
      } catch {
        setTeachers([]);
      }
    }

    loadTeachers();
  }, [editing?.teacher_id, editing?.teacher_name]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!data.grade_level || !data.class_name) return setError('Tingkat kelas dan nama kelas wajib diisi');

    const payload = {
      grade_level: data.grade_level,
      class_name: data.class_name,
      teacher_id: data.teacher_id ? Number(data.teacher_id) : null,
    };

    try {
      setSaving(true);
      const selectedTeacher = teachers.find((teacher) => String(teacher.id) === data.teacher_id);
      const nextClass: SchoolClass = {
        id: editing?.id ? String(editing.id) : `${data.grade_level}|${data.class_name}`,
        grade_level: data.grade_level,
        class_name: data.class_name,
        teacher_id: data.teacher_id ? Number(data.teacher_id) : undefined,
        teacher_name: selectedTeacher?.name || teacherQuery || editing?.teacher_name,
        teacher_email: selectedTeacher?.email,
        student_count: editing?.student_count ?? 0,
      };

      try {
        if (editing && typeof editing.id === 'number') {
          await api.classes.update(editing.id, payload);
        } else {
          await api.classes.create(payload);
        }
      } catch {
        // Fallback to local storage when the hosted backend does not expose /api/classes yet.
      }

      upsertStoredClass(nextClass);
      await onSaved();
      onClose();
    } catch (error) {
      setError(errText(error, 'Gagal menyimpan kelas'));
    } finally {
      setSaving(false);
    }
  }

  return <FormBox title={editing ? 'Edit Kelas' : 'Tambah Kelas'} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Tingkat Kelas"><select className={styles.select} value={data.grade_level} onChange={(e) => setData({ ...data, grade_level: e.target.value })}><option value="1">Kelas 1</option><option value="2">Kelas 2</option><option value="3">Kelas 3</option><option value="10">Kelas 10</option><option value="11">Kelas 11</option><option value="12">Kelas 12</option></select></Field><Field label="Nama Kelas"><input className={styles.input} value={data.class_name} onChange={(e) => setData({ ...data, class_name: e.target.value })} placeholder="Contoh: A atau X IPA" /></Field><Field label="Wali Kelas"><div className="relative w-full"><input className={styles.input} value={teacherQuery} onChange={(e) => { setTeacherQuery(e.target.value); setData({ ...data, teacher_id: '' }); setShowTeacherSuggestions(true); }} onFocus={() => setShowTeacherSuggestions(true)} onBlur={() => setTimeout(() => setShowTeacherSuggestions(false), 120)} placeholder="Ketik nama atau email guru" />{showTeacherSuggestions && filteredTeachers.length > 0 ? <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">{filteredTeachers.map((teacher) => <li key={teacher.id}><button type="button" className="flex w-full items-start rounded px-2 py-2 text-left text-sm hover:bg-slate-100" onMouseDown={(event) => event.preventDefault()} onClick={() => { setData({ ...data, teacher_id: String(teacher.id) }); setTeacherQuery(teacher.name); setShowTeacherSuggestions(false); }}><span className="font-medium text-slate-800">{teacher.name}</span><span className="ml-2 text-slate-500">{teacher.email}</span></button></li>)}</ul> : null}</div></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
}

function SettingsTab({ refreshUser }: { refreshUser: () => Promise<void> }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', avatar: null as File | null });
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [saving, setSaving] = useState(false);
  async function saveProfile(e: FormEvent) { e.preventDefault(); setError(''); setSuccess(''); const fd = new FormData(); fd.append('name', profile.name); fd.append('email', profile.email); if (profile.avatar) fd.append('avatar', profile.avatar); try { setSaving(true); await api.me.updateProfile(fd); await refreshUser(); setSuccess('Profil berhasil diperbarui'); } catch (error) { setError(errText(error, 'Gagal update profil')); } finally { setSaving(false); } }
  async function savePassword(e: FormEvent) { e.preventDefault(); setError(''); setSuccess(''); if (password.password !== password.password_confirmation) return setError('Konfirmasi password tidak cocok'); try { setSaving(true); await api.me.updateProfile(password); setPassword({ current_password: '', password: '', password_confirmation: '' }); setSuccess('Password berhasil diperbarui'); } catch (error) { setError(errText(error, 'Gagal update password')); } finally { setSaving(false); } }
  return <div><SectionHeader eyebrow="Pengaturan" title="Pengaturan Profil" desc="Perbarui profil dan password akun admin." Icon={Settings} /><ErrorBox message={error} />{success && <div className={styles.success}>{success}</div>}<div className={styles.profileGrid}><div className={styles.profileCard}><h2 className={styles.profileTitle}>Informasi Profil</h2><p className={styles.profileSubtitle}>Data admin yang sedang login.</p><form onSubmit={saveProfile} className="mt-4 space-y-4"><div className={styles.avatarPreviewRow}><div className={styles.avatarPreview}>{profile.avatar ? <img src={URL.createObjectURL(profile.avatar)} alt="Preview" /> : user?.profile_photo_url ? <img src={user.profile_photo_url} alt={user.name} /> : user?.name?.charAt(0).toUpperCase()}</div><Field label="Foto Profil"><input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setProfile({ ...profile, avatar: e.target.files?.[0] || null })} /></Field></div><Field label="Nama"><input className={styles.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field><Field label="Email"><input className={styles.input} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field><div className={styles.formActions}><button className={styles.primaryButton} disabled={saving}>Simpan Profil</button></div></form></div><div className={styles.profileCard}><h2 className={styles.profileTitle}>Ubah Password</h2><p className={styles.profileSubtitle}>Gunakan password yang aman.</p><form onSubmit={savePassword} className="mt-4 space-y-4"><Field label="Password Saat Ini"><input className={styles.input} type="password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} /></Field><Field label="Password Baru"><input className={styles.input} type="password" value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} /></Field><Field label="Konfirmasi Password Baru"><input className={styles.input} type="password" value={password.password_confirmation} onChange={(e) => setPassword({ ...password, password_confirmation: e.target.value })} /></Field><div className={styles.formActions}><button className={styles.primaryButton} disabled={saving}>Ubah Password</button></div></form></div></div></div>;
}

function FormBox({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className={styles.formBox}><div className={styles.formHeader}><h2 className={styles.formTitle}>{title}</h2><button type="button" className={styles.closeButton} onClick={onClose}><X size={18} /></button></div>{children}</div>;
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`${styles.field} ${full ? styles.fieldFull : ''}`}><span className={styles.label}>{label}</span>{children}</label>;
}

function FormActions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return <div className={styles.formActions}><button type="button" className={styles.secondaryButton} onClick={onCancel}>Batal</button><button className={styles.primaryButton} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : null}Simpan</button></div>;
}

// ─── HistoriTab Admin ─────────────────────────────────────────────────────────

type AdminHistoryData = {
  new_users: Array<{ id: number; name: string; email: string; role: string; grade_level?: string; class_name?: string; created_at: string }>;
  recent_points: Array<{ id: number; points: number; type: string; description: string; created_at: string; user?: { id: number; name: string; email: string } }>;
  recent_redemptions: Array<{ id: number; claim_code: string; status: string; points_used: number; quantity: number; created_at: string; user?: { id: number; name: string; email: string }; reward?: { id: number; name: string; points_required: number } }>;
  recent_reading: Array<{ id: number; status: string; created_at: string; user?: { id: number; name: string; email: string }; ebook?: { id: number; title: string; author?: string } }>;
};

type AdminHistorySummary = {
  period_days: number;
  new_users: number;
  new_siswa: number;
  new_guru: number;
  total_points_awarded: number;
  total_points_used: number;
  total_redemptions: number;
  reading_sessions: number;
  completed_readings: number;
};

function HistoriTab() {
  const [data, setData] = useState<AdminHistoryData | null>(null);
  const [summary, setSummary] = useState<AdminHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(30);
  const [activeSection, setActiveSection] = useState<'users' | 'points' | 'redemptions' | 'reading'>('users');

  async function load(p: number) {
    try {
      setLoading(true);
      setError('');
      const res = await api.dashboard.adminHistory(p) as any;
      const d = res?.data ?? res;
      if (d) setData(d as AdminHistoryData);
      if (res?.summary) setSummary(res.summary as AdminHistorySummary);
    } catch (e) {
      setError(errText(e, 'Gagal memuat histori'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(period); }, [period]);

  const sections = [
    { key: 'users' as const, label: 'Pengguna Baru', count: summary?.new_users ?? 0 },
    { key: 'points' as const, label: 'Transaksi Poin', count: data?.recent_points.length ?? 0 },
    { key: 'redemptions' as const, label: 'Klaim Reward', count: summary?.total_redemptions ?? 0 },
    { key: 'reading' as const, label: 'Sesi Baca', count: summary?.reading_sessions ?? 0 },
  ];

  const roleColor: Record<string, string> = {
    siswa: 'bg-blue-50 text-blue-700',
    guru: 'bg-purple-50 text-purple-700',
    admin: 'bg-amber-50 text-amber-700',
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Histori Platform"
        title="Histori Aktivitas"
        desc="Pantau seluruh pergerakan pengguna, poin, dan reward dalam platform."
        Icon={History}
      />

      {/* Period Selector */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-black text-slate-500">Periode:</span>
        {[7, 14, 30, 90].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${period === p ? 'bg-emerald-600 text-white shadow' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {p} hari
          </button>
        ))}
      </div>

      <ErrorBox message={error} />

      {/* Summary Cards */}
      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {[
            { label: 'Pengguna Baru', value: fmt(summary.new_users), sub: `${fmt(summary.new_siswa)} siswa · ${fmt(summary.new_guru)} guru` },
            { label: 'Poin Diberikan', value: fmt(summary.total_points_awarded), sub: `−${fmt(summary.total_points_used)} dipakai` },
            { label: 'Reward Ditukar', value: fmt(summary.total_redemptions), sub: 'klaim reward' },
            { label: 'Sesi Membaca', value: fmt(summary.reading_sessions), sub: `${fmt(summary.completed_readings)} selesai` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-2xl font-black text-slate-950">{s.value}</p>
              <p className="mt-0.5 text-xs font-black text-slate-500">{s.label}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-700">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${activeSection === s.key ? 'bg-slate-950 text-white shadow' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Memuat histori...</div>
      ) : !data ? null : (
        <div className={styles.managementShell}>

          {/* Pengguna Baru */}
          {activeSection === 'users' && (
            data.new_users.length === 0
              ? <Empty text="Tidak ada pengguna baru pada periode ini." />
              : <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Kelas</th><th>Tanggal Daftar</th></tr></thead>
                    <tbody>
                      {data.new_users.map((u) => (
                        <tr key={u.id}>
                          <td><div className={styles.avatarCell}><span className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</span>{u.name}</div></td>
                          <td>{u.email}</td>
                          <td><span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${roleColor[u.role] ?? 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                          <td>{u.class_name || u.grade_level || '-'}</td>
                          <td>{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}

          {/* Transaksi Poin */}
          {activeSection === 'points' && (
            data.recent_points.length === 0
              ? <Empty text="Tidak ada transaksi poin pada periode ini." />
              : <div className={styles.leaderList}>
                  {data.recent_points.map((pt) => (
                    <div key={pt.id} className={styles.leaderItem}>
                      <div className="min-w-0 flex-1">
                        <p className={styles.leaderName}>{pt.description}</p>
                        <p className={styles.leaderEmail}>{pt.user?.name} · {pt.user?.email}</p>
                        <p className={styles.mutedText}>{new Date(pt.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`shrink-0 text-base font-black ${pt.points > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {pt.points > 0 ? '+' : ''}{fmt(pt.points)}
                      </span>
                    </div>
                  ))}
                </div>
          )}

          {/* Klaim Reward */}
          {activeSection === 'redemptions' && (
            data.recent_redemptions.length === 0
              ? <Empty text="Tidak ada klaim reward pada periode ini." />
              : <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Siswa</th><th>Reward</th><th>Poin</th><th>Kode Klaim</th><th>Status</th><th>Tanggal</th></tr></thead>
                    <tbody>
                      {data.recent_redemptions.map((r) => {
                        const statusCls = r.status === 'claimed' ? 'bg-emerald-50 text-emerald-700' : r.status === 'expired' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700';
                        return (
                          <tr key={r.id}>
                            <td>{r.user?.name || '-'}</td>
                            <td>{r.reward?.name || '-'}</td>
                            <td className="font-black text-red-600">−{fmt(r.points_used)}</td>
                            <td><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{r.claim_code}</code></td>
                            <td><span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${statusCls}`}>{r.status}</span></td>
                            <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
          )}

          {/* Sesi Baca */}
          {activeSection === 'reading' && (
            data.recent_reading.length === 0
              ? <Empty text="Tidak ada sesi membaca pada periode ini." />
              : <div className={styles.leaderList}>
                  {data.recent_reading.map((ra) => {
                    const statusCls: Record<string, string> = {
                      ongoing: 'bg-blue-50 text-blue-700',
                      pending_validation: 'bg-amber-50 text-amber-700',
                      completed: 'bg-emerald-50 text-emerald-700',
                      rejected: 'bg-red-50 text-red-600',
                    };
                    return (
                      <div key={ra.id} className={styles.leaderItem}>
                        <div className="min-w-0 flex-1">
                          <p className={styles.leaderName}>{ra.ebook?.title || 'E-Book'}</p>
                          <p className={styles.leaderEmail}>{ra.user?.name} · {ra.user?.email}</p>
                          <p className={styles.mutedText}>{new Date(ra.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black ${statusCls[ra.status] ?? 'bg-slate-100 text-slate-600'}`}>{ra.status}</span>
                      </div>
                    );
                  })}
                </div>
          )}
        </div>
      )}
    </div>
  );
}
