import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: "www.readpointku.com",
      },
      {
        protocol: "https",
        hostname: "readpointku.com",
      },
      {
        protocol: "https",
        hostname: "readpoint-backend-production.up.railway.app",
      },
    ],
  },

  // Silence Turbopack warning
  turbopack: {},

  // Required for react-pdf / pdfjs-dist to work correctly
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
