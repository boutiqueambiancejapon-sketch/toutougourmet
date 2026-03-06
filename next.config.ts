import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    turbopackUseSystemTlsCerts: true,
  },
  async redirects() {
    return [
      // Anciennes URLs marques → nouvelle structure /chien/marque/
      { source: '/marques', destination: '/chien/marque', permanent: true },
      { source: '/marques/:slug', destination: '/chien/marque/:slug', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' plausible.io; img-src 'self' data: blob:; font-src 'self' fonts.gstatic.com; connect-src 'self' plausible.io;",
          },
        ],
      },
    ]
  },
}

export default withMDX(nextConfig)
