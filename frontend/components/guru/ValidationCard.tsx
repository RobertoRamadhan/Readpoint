'use client';

import React from 'react';
import { GenericCard } from '@/components/shared';
import type { CardAction, CardData } from '@/components/shared/GenericCard';

interface ReadingActivity {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  ebook_id: number;
  ebook_title: string;
  pages_read: number;
  total_pages: number;
  started_at: string;
  completed_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  points_earned?: number;
  quiz_score?: number;
}

interface ValidationCardProps {
  activity: ReadingActivity;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetails: (id: number) => void;
  loading?: boolean;
}

export default function ValidationCard({
  activity,
  onApprove,
  onReject,
  onViewDetails,
  loading = false
}: ValidationCardProps) {
  const progress = Math.round((activity.pages_read / activity.total_pages) * 100);
  
  const getStatusVariant = (status: string): 'success' | 'danger' | 'secondary' => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return 'Menunggu';
    }
  };

  const cardData: CardData = {
    title: activity.user_name,
    subtitle: activity.user_email,
    status: getStatusLabel(activity.status),
    statusVariant: getStatusVariant(activity.status),
    metadata: [
      { label: 'Buku', value: activity.ebook_title, icon: '📚' },
      { label: 'Dikirim', value: new Date(activity.completed_at || activity.started_at).toLocaleDateString('id-ID'), icon: '📅' },
      { label: 'Halaman', value: `${activity.pages_read} / ${activity.total_pages}`, icon: '📄' },
      ...(activity.quiz_score ? [{ label: 'Skor Kuis', value: `${activity.quiz_score}%`, icon: '🎯' }] : [])
    ],
    stats: [
      { label: 'Kemajuan', value: `${progress}%`, color: 'var(--primary-600)' },
      { label: 'Poin Potensial', value: `${activity.pages_read * 5} poin`, color: 'var(--primary-600)' }
    ]
  };

  const actions: CardAction[] = [
    { label: 'Detail', onClick: () => onViewDetails(activity.id), variant: 'outline' as const, disabled: loading },
    ...(activity.status === 'pending' ? [
      { label: 'Tolak', onClick: () => onReject(activity.id), variant: 'danger' as const, disabled: loading },
      { label: 'Setujui', onClick: () => onApprove(activity.id), variant: 'success' as const, disabled: loading }
    ] : [])
  ];

  const customContent = (data: CardData) => (
    <div className="space-y-4">
      {data.description && (
        <p className="text-gray-700 text-sm font-medium line-clamp-3">
          {data.description}
        </p>
      )}
      
      {/* Progress Bar */}
      <div>
        <p className="text-gray-600 font-bold mb-2">Kemajuan Membaca</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-black text-gray-900 text-sm w-12 text-right">{progress}%</span>
        </div>
      </div>
      
      {data.metadata && data.metadata.length > 0 && (
        <div className="space-y-2">
          {data.metadata.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium flex items-center gap-2">
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </span>
              <span className="text-gray-900 font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {data.stats && data.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {data.stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold" style={{ color: stat.color || 'var(--primary-600)' }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <GenericCard
      data={cardData}
      actions={actions}
      hover
      loading={loading}
      renderContent={customContent}
    />
  );
}
