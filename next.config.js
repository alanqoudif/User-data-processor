/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/tool',
  assetPrefix: '/tool',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 