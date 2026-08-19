import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.pravatar.cc" },
      { hostname: "logo.clearbit.com" },
      { hostname: "ui-avatars.com" },
      { hostname: "www.google.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
