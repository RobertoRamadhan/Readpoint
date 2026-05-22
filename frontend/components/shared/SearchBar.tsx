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

    if (onBookClick) {

      onBookClick(book);

    }

  };



  const handleClickOutside = (event: MouseEvent) => {

    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {

      setShowDropdown(false);

    }

  };



  useEffect(() => {

    document.addEventListener('mousedown', handleClickOutside);

    return () => {

      document.removeEventListener('mousedown', handleClickOutside);

    };

  }, []);



  return (

    <div className={`w-full ${className}`}>

      <div className="flex items-center gap-2 sm:gap-3">

        <div className="flex-shrink-0">

          <span className="text-2xl sm:text-3xl text-slate-600">🔍</span>

        </div>



        <div className="relative flex-1">

          <input

            type="text"

            value={query}

            onChange={handleChange}

            placeholder={placeholder}

            className="w-full px-3 py-2 pr-10 bg-white border-2 border-slate-200 rounded-lg shadow-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all text-slate-800 font-medium placeholder-slate-400 text-sm sm:px-4 sm:py-3 sm:rounded-xl"

          />

          {query && (

            <button

              onClick={handleClear}

              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors sm:right-4"

              title="Hapus pencarian"

            >

              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

              </svg>

            </button>

          )}



          {showDropdown && filteredBooks.length > 0 && (

            <div

              ref={dropdownRef}

              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto sm:rounded-xl"

            >

              <div className="py-1.5 sm:py-2">

                {filteredBooks.map((book) => (

                  <button

                    key={book.id}

                    onClick={() => handleBookClick(book)}

                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left sm:px-4 sm:py-3 sm:gap-3"

                  >

                    {book.cover_image ? (

                      <img

                        src={book.cover_image}

                        alt={book.title}

                        className="w-8 h-12 object-cover rounded-lg flex-shrink-0 sm:w-10 sm:h-14"

                      />

                    ) : (

                      <div className="w-8 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center sm:w-10 sm:h-14">

                        <span className="text-slate-600 text-sm sm:text-lg">📕</span>

                      </div>

                    )}

                    <div className="flex-1 min-w-0">

                      <p className="font-semibold text-slate-900 truncate text-xs sm:text-sm">{book.title}</p>

                      <p className="text-xs text-slate-600 truncate sm:text-sm">{book.author}</p>

                    </div>

                  </button>

                ))}

              </div>

              <div className="border-t border-slate-200 px-3 py-1.5 bg-slate-50 sm:px-4 sm:py-2">

                <p className="text-xs text-slate-700 font-medium">

                  {filteredBooks.length} buku ditemukan

                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

