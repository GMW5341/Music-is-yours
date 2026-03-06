/** @type {import('next').NextConfig} */
const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig = {
  reactStrictMode: true,

  // Static export only for Capacitor builds (npm run build:mobile)
  // Vercel deploys use server mode to support API routes
  ...(isCapacitor && { output: "export" }),

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
};

module.exports = nextConfig;
