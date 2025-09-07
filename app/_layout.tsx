import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle } from 'expo-status-bar';
import { useEffect, useLayoutEffect } from 'react';
import 'react-native-reanimated';

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  const isLoggedIn = false;

  useEffect(function handleSplashScreen() {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  useLayoutEffect(function initialization() {
    setStatusBarStyle('light')
  }, [])

  if (!loaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="onboarding"/>
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
