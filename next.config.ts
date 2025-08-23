import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export' as const, // Enable static export for Netlify
  trailingSlash: true, // Add trailing slashes for better static hosting
  distDir: 'out', // Output directory for static export
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export
  },
};

export default withNextIntl(nextConfig);
