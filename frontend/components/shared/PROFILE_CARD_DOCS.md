# ProfileCard Component Documentation

## Overview
`ProfileCard` adalah komponen profil user dengan animasi hover yang elegan dan smooth. Dirancang untuk menampilkan profile siswa, guru, dan admin dengan varian warna yang berbeda.

## Features
✨ Animasi hover yang smooth dan elegan
🎨 3 varian warna untuk berbagai role (siswa, guru, admin)  
⭐ Status online/offline indicator
🎯 Support emoji, SVG, atau image URL untuk avatar
📱 Responsive dan mobile-friendly
🔗 Support untuk link button atau custom handler
💫 Pulse animation pada status badge

## Installation
Komponen sudah tersedia di `@/components/shared`

```typescript
import { ProfileCard } from '@/components/shared';
```

## Basic Usage

```tsx
<ProfileCard
  name="Budi Santoso"
  role="Siswa Kelas 10"
  avatar="👨‍🎓"
  buttonText="Lihat Profile"
  variant="siswa"
/>
```

## Props

```typescript
interface ProfileCardProps {
  name: string;                      // Nama user (required)
  role: string;                      // Role/posisi user (required)
  avatar?: string | React.ReactNode; // Avatar (emoji, SVG, atau URL)
  buttonText?: string;               // Text button (default: 'Lihat Profile')
  buttonHref?: string;               // URL untuk link button
  onButtonClick?: () => void;        // Handler saat button diklik
  variant?: 'siswa' | 'guru' | 'admin'; // Varian warna (default: 'siswa')
  isOnline?: boolean;                // Show online status (default: true)
  className?: string;                // Custom CSS class
}
```

## Variants

