import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  experimental: {
    cpus: 2,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
