
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { usePostsStore } from '@/hooks/usePostsStore';
import { Post } from '@/types/post';
import { IconSymbol } from '@/components/IconSymbol';

export default function ApprovalRequestsScreen() {
  const theme = useTheme();
  const { posts, approvePost, rejectPost } = usePostsStore();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [feedback, setFeedback] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  // Get posts that need approval (pending status)
  const pendingPosts = posts.filter(post => post.status === 'pending');

  const handleApprove = () => {
    if (selectedPost) {
      approvePost(selectedPost.id, 'current-user', feedback);
      setSelectedPost(null);
      setFeedback('');
      setAction(null);
    }
  };

  const handleReject = () => {
    if (selectedPost) {
      rejectPost(selectedPost.id, 'current-user', feedback);
      setSelectedPost(null);
      setFeedback('');
      setAction(null);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <Pressable
      onPress={() => setSelectedPost(item)}
      style={styles.postCard}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>
          {item.requestedApprovals[0]?.name || 'Unknown'}
        </Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Approval Requests',
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
          <FlatList
            data={pendingPosts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={selectedPost !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSelectedPost(null);
          setFeedback('');
          setAction(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Post</Text>
              <Pressable
                onPress={() => {
                  setSelectedPost(null);
                  setFeedback('');
                  setAction(null);
                }}
              >
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedPost && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>From</Text>
                    <Text style={styles.sectionValue}>
                      {selectedPost.requestedApprovals[0]?.name || 'Unknown'}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Post Content</Text>
                    <View style={styles.contentBox}>
                      <Text style={styles.contentText}>
                        {selectedPost.content}
                      </Text>
                    </View>
                  </View>

                  {action && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>
                        {action === 'approve' ? 'Approval' : 'Rejection'} Feedback (Optional)
                      </Text>
                      <TextInput
                        style={[styles.feedbackInput, { color: colors.text }]}
                        placeholder="Add your feedback..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        value={feedback}
                        onChangeText={setFeedback}
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              {!action ? (
                <>
                  <Pressable
                    onPress={() => setAction('reject')}
                    style={[styles.actionButton, styles.rejectButton]}
                  >
                    <IconSymbol name="xmark.circle" color={colors.card} size={20} />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setAction('approve')}
                    style={[styles.actionButton, styles.approveButton]}
                  >
                    <IconSymbol name="checkmark.circle" color={colors.card} size={20} />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      setAction(null);
                      setFeedback('');
                    }}
                    style={[styles.actionButton, styles.cancelButton]}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={action === 'approve' ? handleApprove : handleReject}
                    style={[
                      styles.actionButton,
                      action === 'approve' ? styles.confirmApproveButton : styles.confirmRejectButton,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>
                      {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 16,
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
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalSection: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  contentBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  contentText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  feedbackInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.background,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  approveButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  rejectButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmApproveButton: {
    backgroundColor: '#4CAF50',
  },
  confirmRejectButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
});
