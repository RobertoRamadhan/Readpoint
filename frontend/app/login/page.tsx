'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

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
          width: 360,
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
    <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-6 py-6 text-slate-900 sm:px-10 sm:py-8 lg:px-12 lg:py-12">
      <div
        className="mx-auto grid w-full overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl sm:rounded-3xl sm:shadow-2xl lg:grid-cols-[0.85fr_1.15fr]"
        style={{ maxWidth: '1480px' }}
      >
        <section
          className="relative flex min-h-[180px] flex-col justify-between overflow-hidden bg-cover bg-center text-white sm:min-h-[220px] lg:min-h-[600px]"
          style={{ backgroundImage: 'url("/perpus.jpg")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-emerald-900/70" />

          <div className="relative z-10 p-5 sm:p-7 lg:p-8">
            <Link href="/" className="inline-flex items-center gap-2 lg:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-emerald-700 shadow-lg lg:h-11 lg:w-11">
                RP
              </div>
              <div>
                <p className="text-base font-black text-white lg:text-lg">READPOINT</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 sm:text-xs">
                  Literasi Digital
                </p>
              </div>
            </Link>
          </div>

          <div className="relative z-10 hidden p-8 lg:block">
            <p className="text-sm text-emerald-100">Tingkatkan minat baca dengan sistem reward digital</p>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[600px] lg:px-16 lg:py-12 xl:px-20">
          <div className="mx-auto w-full" style={{ maxWidth: '540px' }}>
            <div className="mb-7 text-center lg:hidden">
              <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Selamat Datang</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">Masuk ke akun</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
                Masukkan email dan password untuk membuka dashboard READPOINT.
              </p>
            </div>

            <div className="mb-8 hidden text-center lg:block lg:text-left">
              <p className="text-base font-black uppercase tracking-widest text-emerald-600">Selamat Datang</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">Masuk ke akun</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Masukkan email dan password untuk membuka dashboard READPOINT.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 sm:rounded-xl sm:p-4 sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" style={{ width: '100%', maxWidth: '540px' }}>
              <div>
                <label className="mb-2 block text-sm font-black text-slate-800 sm:text-base">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-14 sm:rounded-xl sm:px-4 sm:text-base"
                  placeholder="nama@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-800 sm:text-base">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-14 sm:rounded-xl sm:px-4 sm:text-base"
                  placeholder="Masukkan password"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-emerald-700 px-4 text-sm font-black text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:rounded-xl sm:px-6 sm:text-base sm:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">atau</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div ref={googleButtonRef} className="flex justify-center" />

            <p className="mt-6 text-center text-sm font-semibold text-slate-700 sm:text-base">
              Belum punya akun?{' '}
              <Link href="/register" className="font-black text-emerald-700 hover:text-emerald-800">
                Daftar di sini
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
