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
        hostname: "readpointku.web.id",
      },
      {
        protocol: "https",
        hostname: "www.readpointku.web.id",
      },
      {
        protocol: "https",
        hostname: "*.pages.dev",
      },
    ],
    unoptimized: true,
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;