import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Prevent Node-only packages (pg, prisma) from being bundled for the browser
  serverExternalPackages: [
    'pg',
    'pg-pool',
    '@prisma/client',
    '@prisma/adapter-pg',
    'prisma',
  ],
};

export default nextConfig;
