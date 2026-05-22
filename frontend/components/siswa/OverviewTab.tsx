'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/shared';

export default function OverviewTab() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border border-[#E6D8B8] bg-gradient-to-br from-[#FFFDF7] via-white to-[#FAF3E0] shadow-xl shadow-[#1E3A5F]/10">
        <CardHeader className="pb-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#2E7D32]">Panduan Siswa</p>
          <h3 className="mt-3 text-3xl font-black text-[#1E3A5F] md:text-4xl">Mulai petualangan literasi kamu</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#5A5146] md:text-base">
            Baca buku, pahami isi bacaan lewat kuis, lalu kumpulkan poin untuk menukar reward.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <GuideCard
              icon="📚"
              title="Baca Buku"
              description="Pilih e-book favorit, lanjutkan progres membaca, dan nikmati pengalaman membaca yang nyaman."
              color="bg-[#2E7D32]"
            />
            <GuideCard
              icon="🎯"
              title="Selesaikan Kuis"
              description="Jawab pertanyaan dari buku yang sudah dibaca untuk membuktikan pemahaman kamu."
              color="bg-[#1E3A5F]"
            />
            <GuideCard
              icon="🎁"
              title="Tukar Reward"
              description="Kumpulkan poin sebanyak mungkin dan tukarkan dengan reward yang tersedia di sekolah."
              color="bg-[#F4B400]"
            />
          </div>
        </CardContent>
      </Card>

      <QuickTips />
    </div>
  );
}

function GuideCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group rounded-[1.5rem] border border-[#E6D8B8] bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1E3A5F]/10">
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${color} text-3xl shadow-lg transition-transform group-hover:scale-105`}>
        {icon}
      </div>
      <h4 className="mt-5 text-xl font-black text-[#1E3A5F]">{title}</h4>
      <p className="mt-3 text-sm font-medium leading-7 text-[#5A5146]">{description}</p>
    </div>
  );
}

function QuickTips() {
  const tips = [
    { tip: 'Baca buku sedikit demi sedikit setiap hari', points: '+Konsistensi', icon: '⏰' },
    { tip: 'Kerjakan kuis setelah selesai membaca', points: '+Bonus poin', icon: '🎯' },
    { tip: 'Coba buku dari kategori berbeda', points: '+Wawasan baru', icon: '📚' },
    { tip: 'Tukar poin saat reward masih tersedia', points: '+Hadiah', icon: '🏆' },
  ];

  return (
    <Card className="border border-[#E6D8B8] bg-white shadow-lg shadow-[#1E3A5F]/5">
      <CardHeader className="pb-6 text-center">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#2E7D32]">Tips cepat</p>
        <h3 className="mt-3 text-2xl font-black text-[#1E3A5F] md:text-3xl">Cara membuat poin kamu cepat bertambah</h3>
        <p className="mt-2 text-sm font-semibold text-[#5A5146]">Ikuti kebiasaan kecil ini agar aktivitas membaca lebih terarah.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tips.map((item) => (
            <TipCard key={item.tip} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard({
  tip,
  points,
  icon,
}: {
  tip: string;
  points: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-[#E6D8B8] bg-[#FAF3E0] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#FFFDF7] hover:shadow-md">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-black leading-6 text-[#1E3A5F]">{tip}</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#2E7D32]">{points}</p>
      </div>
    </div>
  );
}
