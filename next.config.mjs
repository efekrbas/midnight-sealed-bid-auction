/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws': path.resolve(process.cwd(), 'src/isomorphic-ws-stub.js'),
    };
    return config;
  },
};

export default nextConfig;
