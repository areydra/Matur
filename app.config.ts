export default {
  expo: {
    name: "Matur",
    slug: "Matur",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "matur",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.matur",
      appleTeamId: process.env.EXPO_APPLE_TEAM_ID
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/icon.png",
        backgroundColor: "#FFFFFF"
      },
      edgeToEdgeEnabled: true,
      package: "com.matur"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./src/assets/images/icon-with-brand.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0E0A47"
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            extraPods: [
              {
                name: "simdjson",
                configurations: [
                  "Debug",
                  "Release"
                ],
                path: "../node_modules/@nozbe/simdjson",
                modular_headers: true
              }
            ]
          }
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_IOS_URL_SCHEME
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app would like to access your photos to allow you to select a profile picture.",
          cameraPermission: "The app would like to access your camera to allow you to take a profile picture."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};