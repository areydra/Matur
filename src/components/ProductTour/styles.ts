import { Dimensions, StyleSheet } from 'react-native';
import { colors, layout, spacing, typography } from '../../utils/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  illustration: {
    width: width,
    height: width,
    resizeMode: 'contain',
  },
  illustrationEmoji: {
    fontSize: 48,
    position: 'absolute',
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.title,
    color: colors.white,
    textAlign: 'left',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  bottomContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.xl,
  },
  shape: {
    position: 'absolute',
    width: width,
    height: width * 1.2,
    resizeMode: 'cover',
    bottom: 0,
    zIndex: -1,
  },
});