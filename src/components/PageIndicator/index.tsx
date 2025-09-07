import React, { memo } from 'react';
import { View, Animated } from 'react-native';
import { styles } from './styles';
import { PageIndicatorProps } from '../../types';

const PageIndicator: React.FC<PageIndicatorProps> = ({ currentPage, totalPages }) => {
  const indicators = Array.from({ length: totalPages }, (_, index) => {
    const isActive = index === currentPage;
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.indicator,
          isActive ? styles.activeIndicator : styles.inactiveIndicator,
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      {indicators}
    </View>
  );
};

export default memo(PageIndicator);