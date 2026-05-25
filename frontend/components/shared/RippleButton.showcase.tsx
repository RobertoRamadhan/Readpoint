'use client';

import React from 'react';
import { RippleButton } from '@/components/shared';

/**
 * CONTOH PENGGUNAAN RIPPLE BUTTON
 * 
 * RippleButton adalah komponen tombol dengan animasi ripple effect yang elegan
 * Disesuaikan dengan brand color READPOINT (emerald/emerald)
 * 
 * Fitur:
 * - 5 variant: primary, secondary, success, danger, outline
 * - 3 ukuran: small, medium, large
 * - Support loading state
 * - Support full width
 * - Support icon
 * - Ripple effect animasi saat hover
 */

export default function RippleButtonShowcase() {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const toggleLoading = (id: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">Ripple Button Showcase</h1>
          <p className="text-emerald-700 text-lg">Komponen button dengan animasi ripple effect elegan</p>
        </div>

        {/* Variants */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Variants</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <RippleButton variant="primary">
              Primary Button
            </RippleButton>
            <RippleButton variant="secondary">
              Secondary Button
            </RippleButton>
            <RippleButton variant="success">
              Success Button
            </RippleButton>
            <RippleButton variant="danger">
              Danger Button
            </RippleButton>
            <RippleButton variant="outline">
              Outline Button
            </RippleButton>
          </div>
        </section>

        {/* Sizes */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Sizes</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <RippleButton size="small">
              Small Button
            </RippleButton>
            <RippleButton size="medium">
              Medium Button
            </RippleButton>
            <RippleButton size="large">
              Large Button
            </RippleButton>
          </div>
        </section>

        {/* With Icons */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">With Icons</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <RippleButton icon="📚">
              Baca Buku
            </RippleButton>
            <RippleButton variant="success" icon="✅">
              Selesai Kuis
            </RippleButton>
            <RippleButton variant="danger" icon="🗑️">
              Hapus
            </RippleButton>
            <RippleButton variant="outline" icon="💾">
              Simpan
            </RippleButton>
          </div>
        </section>

        {/* Full Width */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Full Width</h2>
          <div className="space-y-4 max-w-md">
            <RippleButton fullWidth>
              Full Width Button
            </RippleButton>
            <RippleButton variant="secondary" fullWidth>
              Secondary Full Width
            </RippleButton>
          </div>
        </section>

        {/* Loading State */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Loading State</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <RippleButton
              loading={loadingStates['btn1'] || false}
              onClick={() => toggleLoading('btn1')}
            >
              {loadingStates['btn1'] ? 'Loading...' : 'Click me'}
            </RippleButton>
            <RippleButton
              variant="success"
              loading={loadingStates['btn2'] || false}
              onClick={() => toggleLoading('btn2')}
            >
              {loadingStates['btn2'] ? 'Processing...' : 'Submit'}
            </RippleButton>
          </div>
          <p className="text-sm text-emerald-700 mt-4">Klik button untuk toggle loading state</p>
        </section>

        {/* Disabled State */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Disabled State</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <RippleButton disabled>
              Disabled Button
            </RippleButton>
            <RippleButton variant="secondary" disabled>
              Disabled Secondary
            </RippleButton>
            <RippleButton variant="success" disabled>
              Disabled Success
            </RippleButton>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-16 bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8">Contoh Penggunaan</h2>
          
          <div className="space-y-8">
            {/* Login Form Example */}
            <div className="bg-emerald-50 p-6 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-4">Login Form:</h3>
              <div className="space-y-4 max-w-sm">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full px-4 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full px-4 py-2 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <RippleButton fullWidth>
                  Masuk Sekarang
                </RippleButton>
                <RippleButton variant="outline" fullWidth>
                  Daftar
                </RippleButton>
              </div>
            </div>

            {/* Dashboard Actions Example */}
            <div className="bg-emerald-50 p-6 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-4">Dashboard Actions:</h3>
              <div className="flex flex-wrap gap-4">
                <RippleButton icon="📚">
                  Baca Buku
                </RippleButton>
                <RippleButton variant="secondary" icon="🎯">
                  Ikuti Kuis
                </RippleButton>
                <RippleButton variant="success" icon="🎁">
                  Tukar Reward
                </RippleButton>
              </div>
            </div>

            {/* Confirmation Dialog Example */}
            <div className="bg-emerald-50 p-6 rounded-xl">
              <h3 className="font-bold text-emerald-900 mb-4">Confirmation Dialog:</h3>
              <div className="flex gap-4">
                <RippleButton variant="danger" icon="⚠️">
                  Hapus
                </RippleButton>
                <RippleButton variant="outline">
                  Batal
                </RippleButton>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Kode Contoh</h2>
          <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <pre className="text-sm">{`// Import
import { RippleButton } from '@/components/shared';

// Basic Usage
<RippleButton>Click me</RippleButton>

// With Variant
<RippleButton variant="primary">Primary</RippleButton>
<RippleButton variant="secondary">Secondary</RippleButton>
<RippleButton variant="success">Success</RippleButton>
<RippleButton variant="danger">Danger</RippleButton>
<RippleButton variant="outline">Outline</RippleButton>

// With Size
<RippleButton size="small">Small</RippleButton>
<RippleButton size="medium">Medium</RippleButton>
<RippleButton size="large">Large</RippleButton>

// With Icon
<RippleButton icon="📚">Baca Buku</RippleButton>

// Full Width
<RippleButton fullWidth>Full Width</RippleButton>

// Loading State
<RippleButton loading={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</RippleButton>

// Disabled
<RippleButton disabled>Disabled</RippleButton>

// With onClick Handler
<RippleButton onClick={() => handleSubmit()}>
  Submit
</RippleButton>
              `}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
