import CopyPlugin from "copy-webpack-plugin";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants.js";
import path from "path";

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
const NextConfig = async (phase) => {
  /** @type {import("next").NextConfig} */
  const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    // cacheHandler: require.resolve('./cache-handler.js'),
    // cacheMaxMemorySize: 0,
    i18n: {
      locales: ["en", "fr"],
      defaultLocale: "en",
      localeDetection: false,
      // localePath: "locales",
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

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "service-worker/app-worker.ts",
      swDest: "public/sw.js",
      reloadOnOnline: true,
      cacheOnNavigation: true,
    });
    return withSerwist(nextConfig);
  }

  return nextConfig;
};

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

export default NextConfig;
