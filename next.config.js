/** @type {import('next').NextConfig} */
const nextConfig = {
  // Web 应用配置
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config, { isServer }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    // Handle Prisma client conditionally
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Ignore build errors from Prisma when no database is available
  typescript: {
    ignoreBuildErrors: process.env.FORCE_INDEXEDDB === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.FORCE_INDEXEDDB === 'true',
  },
}

module.exports = nextConfig