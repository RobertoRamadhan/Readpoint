'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, X } from 'lucide-react';
import { api } from '@/lib/api';

type Ebook = {
  id: number;
  title?: string;
  author?: string;
  category?: string;
};

type Rect = {
  top: number;
  left: number;
  width: number;
};

function getArrayFromResponse<T>(value: unknown): T[] {
  const response = value as { data?: unknown } | null;
  const data = response?.data;

  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }

  return [];
}

function findSearchInput() {
  return document.querySelector<HTMLInputElement>('input[placeholder*="Cari buku"]');
}

export default function SearchDropdownPatch() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [books, setBooks] = useState<Ebook[]>([]);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<Rect | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let ignore = false;

    async function loadBooks() {
      // Jangan load kalau belum ada token (belum login)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      try {
        const response = await api.ebooks.list();
        if (!ignore) setBooks(getArrayFromResponse<Ebook>(response));
      } catch {
        if (!ignore) setBooks([]);
      }
    }

    void loadBooks();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let input = findSearchInput();

    const updateRect = () => {
      input = findSearchInput();
      if (!input) {
        setRect(null);
        return;
      }

      const box = input.closest('div')?.getBoundingClientRect() ?? input.getBoundingClientRect();
      setRect({
        top: box.bottom + window.scrollY + 8,
        left: box.left + window.scrollX,
        width: box.width,
      });
    };

    const syncQuery = () => {
      input = findSearchInput();
      setQuery(input?.value ?? '');
      updateRect();
    };

    const stopDashboardFilter = (event: Event) => {
      if (event.target === input) {
        event.stopPropagation();
        syncQuery();
      }
    };

    const handleFocus = () => {
      setFocused(true);
      syncQuery();
    };

    const handleBlur = () => {
      window.setTimeout(() => setFocused(false), 160);
    };

    const attach = () => {
      input = findSearchInput();
      if (!input) return;

      input.addEventListener('input', stopDashboardFilter, true);
      input.addEventListener('keyup', syncQuery);
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
      updateRect();
    };

    attach();
    const interval = window.setInterval(attach, 700);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      input?.removeEventListener('input', stopDashboardFilter, true);
      input?.removeEventListener('keyup', syncQuery);
      input?.removeEventListener('focus', handleFocus);
      input?.removeEventListener('blur', handleBlur);
    };
  }, [mounted]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return books
      .filter((book) => `${book.title ?? ''} ${book.author ?? ''} ${book.category ?? ''}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [books, query]);

  if (!mounted || !rect || !focused || !query.trim()) return null;

  const clearSearch = () => {
    const input = findSearchInput();
    if (input) input.value = '';
    setQuery('');
  };

  const openBook = (book: Ebook) => {
    const input = findSearchInput();
    if (input) input.value = book.title ?? '';
    setQuery(book.title ?? '');
    setFocused(false);
    router.push(`/dashboard/siswa/read/${book.id}`);
  };

  return createPortal(
    <div
      className="fixed z-[9999] overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
      style={{ top: rect.top, left: rect.left, width: rect.width }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm font-black text-slate-900">
          <Search className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="truncate">Hasil pencarian buku</span>
        </div>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearSearch}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          aria-label="Bersihkan pencarian"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {results.length ? (
        <div className="max-h-[360px] overflow-y-auto p-2">
          {results.map((book) => (
            <button
              key={book.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openBook(book)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-emerald-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-slate-950">{book.title || 'Judul tidak tersedia'}</span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                  {book.author || 'Penulis tidak tersedia'}{book.category ? ` • ${book.category}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-5 text-sm font-bold text-slate-500">Tidak ada buku yang cocok.</div>
      )}
    </div>,
    document.body,
  );
}
