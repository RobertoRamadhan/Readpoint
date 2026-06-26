'use client';

import React from 'react';
import { Button } from '@/components/shared';

interface ValidationFiltersProps {
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected';
  onFilterChange: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingCount: number;
}

export default function ValidationFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  pendingCount
}: ValidationFiltersProps) {
  const filters = [
    { key: 'all' as const, label: 'Semua', count: null },
    { key: 'pending' as const, label: 'Menunggu', count: pendingCount },
    { key: 'approved' as const, label: 'Disetujui', count: null },
    { key: 'rejected' as const, label: 'Ditolak', count: null }
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari berdasarkan nama siswa atau judul buku..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
            />
            <div className="absolute left-4 top-3.5 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              variant={activeFilter === filter.key ? 'primary' : 'outline'}
              size="sm"
              className="relative"
            >
              {filter.label}
              {filter.count !== null && filter.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {filter.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
