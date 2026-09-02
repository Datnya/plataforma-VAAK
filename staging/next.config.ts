import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/prototype/index.html" },
        { source: "/login", destination: "/prototype/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ovflbrrnqgmooutlukyf.supabase.co",
      },
    ],
  },
};

export default nextConfig;
