import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { ColorValue, TouchableOpacity } from 'react-native';
import { OnboardingButtonProps } from '../../types';
import { colors } from '../../utils/theme';
import { styles } from './styles';

const OnboardingButton: React.FC<OnboardingButtonProps> = ({ 
  onPress, 
  variant = 'left',
}) => {
  return variant === 'right' ? (
    <TouchableOpacity
      style={styles.navigationButtonRight}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={colors.gradient.button as [ColorValue, ColorValue]}
        style={styles.gradientButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name={'chevron-forward'} 
          size={24} 
          color={colors.white} 
        />
      </LinearGradient>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={styles.navigationButtonLeft}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={'chevron-back'} 
        size={24} 
        color={colors.blue} 
      />
    </TouchableOpacity>
  );
};

export default memo(OnboardingButton);