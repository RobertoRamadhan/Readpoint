'use client';

import React from 'react';
import { Modal, Card, Button, StatusBadge } from '@/components/shared';

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
  reading_time_minutes?: number;
  notes?: string;
}

interface ValidationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ReadingActivity | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  loading?: boolean;
}

export default function ValidationDetailsModal({
  isOpen,
  onClose,
  activity,
  onApprove,
  onReject,
  loading = false
}: ValidationDetailsModalProps) {
  if (!activity) return null;

  const progress = Math.round((activity.pages_read / activity.total_pages) * 100);
  const potentialPoints = activity.pages_read * 5;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Student Info */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">👤 Informasi Siswa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">Nama</p>
                <p className="font-black text-gray-900">{activity.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">Email</p>
                <p className="font-black text-gray-900">{activity.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">Status</p>
                <StatusBadge status={activity.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">Dikirim</p>
                <p className="font-black text-gray-900">
                  {new Date(activity.completed_at || activity.started_at).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Book & Reading Info */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">📚 Detail Pembacaan</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-black text-gray-900 mb-3">{activity.ebook_title}</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600 font-bold">Kemajuan Baca</p>
                    <p className="font-black text-gray-900">{progress}%</p>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-3 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-bold">Halaman Dibaca</p>
                    <p className="font-black text-gray-900">{activity.pages_read} / {activity.total_pages}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-bold">Waktu Baca</p>
                    <p className="font-black text-gray-900">{activity.reading_time_minutes || 0} menit</p>
                  </div>
                </div>
              </div>
            </div>

            {activity.quiz_score && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-bold">📝 Skor Kuis</span>
                  <span className="font-black text-green-700 text-lg">{activity.quiz_score}%</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Points Calculation */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">💰 Perhitungan Poin</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span className="text-gray-700 font-bold">Halaman dibaca</span>
                <span className="font-black text-gray-900">{activity.pages_read} × 5 poin</span>
              </div>
              <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 p-3 rounded">
                <span className="text-blue-800 font-bold">Total Poin</span>
                <span className="font-black text-blue-700 text-lg">{potentialPoints} pts</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {activity.notes && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">📝 Catatan Siswa</h3>
              <p className="text-gray-700 font-semibold italic">{activity.notes}</p>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Tutup
          </Button>
          
          {activity.status === 'pending' && (
            <>
              <Button
                onClick={() => onReject(activity.id)}
                variant="danger"
                className="flex-1"
                disabled={loading}
              >
                ❌ Tolak
              </Button>
              <Button
                onClick={() => onApprove(activity.id)}
                variant="success"
                className="flex-1"
                disabled={loading}
              >
                ✅ Setujui
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
