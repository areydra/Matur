import { Image } from 'expo-image';
import React, { memo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAvatar } from '../../hooks/useAvatar';
import { AvatarProps } from '../../types';
import { styles } from './styles';

const Avatar: React.FC<AvatarProps> = ({ 
  uri, 
  name, 
  size = 'medium', 
  showOnlineStatus = false,
  onPress 
}) => {
  const { uri: avatarUri, isLoading, error } = useAvatar(uri);

  const getInitials = (name: string) => {
    if (!name) return '';

    const names = name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const containerStyle = [
    styles.container,
    styles[size],
  ];

  // Determine what to show in the avatar
  const shouldShowImage = avatarUri && !error;
  const shouldShowLoading = isLoading && uri;

  const content = (
    <View style={containerStyle}>
      {shouldShowLoading ? (
        // Show loading indicator
        <View style={[styles.fallback, styles[size], styles.loading]}>
          <ActivityIndicator 
            size={size === 'small' ? 'small' : 'large'} 
            color="#666666" 
          />
        </View>
      ) : shouldShowImage ? (
        // Show loaded image
        <Image 
          source={{ uri: avatarUri }} 
          style={styles.image} 
          contentFit="cover"
          transition={200}
        />
      ) : (
        // Show fallback with initials
        <View style={[styles.fallback, styles[size]]}>
          <Text style={[styles.initials, styles[`initials_${size}`]]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {showOnlineStatus && <View style={styles.onlineIndicator} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default memo(Avatar);