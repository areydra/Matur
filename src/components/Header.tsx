import { colors, spacing } from '@/src/utils/theme';
import { Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ onPress } : { onPress?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (onPress) {
            onPress();
          } else {
            router.back()
          }
        }}
      >
        <Entypo name="chevron-left" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingBottom: spacing.sm,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});