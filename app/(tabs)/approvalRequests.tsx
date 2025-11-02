
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
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors } from '@/styles/commonStyles';
import { usePostsContext } from '@/contexts/PostsContext';
import { Post } from '@/types/post';
import { IconSymbol } from '@/components/IconSymbol';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function ApprovalRequestsTabScreen() {
  const theme = useTheme();
  const { getByStatus, approve, reject, refreshPosts } = usePostsContext();
  const { toast, success, error, hide } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pendingPosts = getByStatus('PENDING');

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

  const handleApprove = async (postId: string) => {
    try {
      setIsLoading(true);
      await approve(postId);
      success('Post approved!');
    } catch (err) {
      console.log('Error approving post:', err);
      error('Failed to approve post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPress = (postId: string) => {
    setSelectedPostId(postId);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPostId) return;

    try {
      setIsLoading(true);
      await reject(selectedPostId, rejectionReason || undefined);
      success('Post rejected!');
      setRejectModalVisible(false);
      setSelectedPostId(null);
      setRejectionReason('');
    } catch (err) {
      console.log('Error rejecting post:', err);
      error('Failed to reject post');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.postTime}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>

      {item.caption && (
        <Text style={styles.postCaption} numberOfLines={2}>
          {item.caption}
        </Text>
      )}

      {item.platforms.length > 0 && (
        <View style={styles.platformsRow}>
          {item.platforms.map(platform => (
            <View key={platform} style={styles.platformTag}>
              <Text style={styles.platformTagText}>{platform}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => handleRejectPress(item.id)}
          disabled={isLoading}
          style={[styles.actionBtn, styles.rejectBtn, isLoading && styles.buttonDisabled]}
        >
          <IconSymbol name="xmark" color={colors.card} size={16} />
          <Text style={styles.rejectBtnText}>Reject</Text>
        </Pressable>
        <Pressable
          onPress={() => handleApprove(item.id)}
          disabled={isLoading}
          style={[styles.actionBtn, styles.approveBtn, isLoading && styles.buttonDisabled]}
        >
          <IconSymbol name="checkmark" color={colors.card} size={16} />
          <Text style={styles.approveBtnText}>Approve</Text>
        </Pressable>
      </View>
    </View>
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
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                />
              }
            />
          </>
        )}
      </View>

      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Post</Text>
            <Text style={styles.modalSubtitle}>
              Provide an optional reason for rejection
            </Text>
            <TextInput
              style={[styles.reasonInput, { color: colors.text }]}
              placeholder="Enter rejection reason (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              editable={!isLoading}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setRejectModalVisible(false)}
                disabled={isLoading}
                style={[styles.modalButton, styles.cancelButton, isLoading && styles.buttonDisabled]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleRejectConfirm}
                disabled={isLoading}
                style={[styles.modalButton, styles.confirmButton, isLoading && styles.buttonDisabled]}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Rejecting...' : 'Reject'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postInfo: {
    flex: 1,
    marginRight: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  postTime: {
    fontSize: 12,
    color: colors.textSecondary,
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
  postCaption: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  platformsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  platformTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.highlight + '20',
    borderRadius: 6,
  },
  platformTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
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
  buttonDisabled: {
    opacity: 0.6,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  reasonInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.background,
    marginBottom: 16,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
});
