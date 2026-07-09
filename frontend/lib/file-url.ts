/**
 * Derives the backend base URL exclusively from the NEXT_PUBLIC_API_URL
 * environment variable. No hardcoded fallback URLs — if the env var is not
 * set the app will surface a clear error rather than silently using a
 * stale/wrong URL.
 */
export function getBackendBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    // In dev you'll see this in the browser console; in production make sure
    // NEXT_PUBLIC_API_URL is set in your Vercel environment variables.
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[file-url] NEXT_PUBLIC_API_URL is not set. File URLs will be empty. ' +
          'Set it in .env.local (dev) or Vercel dashboard (production).'
      );
    }
    return '';
  }

  // Strip trailing /api or /api/ so we get the bare origin
  return apiUrl.replace(/\/api\/?$/, '');
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

  const backendOrigin = getBackendOrigin();
  const rawValue = value.trim();

  if (!rawValue) return '';

  // Already a full URL
  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    try {
      const url = new URL(rawValue);
      if (
        backendOrigin &&
        (url.pathname.startsWith('/storage/') || url.pathname.startsWith('/api/files/'))
      ) {
        return `${backendOrigin}/api/files/${normalizeStoragePath(url.pathname)}${url.search}`;
      }
      return rawValue;
    } catch {
      return rawValue;
    }
  }

  if (!backendOrigin) return '';

  // Relative storage or api/files path
  if (rawValue.startsWith('/storage/') || rawValue.startsWith('storage/')) {
    return `${backendOrigin}/api/files/${normalizeStoragePath(rawValue)}`;
  }

  if (rawValue.startsWith('/api/files/') || rawValue.startsWith('api/files/')) {
    return `${backendOrigin}/api/files/${normalizeStoragePath(rawValue)}`;
  }

  // Bare filename — treat as storage path
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
