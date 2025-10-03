export default {
  expo: {
    owner: "areydras",
    name: "Matur",
    slug: "Matur",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "matur",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.matur",
      appleTeamId: process.env.EXPO_APPLE_TEAM_ID,
      googleServicesFile: "./GoogleService-Info.plist",
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
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      "expo-notifications",
      "expo-dev-client",
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
      ],
      [
        "./plugins/withAddXcodeSourceFile.js",
        {
          "files": [
              "Supabase.podspec",
              "Auth.podspec",
              "Functions.podspec",
              "PostgREST.podspec",
              "Realtime.podspec",
              "Storage.podspec",
              "Helpers.podspec",
              "ConcurrencyExtras.podspec",
              "HTTPTypes.podspec",
              "Clocks.podspec",
              "XCTestDynamicOverlay.podspec",
              "IssueReportingPackageSupport.podspec",
              "IssueReporting.podspec",
              "Crypto.podspec"
          ]
        }
      ],
      [
        "./plugins/withCustomPods.js",
        {
          "pods": [
              "pod 'Supabase', :podspec => './Supabase.podspec'",
              "pod 'Auth', :podspec => './Auth.podspec'",
              "pod 'Functions', :podspec => './Functions.podspec'",
              "pod 'PostgREST', :podspec => './PostgREST.podspec'",
              "pod 'Realtime', :podspec => './Realtime.podspec'",
              "pod 'Storage', :podspec => './Storage.podspec'",
              "pod 'Helpers', :podspec => './Helpers.podspec'",
              "pod 'ConcurrencyExtras', :podspec => './ConcurrencyExtras.podspec'",
              "pod 'HTTPTypes', :podspec => './HTTPTypes.podspec'",
              "pod 'Clocks', :podspec => './Clocks.podspec'",
              "pod 'XCTestDynamicOverlay', :podspec => './XCTestDynamicOverlay.podspec'",
              "pod 'IssueReportingPackageSupport', :podspec => './IssueReportingPackageSupport.podspec'",
              "pod 'IssueReporting', :podspec => './IssueReporting.podspec'",
              "pod 'Crypto', :podspec => './Crypto.podspec'"
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    }
  }
};