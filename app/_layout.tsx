import Header from '@/src/components/Header';
import { hasCompletedProfile, supabase } from '@/src/database/supabase';
import { useGetProfile } from '@/src/services/api/queryHooks';
import { useNavigationStore } from '@/src/store/navigationStore';
import { useUserStore } from '@/src/store/userStore';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setStatusBarStyle } from 'expo-status-bar';
import { useEffect, useLayoutEffect, useState } from 'react';
import 'react-native-reanimated';

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

function StackProvider() {
  const [loaded] = useFonts({
    SpaceMono: require('../src/assets/fonts/SpaceMono-Regular.ttf'),
    'Montserrat-Regular': require('../src/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../src/assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('../src/assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../src/assets/fonts/Montserrat-Bold.ttf'),
  });

  const [isLoading, setIsLoading] = useState(true);
  
  const { user, setUser, clearUser } = useUserStore();
  const { activeStack, setActiveStack, resetToOnboarding } = useNavigationStore();
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const { mutateAsync: getProfile } = useGetProfile();

  useEffect(function handleSplashScreen() {
    if (!loaded) {
      return;
    }

    if (isLoading) {
      return;
    }

    SplashScreen.hide();
  }, [loaded, isLoading]);

  useEffect(function handleProfileData() {
    if (!user?.id) {
      return;
    }

    getProfile({ userId: user.id }).then(setUserProfile)
  }, [user?.id]);

  useLayoutEffect(function initialization() {
    setStatusBarStyle('light');
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuthenticated = !!session;
      
      if (isAuthenticated && event === 'SIGNED_IN' && session?.user) {
        const profileCompleted = await hasCompletedProfile(session.user.id);
        setUser(session.user);
        setActiveStack(profileCompleted ? 'home' : 'setup_account');
      } else if (!isAuthenticated) {
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
        clearUser();
        setIsLoading(false);
        return;
      }
      
      const isAuthenticated = !!data.session;
            
      if (isAuthenticated && data.session?.user) {
        const profileCompleted = await hasCompletedProfile(data.session.user.id);
        setUser(data.session.user);
        setActiveStack(profileCompleted ? 'home' : 'setup_account');
      } else {
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
          <Stack.Screen
            name="profile"
            options={{
              headerShown: true,
              header: () => <Header/>,
            }}
          />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
    </Stack>
  )
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StackProvider/>
    </QueryClientProvider>
  );
}
