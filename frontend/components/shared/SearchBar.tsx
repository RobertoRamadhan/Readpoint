'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Ebook {
  id: number;
  title: string;
  author: string;
  cover_image?: string;
  pdf_file?: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onBookClick?: (book: Ebook) => void;
  ebooks?: Ebook[];
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  onSearch,
  onBookClick,
  ebooks = [],
  placeholder = 'Cari buku...',
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState<Ebook[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);

    if (value.trim().length > 0) {
      const filtered = ebooks.filter(book =>
        book.title.toLowerCase().includes(value.toLowerCase()) ||
        book.author.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBooks(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredBooks([]);
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setFilteredBooks([]);
    setShowDropdown(false);
  };

  const handleBookClick = (book: Ebook) => {
    setQuery(book.title);
    setFilteredBooks([]);
    setShowDropdown(false);
    onBookClick?.(book);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-5 pr-12 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Hapus pencarian"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {showDropdown && filteredBooks.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full z-50 mt-3 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80"
          >
            <div className="py-2">
              {filteredBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="h-14 w-10 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                      BK
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-slate-900">{book.title}</p>
                    <p className="truncate text-sm font-semibold text-slate-500">{book.author}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                {filteredBooks.length} buku ditemukan
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
