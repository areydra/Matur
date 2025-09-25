import * as storage from '@/src/utils/authStorage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

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

// Initialize Supabase client with platform-specific storage
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        const value = await storage.getItem(key);
        return value || null;
      },
      setItem: async (key: string, value: string) => {
        await storage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        await storage.removeItem(key);
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