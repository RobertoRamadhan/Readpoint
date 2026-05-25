'use client';

import React from 'react';
import { Card } from '@/components/shared';

interface ValidationStats {
  pending_count: number;
  approved_today: number;
  rejected_today: number;
  total_validated: number;
  points_distributed_today: number;
}

interface ValidationStatsProps {
  stats: ValidationStats;
  loading?: boolean;
}

export default function ValidationStats({ stats, loading }: ValidationStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: '⏳ Pending',
      value: stats.pending_count,
      color: 'from-emerald-400 to-emerald-500',
      textColor: 'text-emerald-700'
    },
    {
      title: '✅ Approved Today',
      value: stats.approved_today,
      color: 'from-green-400 to-emerald-500',
      textColor: 'text-green-700'
    },
    {
      title: '❌ Rejected Today',
      value: stats.rejected_today,
      color: 'from-red-400 to-pink-500',
      textColor: 'text-red-700'
    },
    {
      title: '📊 Total Validated',
      value: stats.total_validated,
      color: 'from-blue-400 to-indigo-500',
      textColor: 'text-blue-700'
    },
    {
      title: '💰 Points Distributed',
      value: stats.points_distributed_today,
      color: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  color, 
  textColor 
}: { 
  title: string; 
  value: number; 
  color: string; 
  textColor: string;
}) {
  return (
    <Card className={`bg-gradient-to-br ${color} text-white border-2 border-white/30`}>
      <div className="p-4 text-center">
        <p className="text-white/90 text-sm font-bold mb-2">{title}</p>
        <p className={`text-3xl font-black ${textColor}`}>{value}</p>
      </div>
    </Card>
  );
}
