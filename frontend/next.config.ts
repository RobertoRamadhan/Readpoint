import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    lockDistDir: false,
  },
};

export default nextConfig;