### 1. Siswa (Default)
- Header Gradient: Orange to Red
- Avatar: Red (#ef4444)
- Best for: Student profiles

```tsx
<ProfileCard
  variant="siswa"
  name="Budi Santoso"
  role="Siswa Kelas 10"
  avatar="👨‍🎓"
/>
```

### 2. Guru
- Header Gradient: Light Green to Green
- Avatar: Green (#10b981)
- Best for: Teacher profiles

```tsx
<ProfileCard
  variant="guru"
  name="Ibu Sujanti"
  role="Guru Bahasa Indonesia"
  avatar="👩‍🏫"
/>
```

### 3. Admin
- Header Gradient: Light Blue to Blue
- Avatar: Blue (#3b82f6)
- Best for: Administrator profiles

```tsx
<ProfileCard
  variant="admin"
  name="Kepala Sekolah"
  role="Administrator Utama"
  avatar="👔"
/>
```

## Avatar Options

### Emoji Avatar
```tsx
<ProfileCard
  name="John Doe"
  role="Student"
  avatar="👨‍🎓"
/>
```

### Image URL Avatar
```tsx
<ProfileCard
  name="John Doe"
  role="Student"
  avatar="https://example.com/profile.jpg"
/>
```

### Auto-generated Initials
Jika tidak ada avatar, akan membuat dari inisial nama:
```tsx
<ProfileCard
  name="Budi Santoso"
  role="Student"
  // avatar props tidak ada, akan menampilkan "BS"
/>
```

### React Component Avatar
```tsx
<ProfileCard
  name="User"
  role="Admin"
  avatar={<CustomAvatarComponent />}
/>
```

## Button Actions

### With Click Handler
```tsx
const handleProfileClick = () => {
  console.log('Profile clicked');
  // Navigate atau trigger action
};

<ProfileCard
  name="User"
  role="Student"
  avatar="👤"
  buttonText="Lihat Profile"
  onButtonClick={handleProfileClick}
/>
```

### With Link
```tsx
<ProfileCard
  name="User"
  role="Student"
  avatar="👤"
  buttonText="Lihat Profile"
  buttonHref="/profile/user-123"
/>
```

### Custom Button Text
```tsx
<ProfileCard
  name="Ibu Sujanti"
  role="Guru"
  avatar="👩‍🏫"
  buttonText="Hubungi Guru"
/>
```

## Status Indicator

### Online (Default)
```tsx
<ProfileCard
  name="User"
  role="Student"
  avatar="👤"
  isOnline={true}  // Green pulse indicator
/>
```

### Offline
```tsx
<ProfileCard
  name="User"
  role="Student"
  avatar="👤"
  isOnline={false} // No indicator
/>
```

## Usage Examples

### 1. Student Dashboard Profile
```tsx
function StudentDashboard() {
  const user = useAuth().user;

  return (
    <div className="flex gap-8">
      <ProfileCard
        variant="siswa"
        name={user.name}
        role={`Siswa Kelas ${user.grade_level}`}
        avatar="👨‍🎓"
        buttonText="Edit Profile"
        onButtonClick={() => router.push('/profile/edit')}
        isOnline={user.isOnline}
      />
      <div>
        {/* Stats and other content */}
      </div>
    </div>
  );
}
```

### 2. Teacher Directory
```tsx
function TeacherDirectory({ teachers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {teachers.map((teacher) => (
        <ProfileCard
          key={teacher.id}
          variant="guru"
          name={teacher.name}
          role={teacher.subject}
          avatar={teacher.avatar || '👨‍🏫'}
          buttonText="Hubungi"
          buttonHref={`/teacher/${teacher.id}`}
          isOnline={teacher.isOnline}
        />
      ))}
    </div>
  );
}
```

### 3. Admin Panel
```tsx
function AdminManagement({ admins }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {admins.map((admin) => (
        <ProfileCard
          key={admin.id}
          variant="admin"
          name={admin.name}
          role={admin.title}
          avatar={admin.avatar || '👔'}
          buttonText="Manage"
          onButtonClick={() => handleEditAdmin(admin.id)}
          isOnline={admin.isOnline}
        />
      ))}
    </div>
  );
}
```

### 4. Classroom Members
```tsx
function ClassroomMembers({ members }) {
  return (
    <div>
      <h3>Guru</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {members.filter(m => m.role === 'guru').map((member) => (
          <ProfileCard
            key={member.id}
            variant="guru"
            name={member.name}
            role={member.subject}
            avatar={member.avatar}
            onButtonClick={() => contactTeacher(member.id)}
          />
        ))}
      </div>

      <h3>Siswa</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {members.filter(m => m.role === 'siswa').map((member) => (
          <ProfileCard
            key={member.id}
            variant="siswa"
            name={member.name}
            role="Siswa"
            avatar={member.avatar}
            buttonText="Lihat Profil"
            buttonHref={`/student/${member.id}`}
          />
        ))}
      </div>
    </div>
  );
}
```

## Styling & Customization

### With Custom CSS Class
```tsx
<ProfileCard
  name="User"
  role="Student"
  avatar="👤"
  className="shadow-2xl hover:shadow-3xl"
/>
```

### In a Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  <ProfileCard variant="siswa" name="User 1" role="Student" avatar="👤" />
  <ProfileCard variant="siswa" name="User 2" role="Student" avatar="👤" />
  <ProfileCard variant="siswa" name="User 3" role="Student" avatar="👤" />
  <ProfileCard variant="siswa" name="User 4" role="Student" avatar="👤" />
</div>
```

## Animations

### Hover Effects
- Header gradient expands downward
- Avatar scales dan bergeser ke atas kiri
- Info text bergeser ke atas
- Button scales dan berwarna lebih gelap
- Smooth 0.5s transitions

### Status Badge
- Pulse animation untuk online indicator
- Green dot (#10b981) dengan white border
- Continuously pulsing effect

## Accessibility

- ✅ Semantic button elements
- ✅ Proper link elements (when using buttonHref)
- ✅ Clear visual hierarchy
- ✅ Good color contrast
- ✅ Focus visible on buttons

## Best Practices

1. **Choose Right Variant**
   - Siswa: untuk profile siswa
   - Guru: untuk profile guru/instructor
   - Admin: untuk profile administrator

2. **Avatar Selection**
   - Gunakan emoji yang relevan untuk role
   - Atau gunakan image URL untuk profile picture yang lebih personal
   - Avatar akan auto-generate inisial jika tidak disediakan

3. **Button Interaction**
   - Jika navigasi internal: gunakan `onButtonClick` dengan router
   - Jika navigasi eksternal: gunakan `buttonHref`
   - Berikan feedback yang jelas saat button diklik

4. **Status Indicator**
   - Gunakan untuk real-time presence information
   - Set `isOnline={false}` jika user tidak aktif

5. **Responsive Layout**
   - Gunakan grid dengan responsive columns
   - Mobile: 1 kolom
   - Tablet: 2-3 kolom
   - Desktop: 3-4 kolom

## Color Reference

| Variant | Header | Avatar | Button |
|---------|--------|--------|--------|
| Siswa | Orange to Red | #ef4444 | #ef4444 → #dc2626 |
| Guru | Light Green to Green | #10b981 | #10b981 → #059669 |
| Admin | Light Blue to Blue | #3b82f6 | #3b82f6 → #1d4ed8 |

## Browser Support
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Performance Notes
- 🚀 Optimized CSS animations (GPU accelerated)
- 🚀 No external dependencies
- 🚀 CSS Modules untuk minimal CSS shipping
- 🚀 Smooth 60fps animations

## Showcase
Lihat semua variants dan examples di: `/components/shared/ProfileCard.showcase.tsx`
