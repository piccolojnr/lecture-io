import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"], // Moved from experimental to here
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
        pathname: '/**/*',
      }, // Add the hostname here
    ], // Add the hostname here
  },
};

export default nextConfig;
