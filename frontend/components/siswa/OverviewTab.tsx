'use client';

import React from 'react';

export default function OverviewTab() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700 sm:text-sm">Panduan Siswa</p>
          <h3 className="mt-3 text-xl font-black leading-tight text-slate-900 sm:mt-4 sm:text-2xl lg:text-3xl">Mulai aktivitas literasi kamu</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:mt-4 sm:text-base">
            Baca buku, pahami isi bacaan lewat kuis, lalu kumpulkan poin untuk menukar reward.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3 lg:mt-10">
          <GuideCard
            title="Baca Buku"
            description="Pilih e-book favorit, lanjutkan progres membaca, dan nikmati pengalaman membaca yang nyaman."
          />
          <GuideCard
            title="Selesaikan Kuis"
            description="Jawab pertanyaan dari buku yang sudah dibaca untuk membuktikan pemahaman kamu."
          />
          <GuideCard
            title="Tukar Reward"
            description="Kumpulkan poin dan tukarkan dengan reward yang tersedia di sekolah."
          />
        </div>
      </section>

      <QuickTips />
    </div>
  );
}

function GuideCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md sm:p-5 lg:p-6">
      <h4 className="text-base font-black text-slate-900 sm:text-lg lg:text-xl">{title}</h4>
      <p className="mt-2 text-xs font-medium leading-6 text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">{description}</p>
    </div>
  );
}

function QuickTips() {
  const tips = [
    { tip: 'Baca buku sedikit demi sedikit setiap hari', points: 'Konsistensi' },
    { tip: 'Kerjakan kuis setelah selesai membaca', points: 'Bonus poin' },
    { tip: 'Coba buku dari kategori berbeda', points: 'Wawasan baru' },
    { tip: 'Tukar poin saat reward masih tersedia', points: 'Hadiah' },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700 sm:text-sm">Tips Cepat</p>
        <h3 className="mt-3 text-xl font-black leading-tight text-slate-900 sm:mt-4 sm:text-2xl lg:text-3xl">Cara membuat poin kamu cepat bertambah</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7">Ikuti kebiasaan kecil ini agar aktivitas membaca lebih terarah.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2 lg:mt-10">
        {tips.map((item) => (
          <TipCard key={item.tip} {...item} />
        ))}
      </div>
    </section>
  );
}

function TipCard({ tip, points }: { tip: string; points: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md sm:p-5 lg:p-6">
      <p className="text-sm font-black leading-6 text-slate-900 sm:text-base sm:leading-7">{tip}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 sm:mt-3 sm:text-xs">{points}</p>
    </div>
  );
}
