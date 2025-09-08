import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../utils/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  name: {
    ...typography.title,
    fontSize: 12,
    lineHeight: 16,
    color: colors.white,
    flex: 1,
  },
  time: {
    ...typography.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    ...typography.sm,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.lg,
  },
  unreadMessage: {
    ...typography.sm,
    color: colors.white,
  },
});