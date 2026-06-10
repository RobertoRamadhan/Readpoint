'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Gift,
  Home,
  LayoutGrid,
  Library,
  ListChecks,
  PenLine,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  Icon?: LucideIcon;
  subItems?: {
    id: string;
    label: string;
    Icon?: LucideIcon;
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
  const sidebarRoleClass = role === 'guru' ? 'readpoint-fixed-guru-sidebar' : 'readpoint-fixed-admin-sidebar';

  const defaultMenuItems: MenuItem[] = role === 'admin'
    ? [
        { id: 'beranda', label: 'Beranda', Icon: Home },
        {
          id: 'manajemen',
          label: 'Manajemen',
          Icon: LayoutGrid,
          subItems: [
            { id: 'ebooks', label: 'E-Book', Icon: BookOpen },
            { id: 'rewards', label: 'Reward', Icon: Gift },
            { id: 'users', label: 'User', Icon: Users },
          ],
        },
        { id: 'laporan', label: 'Laporan', Icon: BarChart3 },
        { id: 'pengaturan', label: 'Pengaturan', Icon: Settings },
      ]
    : [
        { id: 'beranda', label: 'Beranda', Icon: Home },
        {
          id: 'manajemen',
          label: 'Manajemen',
          Icon: LayoutGrid,
          subItems: [
            { id: 'validasi', label: 'Validasi Pembacaan', Icon: ListChecks },
            { id: 'kuis', label: 'Buat Kuis', Icon: PenLine },
            { id: 'siswa', label: 'Daftar Siswa', Icon: Users },
          ],
        },
        { id: 'laporan', label: 'Laporan', Icon: BarChart3 },
        { id: 'pengaturan', label: 'Pengaturan', Icon: Settings },
      ];

  const items = menuItems || defaultMenuItems;
  const roleLabel = role === 'guru' ? 'Panel Guru' : 'Panel Admin';
  const basePath = role === 'guru' ? '/dashboard/guru' : '/dashboard/admin';

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const activeParentIds = items
    .filter((item) => item.subItems?.some((sub) => sub.id === activeTab))
    .map((item) => item.id);

  const goTab = (tabId: string) => {
    onTabChange(tabId);

    if (tabId === 'beranda') {
      router.push(basePath);
    } else if (tabId === 'laporan') {
      router.push(`${basePath}/laporan`);
    } else {
      router.push(`${basePath}?tab=${tabId}`);
    }

    onCloseSidebar();
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleExpand(item.id);
      return;
    }

    goTab(item.id);
  };

  return (
    <aside
      className={`${sidebarRoleClass} fixed left-0 top-14 z-40 flex h-[calc(100vh-56px)] w-64 flex-col overflow-hidden border-r border-slate-200 bg-slate-950 text-white shadow-xl transition-transform duration-300 sm:top-16 sm:h-[calc(100vh-64px)] sm:w-72 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      aria-label={`${roleLabel} sidebar`}
    >
      <div className="readpoint-admin-brand border-b border-white/10 p-5">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/30">
              <Library size={23} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black tracking-wide text-white">READPOINT</p>
              <p className="truncate text-xs font-semibold text-slate-300">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="readpoint-admin-nav flex-1 space-y-2 overflow-y-auto p-4 pb-28">
        {items.map((item) => {
          const isExpanded = expandedItems.includes(item.id) || activeParentIds.includes(item.id);
          const isActive = activeTab === item.id;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const anySubItemActive = item.subItems?.some((sub) => activeTab === sub.id);
          const Icon = item.Icon || LayoutGrid;

          return (
            <div key={item.id} className="readpoint-admin-menu-group">
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                data-sidebar-tab={item.id}
                aria-label={item.label}
                aria-expanded={hasSubItems ? isExpanded : undefined}
                className={`readpoint-admin-menu-item flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${
                  isActive || anySubItemActive
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-current/10">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="readpoint-admin-menu-label block min-w-0 flex-1 truncate">{item.label}</span>
                </span>
                {hasSubItems && (
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </button>

              {hasSubItems && item.subItems && (
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 pt-2' : 'max-h-0'}`}>
                  <div className="ml-4 space-y-2 border-l border-white/10 pl-3">
                    {item.subItems.map((subItem) => {
                      const isSubActive = activeTab === subItem.id;
                      const SubIcon = subItem.Icon || LayoutGrid;

                      return (
                        <button
                          type="button"
                          key={subItem.id}
                          onClick={() => goTab(subItem.id)}
                          data-sidebar-tab={subItem.id}
                          aria-label={subItem.label}
                          className={`readpoint-admin-submenu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                            isSubActive
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                              : 'text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <SubIcon size={16} className="shrink-0" aria-hidden="true" />
                          <span className="readpoint-admin-submenu-label block min-w-0 flex-1 truncate">{subItem.label}</span>
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
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-sm font-black text-white ring-1 ring-white/10">
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
          <p className="text-center text-xs font-bold text-slate-400">{roleLabel}</p>
        )}
      </div>
    </aside>
  );
}
