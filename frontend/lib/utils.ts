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

export function getDifficultyVariant(difficulty: string): string {
  const level = difficulty?.toLowerCase() || 'mudah'
  
  switch (level) {
    case 'mudah':
      return 'bg-green-100 text-green-700 border-green-300'
    case 'sedang':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    case 'sulit':
      return 'bg-red-100 text-red-700 border-red-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
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
