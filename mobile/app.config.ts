import { ExpoConfig, ConfigContext } from "expo/config";

const androidConfig: ExpoConfig["android"] = {
  package: "com.cristobal2323.peanut",
  versionCode: 1,
  adaptiveIcon: {
    foregroundImage: "./assets/icon.png",
    backgroundColor: "#FFFFFF",
  },
  googleServicesFile: "./google-services.json",
};

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    name: "Trufa ID",
    slug: "trufa-id",
    scheme: "trufaid",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF",
    },
    assetBundlePatterns: ["**/*"],
    experiments: {
      typedRoutes: true,
    },

    android: androidConfig,
    ios: {
      bundleIdentifier: "com.cristobal2323.peanut",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIViewControllerBasedStatusBarAppearance: true,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },

    plugins: [
      "expo-router",
      [
        "@sentry/react-native/expo",
        {
          organization: "maturana",
          project: "react-native",
          url: "https://sentry.io/",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Trufa ID to use your location to find nearby lost dogs and sightings.",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow Trufa ID to access your camera for dog scanning.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#F4A261",
        },
      ],
      "./plugins/withCleartextTraffic",
      "./plugins/withPodfileProperties",
      "@react-native-community/datetimepicker",
    ],

    extra: {
      eas: {
        projectId:
          process.env.EAS_PROJECT_ID ?? "00000000-0000-0000-0000-000000000000",
      },
      sentryDsn: process.env.SENTRY_DSN,
    },
  }) as ExpoConfig;
