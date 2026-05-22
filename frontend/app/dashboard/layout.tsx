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

  const roleLabels: { [key: string]: string } = {
    siswa: 'Siswa',
    guru: 'Guru',
    admin: 'Admin',
  };

  const roleLabel = mounted && user?.role ? roleLabels[user.role] || 'User' : 'User';

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-left sm:gap-3"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white sm:h-9 sm:w-9 sm:text-sm">
              RP
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black leading-none text-slate-900 sm:text-base">READPOINT</h1>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                Dashboard {roleLabel}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-black leading-4 text-slate-900 sm:text-sm">{mounted ? user?.name : 'Memuat...'}</p>
              <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">{roleLabel}</p>
            </div>

            {user?.role === 'siswa' ? (
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
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg sm:mt-2.5 sm:w-48 sm:py-1.5"
                  >
                    <button
                      onClick={() => {
                        router.push('/dashboard/siswa/profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      Pengaturan Profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:py-2 sm:text-sm"
                title="Keluar"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden bg-slate-50">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="mt-auto w-full border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-4 text-center sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">© 2026 READPOINT - Platform Literasi Digital Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
