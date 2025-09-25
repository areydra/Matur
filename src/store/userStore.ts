import { AuthUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { UserProfile } from '../types';

interface UserStore {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: false,
  
  setUser: (user: AuthUser | null) =>
    set({ user }),
  
  setUserProfile: (profile: UserProfile | null) =>
    set({ userProfile: profile }),
  
  updateUserProfile: (updates: Partial<UserProfile>) =>
    set((state) => ({
      userProfile: state.userProfile 
        ? { ...state.userProfile, ...updates }
        : null
    })),
  
  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),
  
  clearUser: () =>
    set({ 
      user: null, 
      userProfile: null,
      isLoading: false
    }),
}));