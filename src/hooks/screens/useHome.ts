import { useGetChatSummary, useGetSpecificProfile, usePostChatSummary } from '@/src/services/api/queryHooks';
import { useUserStore } from '@/src/store/userStore';
import { ChatSummary } from '@/src/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export const useHome = () => {
  const { userProfile } = useUserStore();
  const { isLoading, data: messageSummary } = useGetChatSummary();
  const { mutateAsync: findUserProfile } = useGetSpecificProfile();
  const { mutateAsync: createChatSummary } = usePostChatSummary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filteredChats, setFilteredChats] = useState<ChatSummary[]>([]);

  // Filter chats based on search query
  useEffect(() => {    
    if (!searchQuery.trim()) {
      setFilteredChats(messageSummary);
      return;
    }
    
    filterChats(messageSummary, searchQuery);
  }, [messageSummary, searchQuery]);

  const filterChats = (chats: ChatSummary[], query: string ) => {
    const filteredChats = chats.filter(item => item.participant_name.toLowerCase().includes(query.toLowerCase()))

    if (filteredChats.length || !userProfile?.id) {
      setFilteredChats(filteredChats);
      return;
    }

    findUserProfile({ name: query, userId: userProfile.id }).then(people => {
        const newFilteredChats = people.data?.map(person => ({
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

        setFilteredChats(newFilteredChats?.length ? newFilteredChats : []);
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
        // TODO: Navigate to chat screen when implemented
        console.log('summary data: ', data);
      });
      return;
    }

    // TODO: Navigate to chat screen when implemented
    console.log('existing chat', chat);
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