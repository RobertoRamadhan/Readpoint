'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/shared';

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  poin_per_halaman: number;
  category: string;
  cover_image?: string;
  pdf_file?: string;
  read_count?: number;
}

interface BookGridProps {
  ebooks: Ebook[];
  loading?: boolean;
  showCarousel?: boolean;
  searchQuery?: string;
}

export default function BookGrid({ ebooks, loading, showCarousel = false, searchQuery = '' }: BookGridProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Filter books based on search query
  const filteredBooks = searchQuery
    ? ebooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ebooks;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-t-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredBooks.length === 0 && searchQuery) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-12 text-center border-2 border-blue-200">
        <p className="text-gray-800 font-black text-lg">🔍 Tidak ada buku yang cocok dengan pencarian "{searchQuery}"</p>
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-12 text-center border-2 border-blue-200">
        <p className="text-gray-800 font-black text-lg">📚 Belum ada e-books tersedia</p>
      </div>
    );
  }

  const displayBooks = showCarousel 
    ? filteredBooks.slice(carouselIndex, carouselIndex + 4)
    : filteredBooks;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {showCarousel && filteredBooks.length > 4 && (
        <CarouselControls
          totalItems={filteredBooks.length}
          itemsPerPage={4}
          currentIndex={carouselIndex}
          onIndexChange={setCarouselIndex}
        />
      )}
    </div>
  );
}

function BookCard({ book }: { book: Ebook }) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const isTitleLong = book.title.length > 20;
  const [imageError, setImageError] = useState(false);

  // Ensure cover_image is a full URL
  const getCoverImageUrl = () => {
    if (!book.cover_image) return null;
    
    // If already a full URL, return as is
    if (book.cover_image.startsWith('http')) {
      return book.cover_image;
    }
    
    // If it's a relative path, construct full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://readpoint-backend-main-odr7ck.laravel.cloud';
    return `${baseUrl}/storage/${book.cover_image}`;
  };

  const coverImageUrl = getCoverImageUrl();

  return (
    <Card hover className="overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="aspect-[2/3] bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center relative overflow-hidden">
        {coverImageUrl && !imageError ? (
          <img
            src={coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              console.error('[BookCard] Image failed to load:', coverImageUrl);
              setImageError(true);
            }}
            loading="lazy"
          />
        ) : (
          <div className="text-5xl opacity-50">📕</div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 bg-white">
        <div className="mb-3">
          <div className="flex items-start gap-1">
            <h3 
              className={`font-black text-gray-900 text-sm leading-tight ${isTitleExpanded ? '' : 'line-clamp-1'}`}
              title={book.title}
            >
              {book.title}
            </h3>
            {isTitleLong && (
              <button
                onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                className="text-blue-600 hover:text-blue-800 text-base font-bold mt-0.5 flex-shrink-0"
                title={isTitleExpanded ? 'Tutup' : 'Lihat judul lengkap'}
              >
                {isTitleExpanded ? '▲' : '...'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600 font-medium mt-1">{book.author}</p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-100">
            <span className="text-gray-700 font-semibold text-xs">📄 Halaman</span>
            <span className="font-black text-gray-500 text-sm">{book.pages}</span>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
            <span className="text-gray-700 font-semibold text-xs">⭐ Poin</span>
            <span className="font-black text-emerald-700 text-sm">{book.poin_per_halaman}/hal</span>
          </div>
        </div>
        
        {book.pdf_file ? (
          <>
            <Link href={`/dashboard/siswa/read/${book.id}`} className="block mb-2">
              <Button className="w-full bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white font-bold shadow-md hover:shadow-lg transition-all border-0 py-4 px-8 text-base">
                📖 Baca Sekarang
              </Button>
            </Link>
            <a 
              href={book.pdf_file} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-md hover:shadow-lg transition-all border-0 py-2 px-8 text-sm">
                📥 Download PDF
              </Button>
            </a>
          </>
        ) : (
          <Button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-4 px-8 text-base cursor-not-allowed">
            📖 Belum Tersedia
          </Button>
        )}
      </div>
    </Card>
  );
}

function CarouselControls({ 
  totalItems, 
  itemsPerPage, 
  currentIndex, 
  onIndexChange 
}: { 
  totalItems: number; 
  itemsPerPage: number; 
  currentIndex: number; 
  onIndexChange: (index: number) => void;
}) {
  const maxIndex = Math.max(0, totalItems - itemsPerPage);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrevious = () => {
    onIndexChange(Math.max(0, currentIndex - itemsPerPage));
  };

  const handleNext = () => {
    onIndexChange(currentIndex + itemsPerPage >= totalItems ? 0 : currentIndex + itemsPerPage);
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <Button
        onClick={handlePrevious}
        size="sm"
        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
      >
        ◀
      </Button>
      
      <div className="flex gap-2">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            onClick={() => onIndexChange(idx * itemsPerPage)}
            className={`transition-all duration-300 rounded-full w-3 h-3 ${
              currentIndex === idx * itemsPerPage
                ? 'bg-blue-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
      
      <Button
        onClick={handleNext}
        size="sm"
        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
      >
        ▶
      </Button>
    </div>
  );
}
