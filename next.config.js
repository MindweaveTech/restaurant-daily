/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Headers to handle HTTPS properly
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig