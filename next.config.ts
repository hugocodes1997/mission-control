import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't use static export since Convex needs dynamic rendering
  images: {
    unoptimized: true,
  },
  // Ignore TypeScript errors during build (for dev purposes)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
