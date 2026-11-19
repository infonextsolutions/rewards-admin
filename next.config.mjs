import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle in .next/standalone, used by the Docker image.
  output: "standalone",
  // Pin tracing to this folder (the parent repo has its own lockfile).
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
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
      {
        protocol: "https",
        hostname: "indoviaholdings.com",
      },
      {
        protocol: "https",
        hostname: "**.indoviaholdings.com",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
