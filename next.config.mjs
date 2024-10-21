import CopyPlugin from "copy-webpack-plugin";
import path from "path";

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
              from: path.join(process.cwd(), "data/GeoLite2-Country.mmdb"),
              to: path.join(process.cwd(), "data/GeoLite2-Country.mmdb"),
            },
          ],
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
