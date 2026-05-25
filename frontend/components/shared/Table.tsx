'use client';

import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  onRowClick?: (row: T) => void;
}

export default function Table<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  striped = true,
  hoverable = true,
  compact = false,
  onRowClick,
}: TableProps<T>) {
  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';
  const textSizeClass = compact ? 'text-sm' : 'text-base';

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-secondary-200 p-8">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg border border-secondary-200 p-8 text-center">
        <p className="text-secondary-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-secondary-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary-50 border-b border-secondary-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`${paddingClass} ${textSizeClass} font-semibold text-secondary-900 text-${col.align || 'left'}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              className={`border-b border-secondary-200 transition-colors duration-200 ${
                striped && rowIdx % 2 === 1 ? 'bg-secondary-50' : 'bg-white'
              } ${hoverable ? 'hover:bg-primary-50 cursor-pointer' : ''} ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`${paddingClass} ${textSizeClass} text-secondary-700 text-${col.align || 'left'}`}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
