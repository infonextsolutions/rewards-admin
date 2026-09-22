/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "c.animaapp.com",
      },
      {
        protocol: "https",
        hostname: "rewardsapi.hireagent.co",
      },
      {
        protocol: "https",
        hostname: "*.hireagent.co",
      },
    ],
  },
};

export default nextConfig;
