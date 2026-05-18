'use client';

import React, { useState } from 'react';
import { ProfileCard } from '@/components/shared';

/**
 * PROFILE CARD SHOWCASE
 * 
 * Menampilkan ProfileCard dengan berbagai varian dan state
 * Untuk berbagai role: Siswa, Guru, Admin
 */

export default function ProfileCardShowcase() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleProfileClick = (name: string) => {
    setSelectedProfile(name);
    alert(`Navigating to profile: ${name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">ProfileCard Showcase</h1>
          <p className="text-amber-700 text-lg">Komponen profil dengan animasi hover yang elegan</p>
        </div>

        {/* Siswa Section */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-amber-900 mb-2">👨‍🎓 Profil Siswa</h2>
            <p className="text-amber-700">Profil untuk siswa dengan warna orange/merah</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProfileCard
              variant="siswa"
              name="Budi Santoso"
              role="Siswa Kelas 10"
              avatar="👨‍🎓"
              buttonText="Lihat Profile"
              onButtonClick={() => handleProfileClick('Budi Santoso')}
              isOnline={true}
            />
            <ProfileCard
              variant="siswa"
              name="Siti Nurhaliza"
              role="Siswa Kelas 11"
              avatar="👩‍🎓"
              buttonText="Lihat Profile"
              onButtonClick={() => handleProfileClick('Siti Nurhaliza')}
              isOnline={true}
            />
            <ProfileCard
              variant="siswa"
              name="Randi Pratama"
              role="Siswa Kelas 12"
              avatar="📚"
              buttonText="Lihat Profile"
              onButtonClick={() => handleProfileClick('Randi Pratama')}
              isOnline={false}
            />
            <ProfileCard
              variant="siswa"
              name="Eka Putri"
              role="Siswa Kelas 10"
              avatar="✨"
              buttonText="Lihat Profile"
              onButtonClick={() => handleProfileClick('Eka Putri')}
              isOnline={true}
            />
          </div>
        </section>

        {/* Guru Section */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-green-900 mb-2">👨‍🏫 Profil Guru</h2>
            <p className="text-green-700">Profil untuk guru dengan warna hijau</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProfileCard
              variant="guru"
              name="Ibu Sujanti"
              role="Guru Bahasa Indonesia"
              avatar="👩‍🏫"
              buttonText="Hubungi Guru"
              onButtonClick={() => handleProfileClick('Ibu Sujanti')}
              isOnline={true}
            />
            <ProfileCard
              variant="guru"
              name="Pak Hendra"
              role="Guru Literasi Digital"
              avatar="👨‍🏫"
              buttonText="Hubungi Guru"
              onButtonClick={() => handleProfileClick('Pak Hendra')}
              isOnline={true}
            />
            <ProfileCard
              variant="guru"
              name="Ibu Maya"
              role="Guru Bimbingan Karir"
              avatar="💼"
              buttonText="Jadwalkan Meeting"
              onButtonClick={() => handleProfileClick('Ibu Maya')}
              isOnline={false}
            />
          </div>
        </section>

        {/* Admin Section */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">👨‍💼 Profil Admin</h2>
            <p className="text-blue-700">Profil untuk admin dengan warna biru</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProfileCard
              variant="admin"
              name="Kepala Sekolah"
              role="Administrator Utama"
              avatar="👔"
              buttonText="Kontak Admin"
              onButtonClick={() => handleProfileClick('Kepala Sekolah')}
              isOnline={true}
            />
            <ProfileCard
              variant="admin"
              name="Bagian Kurikulum"
              role="Admin Kurikulum"
              avatar="📋"
              buttonText="Lihat Detail"
              onButtonClick={() => handleProfileClick('Bagian Kurikulum')}
              isOnline={true}
            />
            <ProfileCard
              variant="admin"
              name="IT Support"
              role="Admin Sistem"
              avatar="🖥️"
              buttonText="Support Ticket"
              onButtonClick={() => handleProfileClick('IT Support')}
              isOnline={true}
            />
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-2xl p-12 shadow-lg border border-amber-100">
          <h2 className="text-3xl font-bold text-amber-900 mb-8">Contoh Penggunaan</h2>

          <div className="space-y-8">
            {/* Example 1: Dashboard Profile */}
            <div>
              <h3 className="text-xl font-bold text-amber-800 mb-4">1. Dashboard Profile Section</h3>
              <div className="bg-amber-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileCard
                    variant="siswa"
                    name="User Profile"
                    role="Siswa Aktif"
                    avatar="👤"
                    buttonText="Edit Profile"
                    onButtonClick={() => alert('Edit profile clicked')}
                  />
                  <div className="bg-white p-6 rounded-lg">
                    <h4 className="font-bold text-amber-900 mb-2">Statistik Siswa</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>📚 Buku Dibaca: 5</li>
                      <li>🎯 Kuis Selesai: 12</li>
                      <li>⭐ Total Poin: 2500</li>
                      <li>🎁 Reward Tertukar: 3</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Example 2: Teacher Directory */}
            <div>
              <h3 className="text-xl font-bold text-amber-800 mb-4">2. Teacher Directory</h3>
              <div className="bg-amber-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ProfileCard
                    variant="guru"
                    name="Ibu Sujanti"
                    role="Guru Bahasa Indonesia"
                    avatar="👩‍🏫"
                    buttonText="Hubungi"
                  />
                  <ProfileCard
                    variant="guru"
                    name="Pak Budi"
                    role="Guru Literasi"
                    avatar="👨‍🏫"
                    buttonText="Hubungi"
                  />
                  <ProfileCard
                    variant="guru"
                    name="Ibu Ani"
                    role="Guru Pembimbing"
                    avatar="💼"
                    buttonText="Hubungi"
                  />
                </div>
              </div>
            </div>

            {/* Example 3: Admin Panel */}
            <div>
              <h3 className="text-xl font-bold text-amber-800 mb-4">3. Admin Management</h3>
              <div className="bg-amber-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileCard
                    variant="admin"
                    name="Administrator"
                    role="Super Admin"
                    avatar="👔"
                    buttonText="Manage"
                    isOnline={true}
                  />
                  <div className="bg-white p-6 rounded-lg">
                    <h4 className="font-bold text-blue-900 mb-2">Admin Controls</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✓ Manage Users</li>
                      <li>✓ View Reports</li>
                      <li>✓ System Settings</li>
                      <li>✓ Backup Data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="mt-16 bg-gray-900 text-gray-100 p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-white">Kode Contoh</h2>
          <pre className="text-sm overflow-x-auto">
{`import { ProfileCard } from '@/components/shared';

// Siswa Profile
<ProfileCard
  variant="siswa"
  name="Budi Santoso"
  role="Siswa Kelas 10"
  avatar="👨‍🎓"
  buttonText="Lihat Profile"
  onButtonClick={() => handleClick()}
  isOnline={true}
/>

// Guru Profile
<ProfileCard
  variant="guru"
  name="Ibu Sujanti"
  role="Guru Bahasa Indonesia"
  avatar="👩‍🏫"
  buttonText="Hubungi"
  isOnline={true}
/>

// Admin Profile
<ProfileCard
  variant="admin"
  name="Administrator"
  role="Super Admin"
  avatar="👔"
  buttonText="Manage"
  isOnline={true}
/>

// Dengan Image URL
<ProfileCard
  variant="siswa"
  name="John Doe"
  role="Student"
  avatar="https://example.com/profile.jpg"
  buttonText="View Profile"
/>

// Dengan Custom Button Link
<ProfileCard
  variant="guru"
  name="Teacher"
  role="Educator"
  avatar="👨‍🏫"
  buttonText="Visit Profile"
  buttonHref="/profile/teacher-123"
/>`}
          </pre>
        </section>

        {/* Props Documentation */}
        <section className="mt-16 bg-white rounded-2xl p-12 shadow-lg border border-amber-100">
          <h2 className="text-3xl font-bold text-amber-900 mb-8">Props Documentation</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-amber-900">Prop</th>
                  <th className="px-4 py-3 text-left font-bold text-amber-900">Type</th>
                  <th className="px-4 py-3 text-left font-bold text-amber-900">Default</th>
                  <th className="px-4 py-3 text-left font-bold text-amber-900">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">name</td>
                  <td className="px-4 py-3 text-gray-600">string</td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 text-gray-600">Nama user</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">role</td>
                  <td className="px-4 py-3 text-gray-600">string</td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 text-gray-600">Role/posisi user</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">avatar</td>
                  <td className="px-4 py-3 text-gray-600">string | ReactNode</td>
                  <td className="px-4 py-3 text-gray-600">Inisial</td>
                  <td className="px-4 py-3 text-gray-600">Avatar emoji, SVG, atau URL image</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">variant</td>
                  <td className="px-4 py-3 text-gray-600">'siswa' | 'guru' | 'admin'</td>
                  <td className="px-4 py-3 text-gray-600">'siswa'</td>
                  <td className="px-4 py-3 text-gray-600">Varian warna card</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">buttonText</td>
                  <td className="px-4 py-3 text-gray-600">string</td>
                  <td className="px-4 py-3 text-gray-600">'Lihat Profile'</td>
                  <td className="px-4 py-3 text-gray-600">Text button</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">buttonHref</td>
                  <td className="px-4 py-3 text-gray-600">string</td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 text-gray-600">URL untuk link button</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">onButtonClick</td>
                  <td className="px-4 py-3 text-gray-600">() => void</td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 text-gray-600">Handler saat button diklik</td>
                </tr>
                <tr className="border-b border-amber-100">
                  <td className="px-4 py-3 font-mono text-amber-600">isOnline</td>
                  <td className="px-4 py-3 text-gray-600">boolean</td>
                  <td className="px-4 py-3 text-gray-600">true</td>
                  <td className="px-4 py-3 text-gray-600">Tampilkan status badge online</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-amber-600">className</td>
                  <td className="px-4 py-3 text-gray-600">string</td>
                  <td className="px-4 py-3 text-gray-600">''</td>
                  <td className="px-4 py-3 text-gray-600">Custom CSS class</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-amber-700 text-sm">
            © 2026 READPOINT - Platform Literasi Digital
          </p>
        </div>
      </div>
    </div>
  );
}
