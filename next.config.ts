import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "/my-listings",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/my-listings",
        permanent: false,
      },
      {
        source: "/property-land",
        destination: "/findrooms",
        permanent: true,
      },
      {
        source: "/anexxes-rooms",
        destination: "/annexes-houses",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/_/backend/:path*",
        destination: "http://localhost:5000/:path*",
      },
    ];
  },
};

export default nextConfig;
