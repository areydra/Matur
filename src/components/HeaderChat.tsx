import { colors, spacing, typography } from '@/src/utils/theme';
import { Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';

export default function HeaderChat({ name, profile, onPress } : { name: string; profile: string; onPress?: () => void; }) { 
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
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
      <Avatar
        uri={profile}
        name={name}
        size="small"
        showOnlineStatus
      />
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  backButton: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.caption,
    color: colors.white,
    marginLeft: spacing.sm,
  }
});