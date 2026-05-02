import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow large API responses (AI image base64)
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  // Silence "Critical dependency" warnings from @google/genai
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 'utf-8-validate': 'commonjs utf-8-validate', bufferutil: 'commonjs bufferutil' }];
    return config;
  },
};

export default nextConfig;
