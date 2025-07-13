import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3333/:path*" // Remove /api prefix since backend doesn't use it
      }
    ];
  }
};

export default nextConfig;
