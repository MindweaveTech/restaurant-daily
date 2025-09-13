/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Remove standalone mode for now
}

module.exports = nextConfig