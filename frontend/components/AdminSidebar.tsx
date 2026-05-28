'use client';

import { useState } from 'react';

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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const defaultMenuItems: MenuItem[] = role === 'admin' ? [
    { id: 'beranda', label: 'Beranda' },
    {
      id: 'manajemen',
      label: 'Manajemen',
      subItems: [
        { id: 'ebooks', label: 'E-Book' },
        { id: 'rewards', label: 'Reward' },
        { id: 'users', label: 'User' },
      ],
    },
    { id: 'laporan', label: 'Laporan' },
    { id: 'pengaturan', label: 'Pengaturan' },
  ] : [
    { id: 'beranda', label: 'Beranda' },
    {
      id: 'manajemen',
      label: 'Manajemen',
      subItems: [
        { id: 'validasi', label: 'Validasi Pembacaan' },
        { id: 'kuis', label: 'Buat Kuis' },
        { id: 'siswa', label: 'Daftar Siswa' },
      ],
    },
    { id: 'laporan', label: 'Laporan' },
    { id: 'pengaturan', label: 'Pengaturan' },
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
    onTabChange(itemId);
    onCloseSidebar();
  };

  const handleSubItemClick = (subItemId: string) => {
    onTabChange(subItemId);
    onCloseSidebar();
  };

  return (
    <aside
      className={`fixed z-40 flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] w-64 sm:w-72 flex-col overflow-hidden border-r border-slate-200 bg-slate-900 text-white shadow-xl transition-transform duration-300 md:relative ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {user && (
        <div className="border-b border-white/10 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-sm font-black text-white ring-1 ring-white/10">
                {user.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{user.name}</p>
                <p className="truncate text-xs font-semibold text-slate-300">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-2 overflow-y-auto p-4 pb-24">
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
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                  isActive || anySubItemActive
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="truncate">{item.label}</span>
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
                          className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm font-bold transition ${
                            isSubActive
                              ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'
                              : 'text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
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

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/95 p-4">
        <p className="text-center text-xs font-bold text-slate-400">
          {role === 'guru' ? 'Panel Guru' : 'Panel Admin'}
        </p>
      </div>
    </aside>
  );
}
