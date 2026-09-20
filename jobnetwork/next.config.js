/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
