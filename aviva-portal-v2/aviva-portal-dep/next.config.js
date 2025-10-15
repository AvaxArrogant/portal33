// This file is deprecated in favor of next.config.mjs
// We're keeping it for reference but it's not being used
// To use this file in a CommonJS environment, rename it to next.config.cjs

// Disable service worker in development environment
const isProd = process.env.NODE_ENV === 'production';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Only enable PWA features in production
  pwa: isProd ? {
    dest: 'public',
    disable: !isProd,
    register: true,
    scope: '/',
    sw: 'service-worker.js',
    skipWaiting: true,
  } : false,
};

// This won't work in ES module context
// module.exports = nextConfig;