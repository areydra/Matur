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
  avatar_url: string;
  phone_number: string;
  description: string;
}

// ChatSummary and Message types
export interface ChatSummary {
  id: string;
  owner_id: string;
  participant_id: string;
  chat_id: string;
  participant_avatar_url: string;
  participant_name: string;
  last_message: string;
  last_message_created_at: string;
  last_message_from_id: string;
  count_unread_messages: number;
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
  chat: ChatSummary;
  onPress: (chat: ChatSummary) => void;
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
