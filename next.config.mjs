/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'isomorphic-ws': path.resolve(process.cwd(), 'src/isomorphic-ws-stub.js'),
      '@midnight-ntwrk/compact-runtime$': path.resolve(process.cwd(), 'node_modules/@midnight-ntwrk/compact-runtime/dist/index.js'),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
      };
    }
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    // Midnight's Ledger and Compact runtimes are asynchronous WASM modules.
    // Next's default Webpack target is conservative; declare support explicitly
    // so it does not generate a runtime that treats async WASM as unsupported.
    config.output.environment = {
      ...config.output.environment,
      asyncFunction: true,
    };
    return config;
  },
};

export default nextConfig;
