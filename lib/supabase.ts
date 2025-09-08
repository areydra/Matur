import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV instance for auth storage
const encryptionKey = process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error(
    'Missing MMKV encryption key. Please add EXPO_PUBLIC_MMKV_ENCRYPTION_KEY to your .env file.'
  );
}

const authStorage = new MMKV({
  id: 'auth-storage',
  encryptionKey, // From environment variable
});

// Environment variables from .env file
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains:\n' +
    '- EXPO_PUBLIC_SUPABASE_URL\n' +
    '- EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Initialize Supabase client with MMKV for token storage (handles large tokens)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      getItem: (key: string) => {
        const value = authStorage.getString(key);
        return Promise.resolve(value || null);
      },
      setItem: (key: string, value: string) => {
        authStorage.set(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        authStorage.delete(key);
        return Promise.resolve();
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if a user has completed their profile setup
export const hasCompletedProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle() to handle non-existent profiles
      
    if (error) throw error;
    console.log('data: ', data);
    // Return false if no profile exists or name is empty
    return !!(data && data.name);
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
};

// Handle app state changes for token refresh (recommended for Google Sign-In)
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});