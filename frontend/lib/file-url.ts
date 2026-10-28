import { API_URL } from './api';

/**
 * Derives a local-friendly backend base URL.
 * Uses the same environment-aware API URL as regular API requests.
 */
export function getBackendBaseUrl(): string {
  return API_URL.replace(/\/api\/?$/, '');
}

/**
 * Normalize file URL - return langsung jika sudah full URL.
 * Backend Laravel sudah generate URL yang benar via Storage::url()
 */
export function normalizeFileUrl(value?: string | null): string {
  if (!value) return '';
  const rawValue = value.trim();
  if (!rawValue) return '';

  // Jika sudah full URL (http/https), return langsung
  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    return rawValue;
  }

  // Jika relative path, build URL via backend
  const backendBaseUrl = getBackendBaseUrl();
  
  // Remove leading slashes
  const cleanPath = rawValue.replace(/^\/+/, '');
  
  // Jika path mulai dengan 'storage/', langsung append ke base URL
  if (cleanPath.startsWith('storage/')) {
    return `${backendBaseUrl}/${cleanPath}`;
  }
  
  // Fallback: tambahkan prefix storage/
  return `${backendBaseUrl}/storage/${cleanPath}`;
}

export function normalizeEbookFiles<
  T extends {
    cover_image?: string | null;
    cover_image_url?: string | null;
    pdf_file?: string | null;
    pdf_file_url?: string | null;
  }
>(ebook: T): T {
  return {
    ...ebook,
    cover_image: normalizeFileUrl(ebook.cover_image_url || ebook.cover_image),
    cover_image_url: normalizeFileUrl(ebook.cover_image_url || ebook.cover_image),
    pdf_file: normalizeFileUrl(ebook.pdf_file_url || ebook.pdf_file),
    pdf_file_url: normalizeFileUrl(ebook.pdf_file_url || ebook.pdf_file),
  };
}

export function normalizeRewardImage<
  T extends { image?: string | null; image_url?: string | null }
>(reward: T): T {
  return {
    ...reward,
    image: normalizeFileUrl(reward.image_url || reward.image),
    image_url: normalizeFileUrl(reward.image_url || reward.image),
  };
}
