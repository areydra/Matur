import { useLoginWithGoogleToken } from '@/lib/api/queryHooks';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: loginWithGoogleToken } = useLoginWithGoogleToken();

  useEffect(function initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
      
        if (!userInfo.data?.idToken) {
            throw new Error('No ID token received from Google Sign-In');
        }

        const { error } = await loginWithGoogleToken(userInfo.data.idToken);
        
        if (error) {
            throw error;
        }
    } catch (error: any) {      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-in was cancelled.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleGoogleSignIn,
  }
}