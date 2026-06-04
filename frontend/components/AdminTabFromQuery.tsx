'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const tabLabelMap: Record<string, string> = {
  beranda: 'Beranda',
  ebooks: 'E-Book',
  rewards: 'Reward',
  users: 'User',
  pengaturan: 'Pengaturan',
};

export default function AdminTabFromQuery() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== '/dashboard/admin') return;

    const tab = searchParams.get('tab');
    if (!tab) return;

    const label = tabLabelMap[tab];
    if (!label) return;

    let attempts = 0;
    const maxAttempts = 20;

    const openTab = () => {
      attempts += 1;
      const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
      const target = buttons.find((button) => {
        const text = button.textContent?.replace(/\s+/g, ' ').trim() || '';
        return text.includes(label);
      });

      if (target) {
        target.click();
        return;
      }

      if (attempts < maxAttempts) {
        window.setTimeout(openTab, 100);
      }
    };

    window.setTimeout(openTab, 80);
  }, [pathname, searchParams]);

  return null;
}
