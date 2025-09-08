import { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserData: (user: User, isProfileCompleted: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  
  setUser: (user: User | null) =>
    set({ user }),
  
  updateUserData: (user: User) =>
    set({ user }),
  
  clearUser: () =>
    set({ user: null }),
}));