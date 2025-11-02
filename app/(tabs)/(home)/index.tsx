
import React, { useState } from 'react';
import { Stack, Link } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { usePostsContext } from '@/contexts/PostsContext';
import { PostCard } from '@/components/PostCard';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function HomeScreen() {
  const theme = useTheme();
  const { posts, counts, refreshPosts, deletePost, getByStatus } = usePostsContext();
  const { toast, success, error, hide } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const draftPosts = getByStatus('DRAFT');
  const pendingPosts = getByStatus('PENDING');
  const approvedPosts = getByStatus('APPROVED');
  const rejectedPosts = getByStatus('REJECTED');

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshPosts();
    } catch (err) {
      console.log('Error refreshing:', err);
      error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      success('Post deleted');
    } catch (err) {
      console.log('Error deleting post:', err);
      error('Failed to delete post');
    }
  };

  const renderHeaderRight = () => (
    <Link href="/createPost" asChild>
      <Pressable style={styles.headerButtonContainer}>
        <IconSymbol name="plus" color={colors.primary} size={24} />
      </Pressable>
    </Link>
  );

  const renderSection = (title: string, data: any[], emptyMessage: string, status: string) => (
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
              onDelete={() => handleDeletePost(post.id)}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
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
            'No draft posts yet. Create one to get started!',
            'DRAFT'
          )}

          {renderSection(
            'Pending Approval',
            pendingPosts,
            'No posts awaiting approval',
            'PENDING'
          )}

          {renderSection(
            'Approved Posts',
            approvedPosts,
            'No approved posts yet',
            'APPROVED'
          )}

          {renderSection(
            'Rejected Posts',
            rejectedPosts,
            'No rejected posts',
            'REJECTED'
          )}
        </ScrollView>
      </View>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hide}
      />
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
