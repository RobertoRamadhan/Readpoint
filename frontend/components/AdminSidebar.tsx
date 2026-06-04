'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  subItems?: {
    id: string;
    label: string;
    icon?: string;
  }[];
}

interface AdminSidebarProps {
  activeTab: string;
  sidebarOpen: boolean;
  onTabChange: (tabId: string) => void;
  onCloseSidebar: () => void;
  menuItems?: MenuItem[];
  role?: 'admin' | 'guru';
  user?: {
    name: string;
    email: string;
    profile_photo_url?: string;
  };
}

export default function AdminSidebar({
  activeTab,
  sidebarOpen,
  onTabChange,
  onCloseSidebar,
  menuItems,
  role = 'admin',
  user,
}: AdminSidebarProps) {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(['manajemen']);

  const defaultMenuItems: MenuItem[] = role === 'admin' ? [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    {
      id: 'manajemen',
      label: 'Manajemen',
      icon: '▦',
      subItems: [
        { id: 'ebooks', label: 'E-Book', icon: '📚' },
        { id: 'rewards', label: 'Reward', icon: '🎁' },
        { id: 'users', label: 'User', icon: '👥' },
      ],
    },
    { id: 'laporan', label: 'Laporan', icon: '📊' },
    { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️' },
  ] : [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    {
      id: 'manajemen',
      label: 'Manajemen',
      icon: '▦',
      subItems: [
        { id: 'validasi', label: 'Validasi Pembacaan', icon: '✅' },
        { id: 'kuis', label: 'Buat Kuis', icon: '📝' },
        { id: 'siswa', label: 'Daftar Siswa', icon: '👥' },
      ],
    },
    { id: 'laporan', label: 'Laporan', icon: '📊' },
    { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️' },
  ];

  const items = menuItems || defaultMenuItems;

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string) => {
    if (role === 'admin' && itemId === 'laporan') {
      router.push('/dashboard/admin/laporan');
      onCloseSidebar();
      return;
    }

    if (role === 'admin' && itemId === 'beranda') {
      router.push('/dashboard/admin');
    }

    if (role === 'guru' && itemId === 'laporan') {
      router.push('/dashboard/guru/laporan');
      onCloseSidebar();
      return;
    }

    if (role === 'guru' && itemId === 'beranda') {
      router.push('/dashboard/guru');
    }

    onTabChange(itemId);
    onCloseSidebar();
  };

  const handleSubItemClick = (subItemId: string) => {
    if (role === 'guru') {
      router.push('/dashboard/guru');
    }

    onTabChange(subItemId);
    onCloseSidebar();
  };

  return (
    <aside
      className={`readpoint-admin-sidebar fixed z-40 flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] w-64 sm:w-72 flex-col overflow-hidden border-r border-slate-200 bg-slate-900 text-white shadow-xl transition-transform duration-300 md:relative ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="readpoint-admin-brand border-b border-white/10 p-5">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-950/30">
              RP
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black tracking-wide text-white">READPOINT</p>
              <p className="truncate text-xs font-semibold text-slate-300">{role === 'guru' ? 'Panel Guru' : 'Panel Admin'}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="readpoint-admin-nav flex-1 space-y-2 overflow-y-auto p-4 pb-28">
        {items.map((item) => {
          const isExpanded = expandedItems.includes(item.id);
          const isActive = activeTab === item.id;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const anySubItemActive = item.subItems?.some((sub) => activeTab === sub.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpand(item.id);
                  } else {
                    handleItemClick(item.id);
                  }
                }}
                className={`readpoint-admin-menu-item flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                  isActive || anySubItemActive
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-base">{item.icon || '•'}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {hasSubItems && (
                  <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>⌃</span>
                )}
              </button>

              {hasSubItems && item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                  <div className="ml-4 space-y-2 border-l border-white/10 pl-3">
                    {item.subItems.map((subItem) => {
                      const isSubActive = activeTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.id)}
                          className={`readpoint-admin-submenu-item flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm font-bold transition ${
                            isSubActive
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                              : 'text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-sm">{subItem.icon || '•'}</span>
                          <span className="truncate">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="readpoint-admin-user absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/95 p-4">
        {user ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-sm font-black text-white ring-1 ring-white/10">
              {user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">{user.name}</p>
              <p className="truncate text-xs font-semibold text-slate-400">{user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs font-bold text-slate-400">{role === 'guru' ? 'Panel Guru' : 'Panel Admin'}</p>
        )}
      </div>
    </aside>
  );
}
