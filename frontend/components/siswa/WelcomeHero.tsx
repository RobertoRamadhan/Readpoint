'use client';

import React from 'react';
import { Card } from '@/components/shared';

interface SiswaStats {
  total_points: number;
  books_read: number;
  pages_read: number;
  quizzes_taken: number;
}

interface WelcomeHeroProps {
  stats: SiswaStats | null;
  userName?: string;
}

export default function WelcomeHero({ stats, userName }: WelcomeHeroProps) {
  return (
    <div className="mb-10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-800 rounded-2xl shadow-xl shadow-emerald-500/30 p-8 md:p-10 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-200 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👋</span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Selamat Datang, {userName || 'Siswa'}!
          </h2>
        </div>
        <p className="mb-8 font-medium max-w-2xl leading-relaxed text-emerald-100 text-sm md:text-base">
          Lanjutkan perjalanan literasi Anda — baca lebih banyak buku, selesaikan quiz, dan kumpulkan rewards eksklusif.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Poin Saya" value={stats?.total_points ?? 0} icon="⭐" />
          <StatCard label="Buku Dibaca" value={stats?.books_read ?? 0} icon="📚" />
          <StatCard label="Halaman" value={stats?.pages_read ?? 0} icon="📄" />
          <StatCard label="Quiz Selesai" value={stats?.quizzes_taken ?? 0} icon="✅" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card
      hover
      padding="sm"
      shadow="sm"
      className="text-center bg-white/95 backdrop-blur-sm border-emerald-100"
    >
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-black text-emerald-700">{value.toLocaleString()}</p>
      <p className="text-xs text-emerald-600 font-semibold mt-0.5">{label}</p>
    </Card>
  );
}
