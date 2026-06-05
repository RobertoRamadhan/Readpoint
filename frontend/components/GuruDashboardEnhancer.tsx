'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const tabLabelMap: Record<string, string> = {
  beranda: 'Beranda',
  validasi: 'Validasi Pembacaan',
  kuis: 'Buat Kuis',
  siswa: 'Daftar Siswa',
  pengaturan: 'Pengaturan',
};

const quickActionMap: Record<string, string> = {
  'Bagikan Buku': 'kuis',
  'Validasi Pembacaan': 'validasi',
  'Buat Kuis': 'kuis',
  'Lihat Siswa': 'siswa',
};

function clickGuruTab(tab: string) {
  const label = tabLabelMap[tab];
  if (!label) return false;

  const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
  const target = buttons.find((button) => {
    const text = button.textContent?.replace(/\s+/g, ' ').trim() || '';
    return text.includes(label);
  });

  if (target) {
    target.click();
    return true;
  }

  return false;
}

function GuruDashboardEnhancerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== '/dashboard/guru') return;

    const tab = searchParams.get('tab');
    if (!tab) return;

    let attempts = 0;
    const openTab = () => {
      attempts += 1;
      if (clickGuruTab(tab)) return;
      if (attempts < 20) window.setTimeout(openTab, 100);
    };

    window.setTimeout(openTab, 80);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname !== '/dashboard/guru') return;

    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('button') as HTMLButtonElement | null;
      if (!button) return;

      const text = button.textContent?.replace(/\s+/g, ' ').trim() || '';
      const action = Object.keys(quickActionMap).find((key) => text.includes(key));
      if (!action) return;

      const targetTab = quickActionMap[action];
      event.preventDefault();
      event.stopPropagation();
      clickGuruTab(targetTab);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname]);

  return null;
}

export default function GuruDashboardEnhancer() {
  return (
    <Suspense fallback={null}>
      <GuruDashboardEnhancerInner />
    </Suspense>
  );
}
