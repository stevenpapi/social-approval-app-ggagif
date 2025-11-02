
import React from 'react';
import { Stack, Link } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { usePostsStore } from '@/hooks/usePostsStore';
import { PostCard } from '@/components/PostCard';

export default function HomeScreen() {
  const theme = useTheme();
  const { posts, deletePost, getPostsByStatus } = usePostsStore();

  const draftPosts = getPostsByStatus('draft');
  const pendingPosts = getPostsByStatus('pending');
  const approvedPosts = getPostsByStatus('approved');

  const renderHeaderRight = () => (
    <Link href="/createPost" asChild>
      <Pressable style={styles.headerButtonContainer}>
        <IconSymbol name="plus" color={colors.primary} size={24} />
      </Pressable>
    </Link>
  );

  const renderSection = (title: string, data: any[], emptyMessage: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.length}</Text>
        </View>
      </View>
      {data.length === 0 ? (
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      ) : (
        <View>
          {data.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={() => deletePost(post.id)}
              showApprovalStatus={true}
            />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Social Post Approval',
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== 'ios' && styles.listContainerWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header for Android/Web */}
          {Platform.OS !== 'ios' && (
            <View style={styles.androidHeader}>
              <Text style={styles.androidHeaderTitle}>Social Post Approval</Text>
              <Link href="/createPost" asChild>
                <Pressable>
                  <IconSymbol name="plus" color={colors.primary} size={24} />
                </Pressable>
              </Link>
            </View>
          )}

          {renderSection(
            'Drafts',
            draftPosts,
            'No draft posts yet. Create one to get started!'
          )}

          {renderSection(
            'Pending Approval',
            pendingPosts,
            'No posts awaiting approval'
          )}

          {renderSection(
            'Approved Posts',
            approvedPosts,
            'No approved posts yet'
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listContainerWithTabBar: {
    paddingBottom: 100,
  },
  androidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  androidHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerButtonContainer: {
    padding: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
});
