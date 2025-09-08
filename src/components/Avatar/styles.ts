import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../utils/theme';

export const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  fallback: {
    backgroundColor: colors.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  loading: {
    backgroundColor: colors.purpleSoft,
  },
  initials: {
    color: colors.white,
    fontFamily: fonts.semibold,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: colors.white,
  },
  // Size variants
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 45,
    height: 45,
  },
  large: {
    width: 80,
    height: 80,
  },
  // Initial text sizes
  initials_small: {
    fontSize: 12,
  },
  initials_medium: {
    fontSize: 18,
  },
  initials_large: {
    fontSize: 24,
  },
});