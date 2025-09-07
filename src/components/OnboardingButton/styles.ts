import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

export const styles = StyleSheet.create({
  navigationButtonRight: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  navigationButtonLeft: {
    backgroundColor: colors.purpleLight,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});