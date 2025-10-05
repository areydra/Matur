import { supabase } from '@/src/database/supabase';
import { useGetChatSummary, useGetProfile, useGetSpecificProfile, usePostChatSummary } from '@/src/services/api/queryHooks';
import useChatSummaryStore from '@/src/store/chatSummaryStore';
import { useUserStore } from '@/src/store/userStore';
import { ChatSummary } from '@/src/types';
import { RealtimeChannel } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

export const useHome = () => {
  const { userProfile } = useUserStore();
  const { isLoading, data: messageSummary, refetch: refetchMessageSummary } = useGetChatSummary();
  const { mutateAsync: findUserProfile } = useGetSpecificProfile();
  const { mutateAsync: createChatSummary } = usePostChatSummary();
  const { mutateAsync: getProfile } = useGetProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filteredChats, setFilteredChats] = useState<ChatSummary[] | null>(null);
  const { chats, addChats, setChats, updateChats } = useChatSummaryStore(useShallow(state => ({
    chats: state.list,
    addChats: state.addList,
    setChats: state.setList,
    updateChats: state.updateList,
  })));

  useEffect(function initSummaryChatData() {
    if (!messageSummary) {
      return;
    }

    setChats(messageSummary);
  }, [messageSummary]);

  useEffect(function refetchSummaryChatDataOnForeground() {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refetchMessageSummary();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(function listenChatSummary() {
    if (!userProfile?.id) {
      return;
    }
    
    let chatRooms: RealtimeChannel | null = null;
    
    const setupRealtimeConnection = () => {
      // Unsubscribe existing connection if any
      if (chatRooms) {
        chatRooms.unsubscribe();
      }
      
      // Create new connection
      chatRooms = supabase.channel(`chat-summary-rooms-${userProfile.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'chat_summary', 
            filter: `owner_id=eq.${userProfile.id}` 
          },
          (payload) => {
            switch (payload.eventType) {
              case 'INSERT':
                getProfile({ userId: payload.new.participant_id }).then(data => {
                  addChats([{
                    ...payload.new,
                    participant_avatar_url: data.avatar_url,
                    participant_name: data.name
                  } as ChatSummary]);
                });
                return;
              case 'UPDATE':
                updateChats(payload.new as ChatSummary);
                return;
            }
          }
        );

      chatRooms.subscribe();
    };
    
    // Initial setup
    setupRealtimeConnection();
    
    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App came to foreground - reconnecting realtime');
        setupRealtimeConnection();
      } else if (nextAppState === 'background') {
        console.log('App going to background - disconnecting realtime');
        if (chatRooms) {
          chatRooms.unsubscribe();
        }
      }
    });

    return () => {
      if (chatRooms) {
        chatRooms.unsubscribe();
      }
      subscription?.remove();
    };
  }, [userProfile?.id]);

  useEffect(function searchSummaryChatData() {
    if (!searchQuery.trim()) {
      setFilteredChats(null);
    } else {
      filterChats(chats, searchQuery);
    }
  }, [chats, searchQuery]);

  const filterChats = (chats: ChatSummary[], query: string ) => {
    const filteredChats = chats.filter(item => item.participant_name?.toLowerCase().includes(query.toLowerCase()))

    if (filteredChats.length || !userProfile?.id) {
      setFilteredChats(filteredChats);
      return;
    }

    findUserProfile({ name: query, userId: userProfile.id }).then(people => {
      if (!people.data) {
        setFilteredChats([]);
        return;
      }

      const newFilteredChats = people.data.map(person => ({
        id: '',
        owner_id: '',
        participant_id: person.id,
        chat_id: '',
        participant_avatar_url: person.avatar_url,
        participant_name: person.name,
        last_message: '',
        last_message_created_at: new Date().toISOString(),
        last_message_from_id: '',
        count_unread_messages: 0,
      }));

      setFilteredChats(newFilteredChats);
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchQuery('');
    }
  };

  const handleChatPress = (chat: ChatSummary) => {
    if (!chat.id.length && userProfile?.id) {
      createChatSummary({ owner_id: userProfile.id, participant_id: chat.participant_id }).then(data => {
        navigateToDMScreen({
          id: data.participant_id,
          chatId: data.chat_id,
          name: data.participant_name,
          avatar_url: data.participant_avatar_url,
        })
      });
      return;
    }

    navigateToDMScreen({
      id: chat.participant_id,
      chatId: chat.chat_id,
      name: chat.participant_name,
      avatar_url: chat.participant_avatar_url,
    })
  };

  const navigateToDMScreen = (participant: {
    id: string;
    chatId: string;
    name: string;
    avatar_url: string;
  }) => {
    router.push({
      pathname: `/chat/[receiverId]`,
      params: {
        chatId: participant.chatId,
        receiverId: participant.id,
        receiverName: participant.name,
        receiverAvatarUrl: participant.avatar_url,
      }
    });
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return {
    userProfile,
    chats: filteredChats ?? chats,
    searchQuery,
    isSearchMode,
    isLoading,
    handleSearch,
    toggleSearchMode,
    handleChatPress,
    handleProfilePress,
  };
};