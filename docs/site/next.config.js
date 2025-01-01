const mdxConfig = require('./mdx.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...mdxConfig,
  reactStrictMode: true,
  output: 'export', // Enable static exports
  images: {
    unoptimized: false, // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Responsive image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Image sizes for optimization
    formats: ['image/webp'], // Use WebP format when supported
  },
  // Enable static page generation optimization
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizeImages: true, // Enable image optimization
    optimizeFonts: true, // Enable font optimization
    scrollRestoration: true, // Enable scroll position restoration
    staticPageGenerationTimeout: 120, // Increase timeout for static page generation (in seconds)
    workerThreads: true, // Enable worker threads for better build performance
    craCompat: false, // Disable CRA compatibility for better optimization
  },
  // Configure static generation behavior
  generateStaticParams: async () => {
    return {
      fallback: 'blocking', // Enable ISR for dynamic routes
      revalidate: 3600, // Revalidate static pages every hour
    };
  },
  basePath: process.env.NODE_ENV === 'production' ? '/docs' : '',
  typescript: {
    // !! WARN !!
    // This is for development only, remove in production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  webpack: (config, { isServer }) => {
    // Handle code highlighting
    config.module.rules.push({
      test: /\.prism\.css$/,
      use: ['style-loader', 'css-loader'],
    });

    return config;
  },
};

module.exports = nextConfig;
