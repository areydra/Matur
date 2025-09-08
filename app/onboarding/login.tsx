import { supabase } from '@/lib/supabase';
import { colors, spacing, typography } from '@/src/utils/theme';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: "260927430287-auta4l17bmjkavn5n56tn0bdl4bdtrn1.apps.googleusercontent.com",
      iosClientId: "260927430287-jjc4ai03n5mln36mbtpg17o5q3s1vf47.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Get the user's ID token
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }
      
      // Sign in to Supabase using the ID token
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });
      
      if (error) throw error;
      
      // The _layout.tsx will handle the session and redirect to the appropriate screen
      
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific Google Sign-In errors
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Continue with your Google Account</Text>
        <Text style={styles.subtitle}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
        
        {/* Google Sign In Button */}
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Image 
            source={require('@/assets/images/google-icon.svg')} 
            style={styles.googleIcon}
            contentFit="contain"
          />
          <Text style={styles.googleButtonText}>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Text>
          {loading && (
            <ActivityIndicator 
              size="small" 
              color="#5D5FEF" 
              style={styles.loader}
            />
          )}
        </TouchableOpacity>
        
        {/* Error message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By clicking continue you are agree with {'\n'} our{' '}
            <Link href="/onboarding/terms" style={styles.termsLink}>
              Terms and Conditions
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dark purple background
  },
  backButton: {
    position: 'absolute',
    // top: 16,
    left: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'green'
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'left',
    lineHeight: 42,
  },
  subtitle: {
    ...typography.caption,
    color: colors.blueLight,
    marginBottom: 48,
    textAlign: 'left',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purpleSoft,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    ...typography.body,
    color: colors.blueLight,
  },
  loader: {
    marginLeft: 10,
  },
  errorText: {
    ...typography.caption,
    color: colors.red,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'left',
  },
  termsContainer: {
    marginTop: 58,
  },
  termsText: {
    ...typography.sm,
    color: colors.blueLight,
    textAlign: 'center',
  },
  termsLink: {
    ...typography.sm,
    color: colors.blue,
  },
});