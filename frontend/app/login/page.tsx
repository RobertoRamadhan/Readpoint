'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Library } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import styles from './login.module.css';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleInitRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login({ email, password });
      const authData = (response.data ?? response) as {
        user?: Parameters<typeof login>[0];
        token?: string;
        access_token?: string;
      };
      const token = authData.token ?? authData.access_token;

      if (authData.user && token) {
        login(authData.user, token);
        router.push('/dashboard');
      } else {
        throw new Error('Respons server tidak valid');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Don't initialize if no client ID, running server-side, or already initialized
    if (!clientId || typeof window === 'undefined' || googleInitRef.current) {
      if (!clientId) {
        console.warn('[Google Sign-In] No NEXT_PUBLIC_GOOGLE_CLIENT_ID found in environment variables');
      }
      return;
    }

    const initializeGoogle = async () => {
      // Mark as initialized before any async operations to prevent race conditions
      if (googleInitRef.current) return;
      googleInitRef.current = true;

      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        // Reset flag if prerequisites not met so we can retry
        googleInitRef.current = false;
        return;
      }

      // Only initialize once - check if already initialized
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              setError('Login Google dibatalkan');
              return;
            }

            setLoading(true);
            setError('');

            try {
              const googleResponse = await api.googleLogin({ credential: response.credential });
              const authData = (googleResponse.data ?? googleResponse) as {
                user?: Parameters<typeof login>[0];
                token?: string;
                access_token?: string;
              };
              const token = authData.token ?? authData.access_token;

              if (authData.user && token) {
                login(authData.user, token);
                router.push('/dashboard');
              } else {
                throw new Error('Respons server tidak valid');
              }
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Login Google gagal';
              setError(errorMsg);
            } finally {
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: Math.max(200, Math.min(360, googleButtonRef.current.clientWidth || 360)),
        });
      } catch (err) {
        console.error('[Google Sign-In] Initialization error:', err);
        googleInitRef.current = false; // Allow retry on error
      }
    };

    // If Google SDK is already loaded, initialize immediately
    if (window.google?.accounts?.id) {
      void initializeGoogle();
      return;
    }

    // Check if script is already loading
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => void initializeGoogle(), { once: true });
      return;
    }

    // Load the Google SDK script
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => void initializeGoogle();
    script.onerror = () => {
      console.error('[Google Sign-In] Failed to load Google SDK');
      googleInitRef.current = false;
    };
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove the script or reset the flag on cleanup
      // This prevents reinitialization on navigation
    };
  }, [login, router]);

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <section className={styles.storyPanel} aria-label="Tentang READPOINT">
          <div className={styles.photo} aria-hidden="true" />
          <div className={styles.storyContent}>
            <Link href="/" className={styles.brand} aria-label="READPOINT beranda">
              <span className={styles.brandMark}>
                <Library size={19} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className={styles.brandName}>READPOINT</span>
            </Link>

            <div className={styles.storyCopy}>
              <p className={styles.storyEyebrow}>Ruang baca digital sekolah</p>
              <h1>
                Buka buku.
                <br />
                <em>Buka kemungkinan.</em>
              </h1>
              <p className={styles.storyDescription}>
                Setiap halaman membawa cerita. Setiap bacaan membangun kebiasaan.
              </p>
            </div>

            <div className={styles.readingPath}>
              <div className={styles.pathIcon}>
                <BookOpen size={18} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.pathTitle}>Perjalanan membaca</p>
                <p className={styles.pathSteps}>
                  <span>Baca</span>
                  <span className={styles.pathDot} />
                  <span>Pahami</span>
                  <span className={styles.pathDot} />
                  <span>Dapatkan poin</span>
                </p>
              </div>
            </div>
          </div>
          <span className={styles.imageCaption}>PERPUSTAKAAN · READPOINT</span>
        </section>

        <section className={styles.formPanel} aria-labelledby="login-heading">
          <div className={styles.formTopline}>
            <span className={styles.formKicker}>AKUN READPOINT</span>
            <Link href="/" className={styles.homeLink}>
              Beranda <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.formContent}>
            <p className={styles.welcome}>Selamat datang kembali</p>
            <h2 id="login-heading">Lanjutkan ceritamu.</h2>
            <p className={styles.formDescription}>
              Masuk untuk melanjutkan bacaan dan melihat perkembangan literasimu.
            </p>

            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submitButton}>
                <span>{loading ? 'Memproses...' : 'Masuk ke akun'}</span>
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </form>

            <div className={styles.divider}>
              <span />
              <span className={styles.dividerLabel}>atau masuk dengan</span>
              <span />
            </div>

            <div ref={googleButtonRef} className={styles.googleButton} />

            <p className={styles.registerPrompt}>
              Belum punya akun?{' '}
              <Link href="/register">
                Daftar sebagai siswa <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </p>

            <p className={styles.pointsNote}>
              <Check size={14} aria-hidden="true" />
              Poin membaca diberikan setelah validasi guru.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
