
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList } from 'react-native';
import { Post } from '@/types/post';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#4CAF50';
      case 'REJECTED':
        return '#F44336';
      case 'PENDING':
        return '#FF9800';
      case 'DRAFT':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title} numberOfLines={1}>
              {post.title}
            </Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(post.status) },
                ]}
              />
              <Text style={styles.statusText}>{getStatusLabel(post.status)}</Text>
            </View>
          </View>
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.deleteButton}>
              <IconSymbol name="trash" color={colors.accent} size={18} />
            </Pressable>
          )}
        </View>

        {post.caption && (
          <Text style={styles.caption} numberOfLines={3}>
            {post.caption}
          </Text>
        )}

        {post.platforms.length > 0 && (
          <View style={styles.platformsRow}>
            {post.platforms.map(platform => (
              <View key={platform} style={styles.platformTag}>
                <Text style={styles.platformTagText}>{platform}</Text>
              </View>
            ))}
          </View>
        )}

        {post.mediaUris && post.mediaUris.length > 0 && (
          <View style={styles.mediaContainer}>
            <FlatList
              data={post.mediaUris}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.mediaThumbnail}
                />
              )}
              keyExtractor={(_, index) => `media-${index}`}
              scrollEnabled={false}
              numColumns={3}
              columnWrapperStyle={styles.mediaGrid}
            />
          </View>
        )}

        {post.rejectionReason && (
          <View style={styles.rejectionReasonBox}>
            <IconSymbol name="exclamationmark.circle" color={colors.accent} size={16} />
            <Text style={styles.rejectionReasonLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionReason}>{post.rejectionReason}</Text>
          </View>
        )}

        {post.audit && post.audit.length > 0 && (
          <View style={styles.auditSection}>
            <Text style={styles.auditTitle}>Activity</Text>
            {post.audit.slice(-2).map((entry, index) => (
              <View key={index} style={styles.auditEntry}>
                <Text style={styles.auditAction}>{entry.action}</Text>
                <Text style={styles.auditTime}>
                  {new Date(entry.at).toLocaleDateString()} at{' '}
                  {new Date(entry.at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.timestamp}>
          Created: {new Date(post.createdAt).toLocaleDateString()} at{' '}
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 20,
    alignSelf: 'flex-start',
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
  caption: {
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
  mediaContainer: {
    marginBottom: 12,
  },
  mediaGrid: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mediaThumbnail: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  rejectionReasonBox: {
    backgroundColor: colors.accent + '15',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 4,
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  auditSection: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  auditTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  auditEntry: {
    marginBottom: 6,
  },
  auditAction: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  auditTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
