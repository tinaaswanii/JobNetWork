/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
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
