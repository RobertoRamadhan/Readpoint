const DEFAULT_BACKEND_URL = 'https://readpoint-backend-main-odr7ck.laravel.cloud';

export function getBackendBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || `${DEFAULT_BACKEND_URL}/api`).replace(/\/api\/?$/, '');
}

export function normalizeFileUrl(value?: string | null) {
  if (!value) return '';

  const backendBaseUrl = getBackendBaseUrl();
  const rawValue = value.trim();

  if (!rawValue) return '';

  // Backend lama mengirim /storage/..., padahal di Laravel Cloud route file yang stabil adalah /api/files/...
  if (rawValue.startsWith('/storage/')) {
    return `${backendBaseUrl}/api/files/${rawValue.replace(/^\/storage\//, '')}`;
  }

  if (rawValue.startsWith('storage/')) {
    return `${backendBaseUrl}/api/files/${rawValue.replace(/^storage\//, '')}`;
  }

  if (rawValue.startsWith('/api/files/')) {
    return `${backendBaseUrl}${rawValue}`;
  }

  if (rawValue.startsWith('api/files/')) {
    return `${backendBaseUrl}/${rawValue}`;
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    try {
      const url = new URL(rawValue);
      const storagePrefix = '/storage/';

      if (url.pathname.startsWith(storagePrefix)) {
        const filePath = url.pathname.slice(storagePrefix.length);
        return `${url.origin}/api/files/${filePath}${url.search}`;
      }

      return rawValue;
    } catch {
      return rawValue;
    }
  }

  // Jika backend hanya mengirim path database seperti ebooks/covers/file.jpg
  return `${backendBaseUrl}/api/files/${rawValue.replace(/^\/+/, '')}`;
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
