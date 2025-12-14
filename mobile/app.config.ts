import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Peanut",
  slug: "peanut",
  scheme: "peanut",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  experiments: {
    typedRoutes: true
  },
  plugins: [
    "expo-router",
    [
      "sentry-expo",
      {
        organization: "peanut",
        project: "mobile"
      }
    ]
  ],
  extra: {
    eas: {
      projectId: "00000000-0000-0000-0000-000000000000"
    },
    sentryDsn: process.env.SENTRY_DSN
  }
});
