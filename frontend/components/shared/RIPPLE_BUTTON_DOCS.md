# RippleButton Component Documentation

## Overview
`RippleButton` adalah komponen tombol dengan animasi ripple effect yang elegan. Dirancang khusus untuk READPOINT dengan brand color amber/orange.

## Features
✨ Animasi ripple effect smooth saat hover
🎨 5 variant warna yang berbeda  
📏 3 ukuran yang dapat disesuaikan
⚡ Loading state dengan spinner
🔒 Disabled state
📱 Responsive dan mobile-friendly
🎯 Support icon
🌈 Full width option

## Installation
Komponen sudah tersedia di `@/components/shared`

```typescript
import { RippleButton } from '@/components/shared';
```

## Props

```typescript
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

### Prop Details

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'primary'` | Warna/style button: primary (amber), secondary (light amber), success (hijau), danger (merah), outline (border) |
| `size` | string | `'medium'` | Ukuran button: small, medium, large |
| `loading` | boolean | `false` | Menampilkan loading spinner dan disable button |
| `fullWidth` | boolean | `false` | Button mengambil lebar penuh container |
| `icon` | ReactNode | - | Icon yang ditampilkan sebelum text (bisa emoji atau SVG) |
| `children` | ReactNode | - | Text atau konten button |
| `disabled` | boolean | `false` | Disable button |
| `className` | string | `''` | Custom CSS class |

## Variants

### 1. Primary (Default)
- Color: Amber (#b45309)
- Ripple: Orange (#f59e0b)
- Use Case: Main actions, submit buttons

```tsx
<RippleButton variant="primary">
  Primary Button
</RippleButton>
```

### 2. Secondary
- Color: Light Amber (#fff8e7)
- Text: Amber (#b45309)
- Border: Light Gold (#fbbf24)
- Use Case: Secondary actions, alternative options

```tsx
<RippleButton variant="secondary">
  Secondary Button
</RippleButton>
```

### 3. Success
- Color: Green (#10b981)
- Ripple: Light Green (#34d399)
- Use Case: Success actions, confirm buttons

```tsx
<RippleButton variant="success">
  Success Button
</RippleButton>
```

### 4. Danger
- Color: Red (#ef4444)
- Ripple: Light Red (#f87171)
- Use Case: Destructive actions, delete buttons

```tsx
<RippleButton variant="danger">
  Danger Button
</RippleButton>
```

### 5. Outline
- Color: Transparent dengan border
- Text: Amber (#b45309)
- Use Case: Cancel buttons, secondary options

```tsx
<RippleButton variant="outline">
  Outline Button
</RippleButton>
```

## Sizes

### Small
```tsx
<RippleButton size="small">Small Button</RippleButton>
```

### Medium (Default)
```tsx
<RippleButton size="medium">Medium Button</RippleButton>
```

### Large
```tsx
<RippleButton size="large">Large Button</RippleButton>
```

## With Icons

```tsx
<RippleButton icon="📚">
  Baca Buku
</RippleButton>

<RippleButton variant="success" icon="✅">
  Selesai Kuis
</RippleButton>

<RippleButton variant="danger" icon="🗑️">
  Hapus
</RippleButton>
```

## Full Width

```tsx
<RippleButton fullWidth>
  Full Width Button
</RippleButton>
```

## Loading State

```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.submit(data);
  } finally {
    setLoading(false);
  }
};

<RippleButton 
  loading={loading}
  onClick={handleSubmit}
>
  {loading ? 'Loading...' : 'Submit'}
</RippleButton>
```

## Disabled State

```tsx
<RippleButton disabled>
  Disabled Button
</RippleButton>
```

## Usage Examples

### Login Form
```tsx
<RippleButton fullWidth onClick={handleLogin}>
  Masuk Sekarang
</RippleButton>

<RippleButton variant="outline" fullWidth>
  Daftar
</RippleButton>
```

### Dashboard Actions
```tsx
<div className="flex gap-4">
  <RippleButton icon="📚" onClick={handleReadBook}>
    Baca Buku
  </RippleButton>
  
  <RippleButton variant="secondary" icon="🎯" onClick={handleStartQuiz}>
    Ikuti Kuis
  </RippleButton>
  
  <RippleButton variant="success" icon="🎁" onClick={handleRedeemReward}>
    Tukar Reward
  </RippleButton>
</div>
```

### Confirmation Dialog
```tsx
<div className="flex gap-4">
  <RippleButton variant="danger" onClick={handleDelete}>
    Hapus
  </RippleButton>
  
  <RippleButton variant="outline" onClick={handleCancel}>
    Batal
  </RippleButton>
</div>
```

### Form Submission
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <input type="text" placeholder="Name" required />
  <input type="email" placeholder="Email" required />
  
  <RippleButton 
    fullWidth 
    loading={loading}
    type="submit"
  >
    {loading ? 'Submitting...' : 'Submit'}
  </RippleButton>
</form>
```

### Combination with AuthForm
```tsx
<AuthForm
  title="Login"
  fields={fields}
  values={values}
  onChange={handleChange}
  onSubmit={handleSubmit}
  submitButtonText="Masuk Sekarang"
  loading={loading}
  error={error}
/>
```

## Styling & Customization

### Custom CSS
```tsx
<RippleButton 
  className="custom-class"
>
  Button
</RippleButton>
```

### With Tailwind
```tsx
<RippleButton 
  className="shadow-xl hover:shadow-2xl"
>
  Button
</RippleButton>
```

## Accessibility

- ✅ Proper button semantics
- ✅ Support for disabled state
- ✅ Focus visible styling
- ✅ Loading state feedback
- ✅ Screen reader friendly

## Best Practices

1. **Use appropriate variants**
   - Primary untuk main actions
   - Secondary untuk alternatives
   - Success untuk positive actions
   - Danger untuk destructive actions
   - Outline untuk cancel/close

2. **Always provide feedback**
   - Gunakan loading state selama async operations
   - Disable button saat processing
   - Show success/error messages

3. **Responsive sizing**
   - Gunakan size sesuai context
   - Full width di mobile forms
   - Icons untuk clarity

4. **Consistency**
   - Gunakan consistent warna/size di halaman yang sama
   - Gunakan icon yang konsisten untuk action yang sama

## Showcase
Lihat semua variants dan usage di: `/components/shared/RippleButton.showcase.tsx`

## Migration from Old Button

### Old Button
```tsx
import Button from '@/components/shared/Button';

<Button variant="primary" size="md">
  Click me
</Button>
```

### New RippleButton
```tsx
import { RippleButton } from '@/components/shared';

<RippleButton variant="primary" size="medium">
  Click me
</RippleButton>
```

## Color Reference

| Variant | Background | Ripple | Text |
|---------|-----------|--------|------|
| Primary | #b45309 | #f59e0b | white |
| Secondary | #fff8e7 | #f59e0b | #b45309 |
| Success | #10b981 | #34d399 | white |
| Danger | #ef4444 | #f87171 | white |
| Outline | transparent | #f59e0b | #b45309 |

## Browser Support
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Performance
- 🚀 Optimized animations
- 🚀 No external dependencies
- 🚀 CSS modules untuk minimal CSS shipping
- 🚀 Smooth 60fps animations
