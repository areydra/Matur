import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { UserProfile, Chat } from '../types';

interface UserStore {
  user: User | null;
  userProfile: UserProfile | null;
  chats: Chat[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  userProfile: null,
  chats: [],
  isLoading: false,
  
  setUser: (user: User | null) =>
    set({ user }),
  
  setUserProfile: (profile: UserProfile | null) =>
    set({ userProfile: profile }),
  
  updateUserProfile: (updates: Partial<UserProfile>) =>
    set((state) => ({
      userProfile: state.userProfile 
        ? { ...state.userProfile, ...updates }
        : null
    })),
  
  setChats: (chats: Chat[]) =>
    set({ chats }),
  
  addChat: (chat: Chat) =>
    set((state) => ({
      chats: [chat, ...state.chats]
    })),
  
  updateChat: (chatId: string, updates: Partial<Chat>) =>
    set((state) => ({
      chats: state.chats.map(chat => 
        chat.id === chatId ? { ...chat, ...updates } : chat
      )
    })),
  
  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),
  
  clearUser: () =>
    set({ 
      user: null, 
      userProfile: null,
      chats: [],
      isLoading: false
    }),
}));