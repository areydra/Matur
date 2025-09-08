import React, { memo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Avatar from '../Avatar';
import Badge from '../Badge';
import { ChatListItemProps } from '../../types';
import { styles } from './styles';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'yesterday';
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const ChatListItem: React.FC<ChatListItemProps> = ({ 
  chat, 
  participant, 
  onPress 
}) => {
  const handlePress = () => {
    onPress(chat.id);
  };

  const hasUnread = chat.unread_count > 0;
  const lastMessageTime = chat.last_message?.created_at || chat.updated_at;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Avatar
        uri={participant.avatar_url}
        name={participant.display_name}
        size="medium"
        showOnlineStatus
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {participant.display_name}
          </Text>
          <Text style={styles.time}>
            {formatTimeAgo(lastMessageTime)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[styles.message, hasUnread && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {chat.last_message?.content || 'No messages yet'}
          </Text>
          {hasUnread && (
            <Badge count={chat.unread_count} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(ChatListItem);