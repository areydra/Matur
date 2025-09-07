import { StyleSheet } from 'react-native';
import { colors, layout, spacing } from '../../utils/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: layout.indicatorSize,
    height: layout.indicatorSize,
    borderRadius: layout.indicatorSize / 2,
    marginHorizontal: spacing.xxs,
  },
  activeIndicator: {
    backgroundColor: colors.indicator.active,
    width: 30, // Make active indicator wider
  },
  inactiveIndicator: {
    backgroundColor: colors.indicator.inactive,
    width: 15,
  },
});