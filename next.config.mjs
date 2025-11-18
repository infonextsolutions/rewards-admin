/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'c.animaapp.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images (for user avatars from various sources)
      },
    ],
  },
};

export default nextConfig;
