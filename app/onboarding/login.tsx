import useLogin from '@/hooks/screens/useLogin';
import { colors, spacing, typography } from '@/src/utils/theme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { loading, error, handleGoogleSignIn } = useLogin();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Continue with your Google Account</Text>
        <Text style={styles.subtitle}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
        
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
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
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
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
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