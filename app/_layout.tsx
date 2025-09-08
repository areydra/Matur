import { hasCompletedProfile, supabase } from '@/lib/supabase';
import { useNavigationStore } from '@/src/store/navigationStore';
import { useUserStore } from '@/src/store/userStore';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle } from 'expo-status-bar';
import { useEffect, useLayoutEffect, useState } from 'react';
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

  const [isLoading, setIsLoading] = useState(true);
  
  // User store for profile completion and user data
  const { setUser, clearUser } = useUserStore();
  const { activeStack, setActiveStack, resetToOnboarding } = useNavigationStore();

  useEffect(function handleSplashScreen() {
    if (!loaded) {
      return;
    }

    if (isLoading) {
      return;
    }

    SplashScreen.hide();
  }, [loaded, isLoading]);

  // Check authentication status and profile completion
  useLayoutEffect(function initialization() {
    setStatusBarStyle('light');
    checkUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuthenticated = !!session;
      
      // If user just signed in, check if they need to complete profile setup
      if (isAuthenticated && event === 'SIGNED_IN' && session?.user) {
        const profileCompleted = await hasCompletedProfile(session.user.id);
        console.log('profileCompleted', profileCompleted);
        // Update the store with user data and profile completion status
        setUser(session.user);
        setActiveStack(profileCompleted ? 'home' : 'setup_account');
      } else if (!isAuthenticated) {
        // Clear store when signed out
        clearUser();
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [])

  const checkUser = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking auth status:', error);
        resetToOnboarding();
        clearUser(); // Clear store when no auth
        setIsLoading(false);
        return;
      }
      
      // User is logged in if session exists
      const isAuthenticated = !!data.session;
      
      console.log('isAuthenticated', isAuthenticated, data.session?.user);
      
      // If user is authenticated, check if they have completed their profile
      if (isAuthenticated && data.session?.user) {
        const profileCompleted = await hasCompletedProfile(data.session.user.id);
        // Update the store with user data and profile completion status
        setUser(data.session.user);
        setActiveStack(profileCompleted ? 'home' : 'setup_account');
      } else {
        // Clear store when not authenticated
        clearUser();
      }
    } catch (error) {
      console.error('Error in auth check:', error);
      resetToOnboarding();
      clearUser();
    } finally {
      setIsLoading(false);
    }
  };

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Protected guard={activeStack === 'onboarding'}>
        <Stack.Screen
          name="onboarding"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={activeStack === 'setup_account'}>
        <Stack.Screen name="setup-account" />
      </Stack.Protected>
      <Stack.Protected guard={activeStack === 'home'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
