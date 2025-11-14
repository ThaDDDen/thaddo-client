import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have TypeScript types
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Add empty turbopack config to silence the warning
  turbopack: {},
  // Enable standalone output for Docker
  output: "standalone",
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Optional: add custom runtime caching rules
  // runtimeCaching: [],
})(nextConfig);
