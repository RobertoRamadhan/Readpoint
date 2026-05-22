'use client';

import React from 'react';

export default function OverviewTab() {
  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Panduan Siswa</p>
          <h3 className="mt-5 text-3xl font-black leading-tight text-slate-900 md:text-4xl">Mulai aktivitas literasi kamu</h3>
          <p className="mt-5 leading-8 text-slate-600">
            Baca buku, pahami isi bacaan lewat kuis, lalu kumpulkan poin untuk menukar reward.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
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
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
      <h4 className="text-xl font-black text-slate-900">{title}</h4>
      <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{description}</p>
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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Tips Cepat</p>
        <h3 className="mt-5 text-2xl font-black leading-tight text-slate-900 md:text-3xl">Cara membuat poin kamu cepat bertambah</h3>
        <p className="mt-4 leading-7 text-slate-600">Ikuti kebiasaan kecil ini agar aktivitas membaca lebih terarah.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {tips.map((item) => (
          <TipCard key={item.tip} {...item} />
        ))}
      </div>
    </section>
  );
}

function TipCard({ tip, points }: { tip: string; points: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md">
      <p className="text-base font-black leading-7 text-slate-900">{tip}</p>
      <p className="mt-3 text-xs font-black uppercase tracking-widest text-emerald-700">{points}</p>
    </div>
  );
}
