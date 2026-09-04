'use client';

import React from 'react';
import { Card } from '@/components/shared';

interface AnalyticsChartProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: unknown[];
  height?: number;
  loading?: boolean;
}

export default function AnalyticsChart({ 
  title, 
  type, 
  data, 
  height = 300, 
  loading = false 
}: AnalyticsChartProps) {
  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="font-black text-gray-900 mb-4">{title}</h3>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="font-black text-gray-900 mb-4">{title}</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-gray-200">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600 font-semibold">Chart Placeholder</p>
            <p className="text-sm text-gray-500 mt-1">Type: {type}</p>
            <p className="text-sm text-gray-500">Data points: {data.length}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
