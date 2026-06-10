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

type AdminTab = 'beranda' | 'ebooks' | 'rewards' | 'users' | 'pengaturan';
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
  profile_photo_url?: string;
};

type TopStudent = {
  id: number;
  name: string;
  email: string;
  total_points?: number;
};

const adminTabs = new Set<AdminTab>(['beranda', 'ebooks', 'rewards', 'users', 'pengaturan']);

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
  const [data, setData] = useState({ title: editing?.title || '', author: editing?.author || '', pages: n(editing?.pages) || 100, category: editing?.category || '', poin_per_halaman: n(editing?.poin_per_halaman) || 5, grade_level: editing?.grade_level || '10', pdf_file: null as File | null, cover_image: null as File | null });
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

  return <FormBox title={editing ? 'Edit E-Book' : 'Tambah E-Book'} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Judul Buku"><input className={styles.input} value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} /></Field><Field label="Pengarang"><input className={styles.input} value={data.author} onChange={(e) => setData({ ...data, author: e.target.value })} /></Field><Field label="Halaman"><input className={styles.input} type="number" value={data.pages} onChange={(e) => setData({ ...data, pages: Number(e.target.value) })} /></Field><Field label="Kategori"><input className={styles.input} value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} /></Field><Field label="Poin/Halaman"><input className={styles.input} type="number" value={data.poin_per_halaman} onChange={(e) => setData({ ...data, poin_per_halaman: Number(e.target.value) })} /></Field><Field label="Kelas"><select className={styles.select} value={data.grade_level} onChange={(e) => setData({ ...data, grade_level: e.target.value })}><option value="10">Kelas 10</option><option value="11">Kelas 11</option><option value="12">Kelas 12</option><option value="umum">Umum</option></select></Field><Field label="PDF"><input className={styles.fileInput} type="file" accept="application/pdf,.pdf" onChange={(e: ChangeEvent<HTMLInputElement>) => setData({ ...data, pdf_file: e.target.files?.[0] || null })} /></Field><Field label="Cover"><input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setData({ ...data, cover_image: e.target.files?.[0] || null })} /></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
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
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); if (!data.name || !data.description) return setError('Nama dan deskripsi wajib diisi'); const fd = new FormData(); Object.entries(data).forEach(([key, value]) => { if (value !== null) fd.append(key, value instanceof File ? value : String(value)); }); try { setSaving(true); editing ? await api.rewards.update(editing.id, fd) : await api.rewards.create(fd); await onSaved(); onClose(); } catch (error) { setError(errText(error, 'Gagal menyimpan reward')); } finally { setSaving(false); } }
  return <FormBox title={editing ? 'Edit Reward' : 'Tambah Reward'} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Nama Reward"><input className={styles.input} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} /></Field><Field label="Poin"><input className={styles.input} type="number" value={data.points_required} onChange={(e) => setData({ ...data, points_required: Number(e.target.value) })} /></Field><Field label="Stok"><input className={styles.input} type="number" value={data.stock} onChange={(e) => setData({ ...data, stock: Number(e.target.value) })} /></Field><Field label="Gambar"><input className={styles.fileInput} type="file" accept="image/*" onChange={(e) => setData({ ...data, image: e.target.files?.[0] || null })} /></Field><Field label="Deskripsi" full><textarea className={styles.textarea} value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} /></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
}

function UsersTab() {
  const [items, setItems] = useState<UserAccount[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [role, setRole] = useState(''); const [formOpen, setFormOpen] = useState(false); const [editing, setEditing] = useState<UserAccount | null>(null);
  async function load() { try { setLoading(true); setError(''); setItems(extractArray<UserAccount>(await api.users.list())); } catch (error) { setError(errText(error, 'Gagal memuat user')); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => items.filter((x) => (!role || x.role === role) && `${x.name} ${x.email} ${x.class_name ?? ''}`.toLowerCase().includes(query.toLowerCase())), [items, query, role]);
  async function remove(id: number) { if (!confirm('Hapus user ini?')) return; try { await api.users.delete(id); await load(); } catch (error) { setError(errText(error, 'Gagal menghapus user')); } }
  return <div><SectionHeader eyebrow="Manajemen Akun" title="Kelola User" desc="Tambah, edit, filter, dan hapus akun admin, guru, atau siswa." Icon={Users} /><div className={styles.managementShell}>{formOpen && <UserForm editing={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={load} />}<div className={styles.toolbar}><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]"><SearchBox value={query} onChange={setQuery} placeholder="Cari user..." /><select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}><option value="">Semua Role</option><option value="admin">Admin</option><option value="guru">Guru</option><option value="siswa">Siswa</option></select></div>{!formOpen && <button className={styles.primaryButton} onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={18} />Tambah User</button>}</div><ErrorBox message={error} />{loading ? <div className={styles.loading}>Memuat user...</div> : filtered.length === 0 ? <Empty text="User belum ditemukan." /> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>{filtered.map((u) => <tr key={u.id}><td><div className={styles.avatarCell}><span className={styles.avatar}>{u.profile_photo_url ? <img src={u.profile_photo_url} alt={u.name} /> : u.name.charAt(0).toUpperCase()}</span>{u.name}</div></td><td>{u.email}</td><td><span className={styles.roleBadge}>{u.role}</span></td><td>{u.class_name || '-'}</td><td><div className={styles.cardActions}><button className={styles.editButton} onClick={() => { setEditing(u); setFormOpen(true); }}>Edit</button><button className={styles.dangerButton} onClick={() => remove(u.id)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</div></div>;
}

function UserForm({ editing, onClose, onSaved }: { editing: UserAccount | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [data, setData] = useState({ name: editing?.name || '', email: editing?.email || '', role: editing?.role || 'siswa', class_name: editing?.class_name || '', password: '', password_confirmation: '' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); if (!data.name || !data.email) return setError('Nama dan email wajib diisi'); if (!editing && (!data.password || !data.password_confirmation)) return setError('Password wajib diisi untuk user baru'); if (data.password && data.password !== data.password_confirmation) return setError('Password tidak sama'); const payload = { name: data.name, email: data.email, role: data.role, class_name: data.class_name || undefined, ...(data.role === 'siswa' && { grade_level: '10' }), ...(data.password && { password: data.password, password_confirmation: data.password_confirmation }) }; try { setSaving(true); editing ? await api.users.update(editing.id, payload) : await api.users.create(payload); await onSaved(); onClose(); } catch (error) { setError(errText(error, 'Gagal menyimpan user')); } finally { setSaving(false); } }
  return <FormBox title={editing ? 'Edit User' : 'Tambah User'} onClose={onClose}><form onSubmit={submit}><ErrorBox message={error} /><div className={styles.formGrid}><Field label="Nama"><input className={styles.input} value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} /></Field><Field label="Email"><input className={styles.input} type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></Field><Field label="Role"><select className={styles.select} value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })}><option value="siswa">Siswa</option><option value="guru">Guru</option><option value="admin">Admin</option></select></Field><Field label="Kelas/Divisi"><input className={styles.input} value={data.class_name} onChange={(e) => setData({ ...data, class_name: e.target.value })} /></Field><Field label="Password"><input className={styles.input} type="password" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} /></Field><Field label="Konfirmasi Password"><input className={styles.input} type="password" value={data.password_confirmation} onChange={(e) => setData({ ...data, password_confirmation: e.target.value })} /></Field></div><FormActions saving={saving} onCancel={onClose} /></form></FormBox>;
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
