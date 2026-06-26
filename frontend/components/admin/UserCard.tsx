'use client';

import React, { useState } from 'react';
import { GenericCard, Modal, Button } from '@/components/shared';
import type { CardAction, CardData } from '@/components/shared/GenericCard';
import { getRoleIcon } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  class_name?: string;
  total_points?: number;
  books_read?: number;
  quiz_average_score?: number;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onResetPassword: (userId: number) => void;
  onToggleStatus: (userId: number, active: boolean) => void;
  loading?: boolean;
}

export default function UserCard({
  user,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  loading = false
}: UserCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleDelete = () => {
    onDelete(user.id);
    setShowDeleteModal(false);
  };

  const handleResetPassword = () => {
    onResetPassword(user.id);
    setShowResetModal(false);
  };

  const cardData: CardData = {
    title: user.name,
    subtitle: user.email,
    status: user.is_active ? 'Aktif' : 'Tidak Aktif',
    statusVariant: user.is_active ? 'success' : 'secondary',
    metadata: [
      { label: 'Peran', value: user.role.charAt(0).toUpperCase() + user.role.slice(1), icon: getRoleIcon(user.role) },
      { label: 'Bergabung', value: new Date(user.created_at).toLocaleDateString('id-ID'), icon: '📅' },
      ...(user.class_name ? [{ label: 'Kelas', value: user.class_name, icon: '🏫' }] : []),
      ...(user.last_login ? [{ label: 'Login Terakhir', value: new Date(user.last_login).toLocaleDateString('id-ID'), icon: '🕐' }] : [])
    ],
    stats: user.role === 'siswa' ? [
      { label: 'Poin', value: user.total_points || 0, color: 'var(--primary-600)' },
      { label: 'Buku', value: user.books_read || 0, color: 'var(--primary-600)' },
      { label: 'Rata-rata Kuis', value: `${user.quiz_average_score || 0}%`, color: 'var(--primary-600)' }
    ] : undefined
  };

  const actions: CardAction[] = [
    { label: 'Edit', onClick: () => onEdit(user), variant: 'outline', disabled: loading },
    { label: 'Reset Kata Sandi', onClick: () => setShowResetModal(true), variant: 'secondary', disabled: loading },
    { label: user.is_active ? 'Nonaktifkan' : 'Aktifkan', onClick: () => onToggleStatus(user.id, !user.is_active), variant: 'secondary', disabled: loading },
    { label: 'Hapus', onClick: () => setShowDeleteModal(true), variant: 'danger', disabled: loading }
  ];

  return (
    <>
      <GenericCard
        data={cardData}
        actions={actions}
        hover
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-black text-gray-900 mb-2">Hapus User?</h3>
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              className="flex-1"
              disabled={loading}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🔑</div>
          <h3 className="text-lg font-black text-gray-900 mb-2">Reset Password?</h3>
          <p className="text-gray-600 mb-6">
            Reset password untuk <strong>{user.name}</strong>? 
            Password baru akan dikirim ke email user.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowResetModal(false)}
              variant="outline"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
