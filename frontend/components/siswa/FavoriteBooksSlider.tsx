'use client';

import React, { useState, useEffect } from 'react';
import { LazyImage } from '@/components/shared';
import { normalizeFileUrl } from '@/lib/file-url';

interface Ebook {
  id: number;
  title: string;
  author: string;
  cover_image?: string;
  category: string;
  pdf_file?: string;
}

interface FavoriteBooksSliderProps {
  books: Ebook[];
  onBookClick?: (bookId: number) => void;
}

export default function FavoriteBooksSlider({ books, onBookClick }: FavoriteBooksSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const itemWidth = 280; // w-64 (16rem = 256px) + gap-4 (16px) = 272px, rounded to 280px

  useEffect(() => {
    if (books.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, books.length - itemsPerPage);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [books.length, itemsPerPage]);

  if (books.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, books.length - itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all sm:h-10 sm:w-10"
        >
          ◀
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all sm:h-10 sm:w-10"
        >
          ▶
        </button>

        {/* Slider Container */}
        <div className="overflow-hidden mx-10 sm:mx-12">
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-3 sm:gap-4"
            style={{ transform: `translateX(-${currentIndex * itemWidth}px)` }}
          >
            {books.map((book) => {
              const coverImageUrl = normalizeFileUrl(book.cover_image);

              return (
                <div
                  key={book.id}
                  className="w-56 sm:w-64 bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 flex flex-col flex-shrink-0"
                  onClick={() => onBookClick?.(book.id)}
                >
                  <div className="aspect-[2/3] bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 relative overflow-hidden flex-shrink-0">
                    {coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('[FavoriteBooksSlider] Image failed to load:', coverImageUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl opacity-50">📕</div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-shrink-0 sm:p-4">
                    <h3 className="font-black text-slate-900 text-xs line-clamp-2 mb-1 sm:text-sm">{book.title}</h3>
                    <p className="text-[10px] text-slate-600 line-clamp-1 sm:text-xs">{book.author}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1.5 mt-4 sm:gap-2 sm:mt-6">
          {Array.from({ length: Math.ceil(books.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
              className={`h-1.5 rounded-full transition-all sm:h-2 ${
                Math.floor(currentIndex / itemsPerPage) === index ? 'bg-slate-900 w-3 sm:w-4' : 'bg-slate-300 w-1.5 sm:w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
