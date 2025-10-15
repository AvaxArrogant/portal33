/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Help Next resolve and bundle pdf-lib for server routes
  experimental: {
    serverComponentsExternalPackages: ["pdf-lib"],
  },
  transpilePackages: ["pdf-lib"],
};

export default nextConfig;