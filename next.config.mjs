/** @type {import('next').NextConfig} */
const nextConfig = {
  // OpenNext controls the build output for Cloudflare Workers.
  // Do NOT set output: 'standalone' here.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
