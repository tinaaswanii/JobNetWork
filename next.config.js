/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // The home page used to take ?q=; the one listing URL is /jobs now.
        source: "/",
        has: [{ type: "query", key: "q", value: "(?<q>.+)" }],
        destination: "/jobs?q=:q",
        permanent: true,
      },
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
