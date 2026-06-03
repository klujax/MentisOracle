import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip static generation of pages-router error pages
  // This fixes the <Html> import error during build in App Router projects
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Ensure only app router is used
  },
};

export default nextConfig;
