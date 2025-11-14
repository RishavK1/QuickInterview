import type { NextConfig } from "next";
import path from "node:path";

const LOADER = path.resolve(__dirname, 'src/visual-edits/component-tagger-loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  // Removed outputFileTracingRoot - causes issues on Vercel
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [LOADER]
      }
    }
  },
  // Disable automatic favicon processing
  webpack: (config, { isServer }) => {
    // Ignore .ico files to prevent processing errors
    config.module.rules.push({
      test: /\.ico$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[name][ext]',
      },
    });
    return config;
  },
};

export default nextConfig;
