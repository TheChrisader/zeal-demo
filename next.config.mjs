import CopyPlugin from "copy-webpack-plugin";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, "data"),
              to: path.join(__dirname, ".next/server/data"),
            },
          ],
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
