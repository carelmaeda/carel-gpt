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
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
}

module.exports = nextConfig