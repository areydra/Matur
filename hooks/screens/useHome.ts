import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { filterChats, getChatParticipant, mockChats } from '../../src/services/mockData';
import { useUserStore } from '../../src/store/userStore';

export const useHome = () => {
  const { user, userProfile, chats, setUserProfile, setChats } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize mock data
  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true);
      
      // Set current user profile
      if (!userProfile && user?.id) {
        supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() 
        .then(({data}) => {
          setUserProfile(data);
        })
      }
      
      // Set mock chats
      if (chats.length === 0) {
        setChats(mockChats);
      }
      
      setIsLoading(false);
    };

    // Simulate loading delay
    setTimeout(initializeData, 500);
  }, [userProfile, chats, setUserProfile, setChats]);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!userProfile) return [];
    
    if (!searchQuery.trim()) {
      return chats.map(chat => ({
        chat,
        participant: getChatParticipant(chat, userProfile.id)!
      })).filter(({ participant }) => participant);
    }
    
    return filterChats(chats, searchQuery, userProfile.id);
  }, [chats, searchQuery, userProfile]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchQuery('');
    }
  };

  const handleChatPress = (chatId: string) => {
    console.log('Navigate to chat:', chatId);
    // TODO: Navigate to chat screen when implemented
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return {
    userProfile,
    filteredChats,
    searchQuery,
    isSearchMode,
    isLoading,
    handleSearch,
    toggleSearchMode,
    handleChatPress,
    handleProfilePress,
  };
};