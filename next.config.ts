import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"], // Moved from experimental to here
  reactStrictMode: true,
  images: {
    domains: ['tailwindui.com'], // Add the hostname here
  },
};

export default nextConfig;
