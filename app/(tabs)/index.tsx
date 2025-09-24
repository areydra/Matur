import { useHome } from '@/hooks/screens/useHome';
import Avatar from '@/src/components/Avatar';
import ChatListItem from '@/src/components/ChatListItem';
import SearchInput from '@/src/components/SearchInput';
import { ChatSummary } from '@/src/types';
import { colors, fonts, spacing, typography } from '@/src/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const {
    userProfile,
    filteredChats,
    searchQuery,
    isSearchMode,
    isLoading,
    handleSearch,
    toggleSearchMode,
    handleChatPress,
    handleProfilePress,
  } = useHome();

  const renderChatItem = ({ item }: { item: ChatSummary }) => (
    <ChatListItem
      chat={item}
      onPress={handleChatPress}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>
        {searchQuery 
          ? `No chats found for "${searchQuery}"`
          : 'No chats yet. Start a conversation!'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {isSearchMode ? (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search chats..."
                />
              </View>
              <TouchableOpacity
                style={styles.closeSearchButton}
                onPress={toggleSearchMode}
              >
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.userSection}
                onPress={handleProfilePress}
                activeOpacity={0.7}
              >
                <Avatar
                  uri={userProfile?.avatar_url}
                  name={userProfile?.name ??''}
                  size="medium"
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {userProfile?.name}
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.searchButton}
                onPress={toggleSearchMode}
              >
                <Ionicons name="search" size={24} color={colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    {(isLoading || !userProfile) ? (
      <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaView>
    ) : (
      <FlatList
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purpleSoft,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    ...typography.subtitle,
    fontSize: 18,
    lineHeight: 24,
    color: colors.white,
  },
  searchButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchInputContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  closeSearchButton: {
    padding: spacing.sm,
  },
  chatList: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  chatListContent: {
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.purpleSoft,
    marginHorizontal: spacing.lg,
    opacity: 0.3,
  },
});