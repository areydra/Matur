import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../utils/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.semibold,
    textAlign: 'center',
  },
});