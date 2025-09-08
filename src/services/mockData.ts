import { UserProfile, Chat, ChatMessage } from '../types';

// Mock user profiles
export const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'andreas@example.com',
    name: 'Andreas',
    display_name: 'Andreas',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone_number: '+1-555-6321-332',
    description: 'A young fresh minded UI Designer',
    last_seen_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'samantha@example.com',
    name: 'Samantha',
    display_name: 'Samantha',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b7d80e13?w=150&h=150&fit=crop&crop=face',
    phone_number: '+1-555-1234-567',
    description: 'Coffee enthusiast and designer',
    last_seen_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'antonio@example.com',
    name: 'Antonio',
    display_name: 'Antonio',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone_number: '+1-555-9876-543',
    description: 'Frontend developer and tech enthusiast',
    last_seen_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock chat messages
export const mockMessages: ChatMessage[] = [
  {
    id: '1',
    chat_id: 'chat-1',
    sender_id: '2',
    content: 'I tried dusting after five energy drinks ...',
    message_type: 'text',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    chat_id: 'chat-2',
    sender_id: '3',
    content: 'Would you rather be an ...',
    message_type: 'text',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock chats
export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    participant_ids: ['1', '2'], // current user (1) and Samantha (2)
    last_message: mockMessages[0],
    unread_count: 2,
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'chat-2',
    participant_ids: ['1', '3'], // current user (1) and Antonio (3)
    last_message: mockMessages[1],
    unread_count: 0,
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

// Mock current user (Andreas)
export const mockCurrentUser: UserProfile = mockUsers[0];

// Service functions
export const getUserById = (id: string): UserProfile | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getChatParticipant = (chat: Chat, currentUserId: string): UserProfile | undefined => {
  const participantId = chat.participant_ids.find(id => id !== currentUserId);
  return participantId ? getUserById(participantId) : undefined;
};

export const searchUsers = (query: string, currentUserId: string): UserProfile[] => {
  if (!query.trim()) return mockUsers.filter(user => user.id !== currentUserId);
  
  return mockUsers.filter(user => 
    user.id !== currentUserId &&
    (user.display_name || user.name).toLowerCase().includes(query.toLowerCase())
  );
};

export const filterChats = (chats: Chat[], query: string, currentUserId: string): { chat: Chat; participant: UserProfile }[] => {
  return chats
    .map(chat => ({
      chat,
      participant: getChatParticipant(chat, currentUserId)!
    }))
    .filter(({ participant }) =>
      participant && (participant.display_name || participant.name).toLowerCase().includes(query.toLowerCase())
    );
};