/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // The page used to be a static file in /public.
        source: "/prep-trek/common-questions.html",
        destination: "/prep-trek/common-questions",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
