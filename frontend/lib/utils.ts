import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDifficultyColor(difficulty: string): string {
  const level = difficulty?.toLowerCase() || 'mudah'
  
  switch (level) {
    case 'mudah':
      return 'text-green-600 bg-green-100 px-3 py-1 rounded-full'
    case 'sedang':
      return 'text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full'
    case 'sulit':
      return 'text-red-600 bg-red-100 px-3 py-1 rounded-full'
    default:
      return 'text-gray-600 bg-gray-100 px-3 py-1 rounded-full'
  }
}

export function getDifficultyVariant(difficulty: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' {
  const level = difficulty?.toLowerCase() || 'mudah'
  
  switch (level) {
    case 'mudah':
      return 'success'
    case 'sedang':
      return 'warning'
    case 'sulit':
      return 'danger'
    default:
      return 'secondary'
  }
}

export function getRoleIcon(role: string): string {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '👨‍💼'
    case 'guru':
      return '👨‍🏫'
    case 'siswa':
      return '👨‍🎓'
    default:
      return '👤'
  }
}

export function getStatusIcon(status: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '✓'
    case 'in_progress':
      return '⏳'
    case 'pending':
      return '⏱️'
    case 'approved':
      return '✓'
    case 'rejected':
      return '✗'
    default:
      return '•'
  }
}

export function getStatusVariant(status: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'accent'
    case 'pending':
      return 'warning'
    case 'pending_validation':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'validated':
      return 'success'
    default:
      return 'secondary'
  }
}

export function getTypeIcon(type: string): string {
  switch (type?.toLowerCase()) {
    case 'earned':
      return '⬆️'
    case 'spent':
      return '⬇️'
    case 'bonus':
      return '🎁'
    case 'penalty':
      return '⚠️'
    default:
      return '•'
  }
}

export function getTypeColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'earned':
      return 'from-green-400 to-green-600'
    case 'spent':
      return 'from-red-400 to-red-600'
    case 'bonus':
      return 'from-yellow-400 to-yellow-600'
    case 'penalty':
      return 'from-orange-400 to-orange-600'
    default:
      return 'from-gray-400 to-gray-600'
  }
}

export function getTypeBadge(type: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' {
  switch (type?.toLowerCase()) {
    case 'earned':
      return 'success'
    case 'spent':
      return 'danger'
    case 'bonus':
      return 'warning'
    case 'penalty':
      return 'danger'
    default:
      return 'secondary'
  }
}
