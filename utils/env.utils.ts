export const DEVELOPMENT_ENV = "development";
export const TEST_ENV = "test";
export const PRODUCTION_ENV = "production";

type EnvType = typeof DEVELOPMENT_ENV | typeof TEST_ENV | typeof PRODUCTION_ENV;

export const isProductionEnv = (env?: EnvType) => {
  return env && env === PRODUCTION_ENV;
};
