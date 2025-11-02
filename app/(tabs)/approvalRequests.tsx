
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { usePostsStore } from '@/hooks/usePostsStore';
import { Post } from '@/types/post';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';

export default function ApprovalRequestsTabScreen() {
  const theme = useTheme();
  const { posts, approvePost, rejectPost } = usePostsStore();

  // Get posts that need approval (pending status)
  const pendingPosts = posts.filter(post => post.status === 'pending');

  const handleQuickApprove = (postId: string) => {
    approvePost(postId, 'current-user');
  };

  const handleQuickReject = (postId: string) => {
    rejectPost(postId, 'current-user');
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <Pressable
      onPress={() => router.push(`/approvalRequests?postId=${item.id}`)}
      style={styles.postCard}
    >
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.requestedApprovals[0]?.name.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.postAuthor}>
              {item.requestedApprovals[0]?.name || 'Unknown'}
            </Text>
            <Text style={styles.postTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
      <Text style={styles.postContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => handleQuickReject(item.id)}
          style={[styles.actionBtn, styles.rejectBtn]}
        >
          <IconSymbol name="xmark" color={colors.card} size={16} />
          <Text style={styles.rejectBtnText}>Reject</Text>
        </Pressable>
        <Pressable
          onPress={() => handleQuickApprove(item.id)}
          style={[styles.actionBtn, styles.approveBtn]}
        >
          <IconSymbol name="checkmark" color={colors.card} size={16} />
          <Text style={styles.approveBtnText}>Approve</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Approval Requests',
          headerShown: Platform.OS === 'ios',
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {pendingPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="checkmark.circle" color={colors.primary} size={48} />
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>
              No posts awaiting your approval
            </Text>
          </View>
        ) : (
          <>
            {Platform.OS !== 'ios' && (
              <View style={styles.androidHeader}>
                <Text style={styles.androidHeaderTitle}>Approval Requests</Text>
              </View>
            )}
            <FlatList
              data={pendingPosts}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              contentContainerStyle={[
                styles.listContent,
                Platform.OS !== 'ios' && styles.listContentWithTabBar,
              ]}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  androidHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  androidHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  listContentWithTabBar: {
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  postTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  postContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
  },
  approveBtnText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#F44336',
  },
  rejectBtnText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
