export interface OnboardingButtonProps {
  onPress: () => void;
  variant?: 'left' | 'right';
}

export interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export interface ProductTourSlide {
  id: number;
  title: string;
  description: string;
  illustration: string;
}

export interface ProductTourProps {
  slides: ProductTourSlide[];
  onComplete: () => void;
  onSkip: () => void;
}

// User and Profile types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  display_name?: string; // For backward compatibility with existing mock data
  avatar_url?: string;
  phone_number?: string;
  description?: string;
  last_seen_at?: string;
  created_at?: string;
  updated_at: string;
}

// Chat and Message types
export interface Chat {
  id: string;
  participant_ids: string[];
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio';
  created_at: string;
  updated_at: string;
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  joined_at: string;
}

// Avatar and Cache types
export interface CacheMetadata {
  url: string;
  localPath: string;
  timestamp: number;
  size: number;
  ttl: number;
}

export interface AvatarLoadResult {
  uri: string;
  isFromCache: boolean;
  error?: string;
}

export interface AvatarServiceConfig {
  enableCache: boolean;
  ttl: number;
  enableBackgroundSync: boolean;
}

// Component Props
export interface AvatarProps {
  uri?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  showOnlineStatus?: boolean;
  onPress?: () => void;
}

export interface ChatListItemProps {
  chat: Chat;
  participant: UserProfile;
  onPress: (chatId: string) => void;
}

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export interface BadgeProps {
  count: number;
  maxCount?: number;
}
