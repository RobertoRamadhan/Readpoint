import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages + next-on-pages requires edge runtime
  // untuk dynamic routes
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
      },
      {
        protocol: "https",
        hostname: "readpoint-production.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.pages.dev",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
    ],
    // Cloudflare Pages tidak support next/image optimization — pakai unoptimized
    unoptimized: true,
  },

  // Required for react-pdf / pdfjs-dist
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
