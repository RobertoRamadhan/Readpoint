'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/shared';
import UserCard from '@/components/admin/UserCard';
import UserForm from '@/components/admin/UserForm';
import UserFilters from '@/components/admin/UserFilters';

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

export default function UsersPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'all' | 'admin' | 'guru' | 'siswa'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    loadUsers();
  }, [mounted, loading, isAuthenticated, user, router]);

  const loadUsers = async () => {
    try {
      setLoadingData(true);
      setError(null);

      const usersRes = await api.users.list();
      if (usersRes?.data) {
        setUsers(usersRes.data as User[]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMsg);
      console.error('[Users] Error:', errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateUser = async (userData: User) => {
    try {
      setActionLoading(true);
      await api.users.create(userData as unknown as Record<string, unknown>);
      
      // Refresh data
      await loadUsers();
      setShowFormModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error; // Re-throw to let form handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (userData: User) => {
    try {
      setActionLoading(true);
      await api.users.update(userData.id!, userData as unknown as Record<string, unknown>);
      
      // Refresh data
      await loadUsers();
      setShowFormModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error; // Re-throw to let form handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setActionLoading(true);
      await api.users.delete(userId);
      
      // Refresh data
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = window.prompt('Masukkan password baru untuk user ini (min 6 karakter):');
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    try {
      setActionLoading(true);
      await api.users.resetPassword(userId, newPassword);
      alert('Password berhasil direset.');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Gagal reset password. Silakan coba lagi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, active: boolean) => {
    try {
      setActionLoading(true);
      await api.users.update(userId, { is_active: active });
      
      // Refresh data
      await loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitUser = async (userData: User) => {
    try {
      if (editingUser) {
        await handleUpdateUser(userData);
      } else {
        await handleCreateUser(userData);
      }
    } catch (error) {
      // Form will handle the error display
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by role
    if (activeRole !== 'all') {
      filtered = filtered.filter(user => user.role === activeRole);
    }

    // Filter by status
    if (activeStatus !== 'all') {
      filtered = filtered.filter(user => 
        activeStatus === 'active' ? user.is_active : !user.is_active
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.class_name && user.class_name.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Filters */}
          <UserFilters
            activeRole={activeRole}
            onRoleChange={setActiveRole}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddUser={() => {
              setEditingUser(null);
              setShowFormModal(true);
            }}
          />

          {/* Users Grid */}
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <p className="text-gray-800 font-black text-lg">
                {searchQuery || activeRole !== 'all' || activeStatus !== 'all' 
                  ? '🔍 Tidak ada user yang cocok dengan filter' 
                  : '👥 Belum ada user'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={(user) => {
                    setEditingUser(user);
                    setShowFormModal(true);
                  }}
                  onDelete={handleDeleteUser}
                  onResetPassword={handleResetPassword}
                  onToggleStatus={handleToggleStatus}
                  loading={actionLoading}
                />
              ))}
            </div>
          )}

          {/* User Form Modal */}
          <UserForm
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingUser(null);
            }}
            onSubmit={handleSubmitUser}
            editingUser={editingUser}
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
}
