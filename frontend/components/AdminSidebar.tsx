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
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    {
      id: 'manajemen',
      label: 'Manajemen',
      icon: '⚙️',
      subItems: [
        { id: 'ebooks', label: 'E-Book', icon: '📚' },
        { id: 'rewards', label: 'Reward', icon: '🎁' },
        { id: 'users', label: 'User', icon: '👥' },
      ],
    },
    { id: 'laporan', label: 'Laporan', icon: '📊' },
    { id: 'pengaturan', label: 'Pengaturan', icon: '🔧' },
  ] : [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    {
      id: 'manajemen',
      label: 'Manajemen',
      icon: '⚙️',
      subItems: [
        { id: 'validasi', label: 'Validasi Pembacaan', icon: '✅' },
        { id: 'kuis', label: 'Buat Kuis', icon: '🎯' },
        { id: 'siswa', label: 'Daftar Siswa', icon: '👨‍🎓' },
      ],
    },
    { id: 'laporan', label: 'Laporan', icon: '📊' },
    { id: 'pengaturan', label: 'Pengaturan', icon: '🔧' },
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
      className={`fixed md:relative z-40 flex h-[calc(100vh-80px)] w-72 flex-col overflow-hidden border-r border-white/10 bg-[#1E3A5F] text-white shadow-2xl shadow-[#1E3A5F]/25 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-[#F4B400]/20 blur-3xl" />
        <div className="absolute bottom-20 -left-24 h-56 w-56 rounded-full bg-[#2E7D32]/25 blur-3xl" />
      </div>

      <div className="relative border-b border-white/10 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#1E3A5F] shadow-lg">
            RP
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">READPOINT</h2>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F4B400]">
              {role === 'guru' ? 'Panel Guru' : 'Panel Admin'}
            </p>
          </div>
        </div>

        {user && (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/10">
                {user.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">👤</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="sidebar-user-name truncate text-sm font-black text-white">{user.name}</p>
                <p className="sidebar-user-email truncate text-xs font-semibold text-white/65">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="relative flex-1 space-y-2 overflow-y-auto p-4 pb-24">
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
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                  isActive || anySubItemActive
                    ? 'bg-white text-[#1E3A5F] shadow-lg shadow-black/10'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {item.icon && (
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${isActive || anySubItemActive ? 'bg-[#FAF3E0]' : 'bg-white/10'}`}>
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate text-sm font-black">{item.label}</span>
                </div>
                {hasSubItems && (
                  <svg
                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                  </svg>
                )}
              </button>

              {hasSubItems && item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                  <div className="ml-5 space-y-2 border-l border-white/10 pl-3">
                    {item.subItems.map((subItem) => {
                      const isSubActive = activeTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                            isSubActive
                              ? 'bg-[#2E7D32] font-black text-white shadow-lg shadow-[#2E7D32]/20'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {subItem.icon && <span className="text-base">{subItem.icon}</span>}
                          <span className="truncate font-bold">{subItem.label}</span>
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

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#172F4D]/95 p-4 backdrop-blur">
        <p className="text-center text-xs font-bold text-white/65">
          READPOINT {role === 'guru' ? 'Guru' : 'Admin'} Panel v1.0
        </p>
      </div>
    </aside>
  );
}
