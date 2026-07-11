/**
 * Derives a local-friendly backend base URL.
 * Falls back to the local Laravel dev server when the env var is absent.
 */
export function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[file-url] NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:8000.');
  }

  return 'http://localhost:8000';
}

function getBackendOrigin(): string {
  const base = getBackendBaseUrl();
  if (!base) return '';
  try {
    return new URL(base).origin;
  } catch {
    return base;
  }
}

function normalizeStoragePath(pathname: string): string {
  return pathname
    .replace(/^\/storage\//, '')
    .replace(/^\/api\/files\//, '')
    .replace(/^storage\//, '')
    .replace(/^api\/files\//, '')
    .replace(/^\/+/, '');
}

export function normalizeFileUrl(value?: string | null): string {
  if (!value) return '';
  const rawValue = value.trim();
  if (!rawValue) return '';

  // Sudah full URL — return langsung (termasuk Supabase URL)
  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    return rawValue;
  }

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return '';

  // Relative path — build via backend /api/files/
  return `${backendOrigin}/api/files/${normalizeStoragePath(rawValue)}`;
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
