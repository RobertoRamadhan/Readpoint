'use client';

import { ProfileCard } from '@/components/shared';
import { useAuth } from '@/context/AuthContext';

/**
 * CONTOH IMPLEMENTASI PROFILE CARD
 * 
 * Ini adalah contoh bagaimana mengintegrasikan ProfileCard 
 * di berbagai dashboard (siswa, guru, admin)
 */

// ============================================
// SISWA PROFILE SECTION
// ============================================
export function SiswaProfileSection() {
  const { user } = useAuth();

  if (!user || user.role !== 'siswa') return null;

  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile Card */}
        <ProfileCard
          variant="siswa"
          name={user.name}
          role={`Siswa Kelas ${user.grade_level || '10'}`}
          avatar="👨‍🎓"
          buttonText="Edit Profile"
          onButtonClick={() => window.location.href = '/dashboard/siswa/profile'}
          isOnline={true}
        />

        {/* Stats Container */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="📚" label="Buku Dibaca" value="12" />
          <StatCard icon="🎯" label="Kuis Selesai" value="24" />
          <StatCard icon="⭐" label="Total Poin" value="2,450" />
          <StatCard icon="🎁" label="Reward Tertukar" value="3" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// GURU PROFILE SECTION
// ============================================
export function GuruProfileSection() {
  const { user } = useAuth();

  if (!user || user.role !== 'guru') return null;

  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile Card */}
        <ProfileCard
          variant="guru"
          name={user.name}
          role="Guru Bahasa Indonesia"
          avatar="👨‍🏫"
          buttonText="Edit Profile"
          onButtonClick={() => window.location.href = '/dashboard/guru/profile'}
          isOnline={true}
        />

        {/* Stats Container */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="👨‍🎓" label="Siswa Aktif" value="28" />
          <StatCard icon="📚" label="Materi Dibuat" value="15" />
          <StatCard icon="🎯" label="Kuis Dibuat" value="32" />
          <StatCard icon="📊" label="Total Rating" value="4.8" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ADMIN PROFILE SECTION
// ============================================
export function AdminProfileSection() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile Card */}
        <ProfileCard
          variant="admin"
          name={user.name}
          role="Administrator Sistem"
          avatar="👔"
          buttonText="Settings"
          onButtonClick={() => window.location.href = '/dashboard/admin/settings'}
          isOnline={true}
        />

        {/* Stats Container */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Total Users" value="156" />
          <StatCard icon="👨‍🎓" label="Siswa" value="100" />
          <StatCard icon="👨‍🏫" label="Guru" value="40" />
          <StatCard icon="⚙️" label="Sistem" value="Online" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEACHER DIRECTORY SECTION
// ============================================
export function TeacherDirectorySection({ teachers = [] }) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-amber-900 mb-6">Daftar Guru</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.length > 0 ? (
          teachers.map((teacher: any) => (
            <ProfileCard
              key={teacher.id}
              variant="guru"
              name={teacher.name}
              role={teacher.subject || 'Guru'}
              avatar={teacher.avatar || '👨‍🏫'}
              buttonText="Hubungi"
              onButtonClick={() => alert(`Menghubungi ${teacher.name}`)}
              isOnline={teacher.isOnline}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-amber-700">
            <p>Belum ada guru yang tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// CLASSROOM MEMBERS SECTION
// ============================================
export function ClassroomMembersSection({ members = [] }) {
  const teachers = members.filter((m: any) => m.role === 'guru');
  const students = members.filter((m: any) => m.role === 'siswa');

  return (
    <div className="mb-12 space-y-12">
      {/* Teachers */}
      {teachers.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-green-900 mb-6">👨‍🏫 Guru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher: any) => (
              <ProfileCard
                key={teacher.id}
                variant="guru"
                name={teacher.name}
                role={teacher.subject || 'Guru'}
                avatar={teacher.avatar || '👨‍🏫'}
                buttonText="Hubungi"
                buttonHref={`/profile/teacher/${teacher.id}`}
                isOnline={teacher.isOnline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Students */}
      {students.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-red-900 mb-6">👨‍🎓 Siswa</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {students.map((student: any) => (
              <ProfileCard
                key={student.id}
                variant="siswa"
                name={student.name}
                role={`Kelas ${student.grade_level || '10'}`}
                avatar={student.avatar || '👨‍🎓'}
                buttonText="Lihat Profil"
                buttonHref={`/profile/student/${student.id}`}
                isOnline={student.isOnline}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ADMIN USERS MANAGEMENT SECTION
// ============================================
export function AdminUsersSection({ users = [] }) {
  const administrators = users.filter((u: any) => u.role === 'admin');
  const teachers = users.filter((u: any) => u.role === 'guru');
  const students = users.filter((u: any) => u.role === 'siswa');

  return (
    <div className="mb-12 space-y-12">
      {/* Administrators */}
      {administrators.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-blue-900 mb-6">👔 Administrators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {administrators.map((admin: any) => (
              <ProfileCard
                key={admin.id}
                variant="admin"
                name={admin.name}
                role={admin.title || 'Administrator'}
                avatar={admin.avatar || '👔'}
                buttonText="Manage"
                onButtonClick={() => alert(`Mengelola ${admin.name}`)}
                isOnline={admin.isOnline}
              />
            ))}
          </div>
        </div>
      )}

      {/* Teachers */}
      {teachers.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-green-900 mb-6">👨‍🏫 Teachers ({teachers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {teachers.slice(0, 8).map((teacher: any) => (
              <ProfileCard
                key={teacher.id}
                variant="guru"
                name={teacher.name}
                role={teacher.subject || 'Teacher'}
                avatar={teacher.avatar || '👨‍🏫'}
                buttonText="Manage"
                onButtonClick={() => alert(`Mengelola ${teacher.name}`)}
                isOnline={teacher.isOnline}
              />
            ))}
          </div>
          {teachers.length > 8 && (
            <div className="text-center mt-4">
              <a href="/admin/users?role=teacher" className="text-amber-700 hover:text-amber-900 font-bold">
                Lihat semua guru ({teachers.length})
              </a>
            </div>
          )}
        </div>
      )}

      {/* Students */}
      {students.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-red-900 mb-6">👨‍🎓 Students ({students.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {students.slice(0, 10).map((student: any) => (
              <ProfileCard
                key={student.id}
                variant="siswa"
                name={student.name}
                role={`Kelas ${student.grade_level || '10'}`}
                avatar={student.avatar || '👨‍🎓'}
                buttonText="Manage"
                onButtonClick={() => alert(`Mengelola ${student.name}`)}
                isOnline={student.isOnline}
              />
            ))}
          </div>
          {students.length > 10 && (
            <div className="text-center mt-4">
              <a href="/admin/users?role=student" className="text-amber-700 hover:text-amber-900 font-bold">
                Lihat semua siswa ({students.length})
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER COMPONENT
// ============================================
function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-amber-900">{value}</p>
    </div>
  );
}
