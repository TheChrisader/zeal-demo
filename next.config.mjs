import CopyPlugin from "copy-webpack-plugin";
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from "next/constants.js";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
const NextConfig = async (phase) => {
  /** @type {import("next").NextConfig} */
  let nextConfig = {
    experimental: {
      instrumentationHook: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    // cacheHandler: require.resolve('./cache-handler.js'),
    // cacheMaxMemorySize: 0,
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

  if (process.env.ANALYZE === "true") {
    const bundleAnalyzer = await import("@next/bundle-analyzer");

    const withBundleAnalyzer = bundleAnalyzer.default({
      enabled: true,
    });

    nextConfig = withBundleAnalyzer(nextConfig);
  }

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import("@serwist/next")).default({
      swSrc: "service-worker/app-worker.ts",
      swDest: "public/sw.js",
      reloadOnOnline: true,
      cacheOnNavigation: true,
    });
    // return withNextIntl(withSerwist(nextConfig));
    nextConfig = withSerwist(nextConfig);
  }

  return withNextIntl(nextConfig);
};

export default NextConfig;
