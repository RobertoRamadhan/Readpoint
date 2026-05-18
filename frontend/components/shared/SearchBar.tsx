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



    // Filter books based on query

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

      <div className="flex items-center gap-3">

        {/* Icon on the left */}

        <div className="flex-shrink-0">

          <span className="text-3xl text-amber-500">🔍</span>

        </div>



        {/* Input field on the right with dropdown */}

        <div className="relative flex-1">

          <input

            type="text"

            value={query}

            onChange={handleChange}

            placeholder={placeholder}

            className="w-full px-4 py-3 pr-12 bg-white border-2 border-amber-200 rounded-xl shadow-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-gray-800 font-medium placeholder-gray-400"

          />

          {query && (

            <button

              onClick={handleClear}

              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"

              title="Hapus pencarian"

            >

              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

              </svg>

            </button>

          )}



          {/* Dropdown */}

          {showDropdown && filteredBooks.length > 0 && (

            <div

              ref={dropdownRef}

              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-amber-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"

            >

              <div className="py-2">

                {filteredBooks.map((book) => (

                  <button

                    key={book.id}

                    onClick={() => handleBookClick(book)}

                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-50 transition-colors text-left"

                  >

                    {book.cover_image ? (

                      <img

                        src={book.cover_image}

                        alt={book.title}

                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"

                      />

                    ) : (

                      <div className="w-10 h-14 bg-amber-100 rounded-lg flex-shrink-0 flex items-center justify-center">

                        <span className="text-amber-600 text-lg">📕</span>

                      </div>

                    )}

                    <div className="flex-1 min-w-0">

                      <p className="font-semibold text-gray-900 truncate">{book.title}</p>

                      <p className="text-sm text-gray-600 truncate">{book.author}</p>

                    </div>

                  </button>

                ))}

              </div>

              <div className="border-t border-amber-200 px-4 py-2 bg-amber-50">

                <p className="text-xs text-amber-700 font-medium">

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

