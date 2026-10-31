'use client';

import { useEffect, useState } from 'react';
import { Library } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

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

  return (
    <div className="readpoint-dashboard-shell min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-50 text-slate-900">
      <header className="readpoint-dashboard-header fixed right-0 top-0 z-40 h-16 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="readpoint-dashboard-header-inner flex h-full w-full items-center">
          <div className="readpoint-dashboard-header-row flex w-full items-center justify-between px-3 sm:px-4 lg:px-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="readpoint-dashboard-brand flex min-w-0 items-center gap-2 text-left sm:gap-3"
            >
              <span className="readpoint-dashboard-brand-icon hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm sm:flex">
                <Library size={18} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className="readpoint-dashboard-brand-title block truncate text-sm font-black leading-none text-slate-900 sm:text-base">
                  READPOINT
                </span>
                <span className="readpoint-dashboard-brand-subtitle mt-0.5 block truncate text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                  Dashboard {roleLabel}
                </span>
              </div>
            </button>

            <div className="flex min-w-0 flex-shrink-0 items-center gap-2 sm:gap-3">
              <div className="readpoint-dashboard-user hidden text-right sm:block">
                <span className="readpoint-dashboard-user-name block text-xs font-black leading-4 text-slate-900 sm:text-sm">
                  {user?.name || 'User'}
                </span>
                <span className="readpoint-dashboard-user-role block text-[10px] font-semibold text-slate-600 sm:text-xs">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="readpoint-dashboard-main w-full max-w-[100vw] overflow-x-hidden bg-slate-50 pt-16">
        {children}
      </main>

      <footer className="readpoint-dashboard-footer w-full border-t border-slate-200 bg-white">
        <div className="w-full px-3 py-4 text-center sm:px-4 sm:py-5 lg:px-6">
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">
            &copy; 2026 READPOINT - Platform Literasi Digital Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}
