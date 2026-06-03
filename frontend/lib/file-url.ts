const DEFAULT_BACKEND_URL = 'https://readpoint-backend-main-odr7ck.laravel.cloud';

export function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || `${DEFAULT_BACKEND_URL}/api`).replace(/\/api\/?$/, '');
}

function getBackendOrigin() {
  try {
    return new URL(getBackendBaseUrl()).origin;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

function normalizeStoragePath(pathname: string) {
  return pathname
    .replace(/^\/storage\//, '')
    .replace(/^\/api\/files\//, '')
    .replace(/^storage\//, '')
    .replace(/^api\/files\//, '')
    .replace(/^\/+/, '');
}

export function normalizeFileUrl(value?: string | null) {
  if (!value) return '';

  const backendOrigin = getBackendOrigin();
  const rawValue = value.trim();

  if (!rawValue) return '';

  if (rawValue.startsWith('/storage/') || rawValue.startsWith('storage/')) {
    return `${backendOrigin}/api/files/${normalizeStoragePath(rawValue)}`;
  }

  if (rawValue.startsWith('/api/files/') || rawValue.startsWith('api/files/')) {
    return `${backendOrigin}/api/files/${normalizeStoragePath(rawValue)}`;
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    try {
      const url = new URL(rawValue);

      if (url.pathname.startsWith('/storage/') || url.pathname.startsWith('/api/files/')) {
        return `${backendOrigin}/api/files/${normalizeStoragePath(url.pathname)}${url.search}`;
      }

      return rawValue;
    } catch {
      return rawValue;
    }
  }

  return `${backendOrigin}/api/files/${normalizeStoragePath(rawValue)}`;
}

export function normalizeEbookFiles<T extends { cover_image?: string | null; cover_image_url?: string | null; pdf_file?: string | null; pdf_file_url?: string | null }>(ebook: T): T {
  return {
    ...ebook,
    cover_image: normalizeFileUrl(ebook.cover_image_url || ebook.cover_image),
    cover_image_url: normalizeFileUrl(ebook.cover_image_url || ebook.cover_image),
    pdf_file: normalizeFileUrl(ebook.pdf_file_url || ebook.pdf_file),
    pdf_file_url: normalizeFileUrl(ebook.pdf_file_url || ebook.pdf_file),
  };
}

export function normalizeRewardImage<T extends { image?: string | null; image_url?: string | null }>(reward: T): T {
  return {
    ...reward,
    image: normalizeFileUrl(reward.image_url || reward.image),
    image_url: normalizeFileUrl(reward.image_url || reward.image),
  };
}
