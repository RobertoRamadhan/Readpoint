import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./landing.css";
import "./readpoint-theme.css";
import "./guru-dashboard-final.css";
import "./admin-dashboard-final.css";
import "./admin-report-settings-final.css";
import "./siswa-dashboard-fix.css";
import "./siswa-desktop-final.css";
import "./landing-mobile-fix.css";
import "./reader-desktop-fix.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SearchDropdownPatch from "@/components/siswa/SearchDropdownPatch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "READPOINT",
  description: "Platform Literasi Digital untuk Siswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} w-full`}>
      <body className="antialiased bg-slate-50 w-full min-h-screen m-0 p-0">
        <ErrorBoundary>
          <Providers>
            {children}
            <SearchDropdownPatch />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
