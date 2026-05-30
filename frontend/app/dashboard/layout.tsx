'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  /**
   * Khusus halaman siswa, layout global tidak lagi menampilkan header/footer lama.
   * Dashboard siswa, PDF reader, quiz, dan profile punya shell sendiri supaya desainnya
   * tidak bertabrakan dengan header global dashboard.
   */
  if (user?.role === 'siswa') {
    return (
      <main className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-50 text-slate-900">
        {children}
      </main>
    );
  }

  const roleLabels: Record<string, string> = {
    siswa: 'Siswa',
    guru: 'Guru',
    admin: 'Admin',
  };

  const roleLabel = user?.role ? roleLabels[user.role] || 'User' : 'User';
  const dashboardShellClass = 'mx-auto w-full px-0 sm:px-4 lg:px-7 xl:px-8';
  const headerShellClass = 'mx-auto flex w-full items-center justify-between px-3 sm:px-4 lg:px-7 xl:px-8';

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-14 w-full items-center sm:h-16">
          <div className={headerShellClass}>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex min-w-0 items-center gap-2 text-left sm:gap-3"
            >
              <div className="min-w-0">
                <h1 className="truncate text-sm font-black leading-none text-slate-900 sm:text-base">
                  READPOINT
                </h1>
                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                  Dashboard {roleLabel}
                </p>
              </div>
            </button>

            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-black leading-4 text-slate-900 sm:text-sm">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                  {roleLabel}
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-xs font-black text-slate-900 transition hover:bg-slate-200 sm:h-9 sm:w-9"
                  aria-label="Menu profil"
                >
                  {user?.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg sm:mt-2.5"
                  >
                    <button
                      onClick={() => {
                        router.push(user?.role === 'admin' ? '/dashboard/admin/profile' : '/dashboard');
                        setDropdownOpen(false);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                      title="Pengaturan Profil"
                    >
                      ⚙️
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                      title="Keluar"
                    >
                      🚪
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden bg-slate-50">
        <div className={dashboardShellClass}>{children}</div>
      </main>

      <footer className="mt-auto w-full border-t border-slate-200 bg-white">
        <div className="mx-auto w-full px-3 py-4 text-center sm:px-4 sm:py-5 lg:px-7 lg:py-6 xl:px-8">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            © 2026 READPOINT - Platform Literasi Digital Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
