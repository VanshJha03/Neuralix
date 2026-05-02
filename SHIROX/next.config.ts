import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Silence "Critical dependency" warnings from @google/genai
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 'utf-8-validate': 'commonjs utf-8-validate', bufferutil: 'commonjs bufferutil' }];
    return config;
  },
};

export default nextConfig;
