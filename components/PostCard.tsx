
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Post } from '@/types/post';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onDelete?: () => void;
  showApprovalStatus?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onDelete,
  showApprovalStatus = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      case 'draft':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const approvalCount = Object.values(post.approvals).filter(
    a => a.status === 'approved'
  ).length;
  const totalApprovals = post.requestedApprovals.length;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(post.status) },
              ]}
            />
            <Text style={styles.statusText}>{getStatusLabel(post.status)}</Text>
          </View>
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.deleteButton}>
              <IconSymbol name="trash" color={colors.accent} size={18} />
            </Pressable>
          )}
        </View>

        <Text style={styles.content} numberOfLines={3}>
          {post.content}
        </Text>

        {showApprovalStatus && post.requestedApprovals.length > 0 && (
          <View style={styles.approvalInfo}>
            <Text style={styles.approvalText}>
              Approvals: {approvalCount}/{totalApprovals}
            </Text>
            <View style={styles.approvalBar}>
              <View
                style={[
                  styles.approvalProgress,
                  {
                    width: `${(approvalCount / totalApprovals) * 100}%`,
                    backgroundColor: getStatusColor(post.status),
                  },
                ]}
              />
            </View>
          </View>
        )}

        <Text style={styles.timestamp}>
          {new Date(post.createdAt).toLocaleDateString()} at{' '}
          {new Date(post.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  approvalInfo: {
    marginBottom: 12,
  },
  approvalText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  approvalBar: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  approvalProgress: {
    height: '100%',
    borderRadius: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
