import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { BadgeProps } from '../../types';
import { styles } from './styles';

const Badge: React.FC<BadgeProps> = ({ count, maxCount = 99 }) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
};

export default memo(Badge);