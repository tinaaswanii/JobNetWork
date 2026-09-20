import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/jobs",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
