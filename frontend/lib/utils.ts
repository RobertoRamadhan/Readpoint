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
