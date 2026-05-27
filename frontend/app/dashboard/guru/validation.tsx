'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/shared';
import ValidationCard from '@/components/guru/ValidationCard';
import ValidationStats from '@/components/guru/ValidationStats';
import ValidationFilters from '@/components/guru/ValidationFilters';
import ValidationDetailsModal from '@/components/guru/ValidationDetailsModal';

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

interface ValidationStats {
  pending_count: number;
  approved_today: number;
  rejected_today: number;
  total_validated: number;
  points_distributed_today: number;
}

export default function ValidationPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activities, setActivities] = useState<ReadingActivity[]>([]);
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ReadingActivity | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'guru') {
      router.push('/login');
      return;
    }

    loadValidationData();
  }, [mounted, loading, isAuthenticated, user, router]);

  const loadValidationData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Load pending validations
      const validationsRes = await api.validations.getPending();
      if (validationsRes?.data) {
        setActivities(validationsRes.data as ReadingActivity[]);
      }

      // Load validation stats
      const statsRes = await api.validations.getStatistics();
      if (statsRes) {
        setStats(statsRes.data as ValidationStats);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load validation data';
      setError(errorMsg);
      console.error('[Validation] Error:', errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true);
      await api.validations.approve(id);
      
      // Refresh data
      await loadValidationData();
      setDetailsModalOpen(false);
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActionLoading(true);
      // Reject with empty notes
      await api.validations.reject(id, '');
      
      // Refresh data
      await loadValidationData();
      setDetailsModalOpen(false);
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (id: number) => {
    const activity = activities.find(a => a.id === id);
    if (activity) {
      setSelectedActivity(activity);
      setDetailsModalOpen(true);
    }
  };

  const getFilteredActivities = () => {
    let filtered = activities;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.user_name.toLowerCase().includes(query) ||
        activity.user_email.toLowerCase().includes(query) ||
        activity.ebook_title.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'guru') {
    return null;
  }

  const filteredActivities = getFilteredActivities();
  const pendingCount = activities.filter(a => a.status === 'pending').length;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <ValidationStats stats={stats} loading={loadingData} />
          )}

          {/* Filters */}
          <ValidationFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pendingCount={pendingCount}
          />

          {/* Activities List */}
          {loadingData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <p className="text-gray-800 font-black text-lg">
                {activeFilter === 'pending' ? '🎉 Tidak ada validasi pending' : '📋 Tidak ada data validasi'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredActivities.map((activity) => (
                <ValidationCard
                  key={activity.id}
                  activity={activity}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={handleViewDetails}
                  loading={actionLoading}
                />
              ))}
            </div>
          )}

          {/* Details Modal */}
          <ValidationDetailsModal
            isOpen={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            activity={selectedActivity}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
}
