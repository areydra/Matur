import { useProfile } from '@/hooks/screens/useProfile';
import { useAvatar } from '@/src/hooks/useAvatar';
import { colors, spacing, typography } from '@/src/utils/theme';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen: React.FC = () => {
  const {
    userProfile,
    isLoading,
    handleLogout,
    formatLastSeen,
  } = useProfile();
  const { uri: avatarUri, error } = useAvatar(userProfile?.avatar_url);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Avatar Section with Gradient Background */}
        <View style={styles.avatarSection}>
          {(avatarUri && !error) && (
            <Image
                source={{ uri: avatarUri }} 
                style={{
                  width: '100%',
                  height: '100%',
                }} 
                contentFit="cover"
                transition={200}
              />
          )}
        </View>

        {/* Profile Content */}
        <View style={styles.contentContainer}>
          <View style={styles.profileContent}>
            <View style={styles.infoItem}>
              <Text style={styles.name}>{userProfile?.name}</Text>
              <Text style={styles.lastSeen}>
                {formatLastSeen(userProfile?.last_seen_at)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{userProfile?.phone_number || 'Not provided'}</Text>
              <Text style={styles.infoLabel}>
                PhoneNumber
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoValue}>{userProfile?.description || 'No description'}</Text>
              <Text style={styles.infoLabel}>
                Description
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.red} size="small" />
          ) : (
            <Text onPress={handleLogout} style={styles.logoutText}>Logout</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.md
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  avatarSection: {
    height: 300,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  profileContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  name: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 26,
    color: colors.white,
    marginTop: spacing.md,
  },
  lastSeen: {
    ...typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoItem: {
    marginBottom: spacing.lg,
  },
  infoLabel: {
    ...typography.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.subtitle,
    fontSize: 12,
    lineHeight: 16,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  logoutText: {
    ...typography.title,
    fontSize: 16,
    lineHeight: 20,
    color: colors.red,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});