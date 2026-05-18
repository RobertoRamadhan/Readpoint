'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/shared';

export default function OverviewTab() {
  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="text-center pb-8">
          <h3 className="text-3xl md:text-4xl font-black text-amber-900">🚀 Panduan Penggunaan</h3>
          <p className="text-amber-700 font-semibold mt-2 text-base">Mulai petualangan literasi Anda sekarang</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GuideCard
              icon="📚"
              title="Baca Buku"
              description="Pilih buku favorit dan mulai baca. Dapatkan poin untuk setiap halaman yang dibaca."
              color="border-amber-200"
            />
            <GuideCard
              icon="❓"
              title="Selesaikan Quiz"
              description="Jawab pertanyaan tentang buku yang telah dibaca untuk mendapatkan bonus poin tambahan."
              color="border-orange-200"
            />
            <GuideCard
              icon="🎁"
              title="Tukar Rewards"
              description="Kumpulkan poin Anda dan tukarkan dengan rewards eksklusif yang tersedia."
              color="border-amber-300"
            />
          </div>
        </CardContent>
      </Card>

      <QuickStats />
    </div>
  );
}

function GuideCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  color: string;
}) {
  return (
    <Card className={`bg-white p-8 rounded-2xl border-2 ${color} shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center`}>
      <div className="text-5xl mb-4 flex justify-center">{icon}</div>
      <h4 className="font-black text-amber-900 mb-3 text-lg">{title}</h4>
      <p className="text-sm text-amber-800 font-semibold leading-relaxed">{description}</p>
    </Card>
  );
}

function QuickStats() {
  return (
    <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-orange-200 shadow-lg">
      <CardHeader className="text-center pb-8">
        <h3 className="text-2xl md:text-3xl font-black text-amber-900">📈 Tips Cepat Naik Level</h3>
        <p className="text-amber-700 font-semibold mt-2">Ikuti tips ini untuk memaksimalkan poin Anda</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TipCard
            tip="Baca buku setiap hari minimal 30 menit"
            points="+50 Poin/Hari"
            icon="⏰"
          />
          <TipCard
            tip="Selesaikan quiz dengan skor ≥80%"
            points="+100 Poin/Quiz"
            icon="🎯"
          />
          <TipCard
            tip="Baca buku dari kategori berbeda"
            points="+25 Poin/Kategori"
            icon="📚"
          />
          <TipCard
            tip="Ajak teman untuk ikut program"
            points="+75 Poin/Referral"
            icon="👥"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({ 
  tip, 
  points, 
  icon 
}: { 
  tip: string; 
  points: string; 
  icon: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border-2 border-amber-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-900 leading-tight">{tip}</p>
        <p className="text-xs font-black text-amber-600 mt-1">{points}</p>
      </div>
    </div>
  );
}
