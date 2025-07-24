import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable static export for debugging
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
