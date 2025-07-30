/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Experimental features to help with Windows issues
  experimental: {
    // Reduce file system polling
    optimizePackageImports: [],
  }
}

module.exports = nextConfig