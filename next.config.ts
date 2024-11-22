import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"], // Moved from experimental to here
};

export default nextConfig;
