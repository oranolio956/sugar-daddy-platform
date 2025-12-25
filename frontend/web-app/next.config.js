/** @type {import('next').NextConfig} */
const nextConfig = {
  // Source directory
  srcDir: '.',
  // Performance optimizations
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: [],
  },

  // Image optimization
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    };

    // Optimize for production
    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },

  // Compression
  compress: true,

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).(jpg|jpeg|gif|webp|avif|png|svg|ico|woff|woff2|ttf|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
      },
      {
        source: '/robots',
        destination: '/robots.txt',
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://dandybabe.com',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_BING_SITE_VERIFICATION: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
    NEXT_PUBLIC_YANDEX_SITE_VERIFICATION: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
  },

  // Development optimizations
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  generateBuildId: async () => {
    return process.env.BUILD_ID || Date.now().toString();
  },

  // Output configuration
  output: 'standalone',

  // Trailing slash
  trailingSlash: false,

  // i18n configuration
  i18n: {
    locales: ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
    defaultLocale: 'en-US',
    localeDetection: false,
  },

  // Typescript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;