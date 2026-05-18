'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './BookSearchBar.module.css';

interface Ebook {
  id: number;
  title: string;
  author: string;
  cover_image?: string;
  pdf_file?: string;
}

interface BookSearchBarProps {
  onSearch: (query: string) => void;
  onBookClick?: (book: Ebook) => void;
  ebooks?: Ebook[];
  placeholder?: string;
  className?: string;
}

export default function BookSearchBar({
  onSearch,
  onBookClick,
  ebooks = [],
  placeholder = 'Cari buku...',
  className = ''
}: BookSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState<Ebook[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
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
    <div className={`${styles.group} ${className}`}>
      {/* Icon */}
      <div className={styles.icon}>🔍</div>

      {/* Input and Dropdown Container */}
      <div className="relative w-full" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim().length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={styles.input}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}

        {/* Dropdown */}
        {showDropdown && filteredBooks.length > 0 && (
          <div className={styles.dropdown}>
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book)}
                className={styles.dropdownItem}
              >
                <div className={styles.dropdownItemTitle}>{book.title}</div>
                <div className={styles.dropdownItemAuthor}>{book.author}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
