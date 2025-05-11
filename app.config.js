export default {
  name: "Trend Forge",
  slug: "trend-forge",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mrwain.trendforge"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.mrwain.trendforge"
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro"
  },
  extra: {
    eas: {
      projectId: "your-project-id"
    },
    // Secure environment variables
    piSdkSandbox: process.env.NODE_ENV !== 'production',
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  }
};
