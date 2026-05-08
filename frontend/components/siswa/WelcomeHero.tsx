'use client';

import React from 'react';

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
    <div className="mb-10 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-none shadow-xl shadow-amber-500/30 p-8 md:p-10 relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">👋</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Selamat Datang, {userName || 'Siswa'}!</h2>
        </div>
        <p className="mb-8 font-medium max-w-2xl leading-relaxed text-lg text-white">
          Lanjutkan perjalanan literasi Anda, baca lebih banyak buku, selesaikan quiz, dan kumpulkan rewards eksklusif.
        </p>

        {/* Quick Action Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
    <div className="bg-white/95 backdrop-blur-sm border border-amber-200 rounded-xl p-4 text-center hover:bg-white hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-amber-700">{value}</p>
      <p className="text-xs text-amber-600 font-medium">{label}</p>
    </div>
  );
}
