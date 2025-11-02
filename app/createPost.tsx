
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  Platform,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/styles/commonStyles';
import { usePostsContext } from '@/contexts/PostsContext';
import { useContactsStore } from '@/hooks/useContactsStore';
import { Contact } from '@/types/post';
import { IconSymbol } from '@/components/IconSymbol';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function CreatePostScreen() {
  const theme = useTheme();
  const { createDraft, submitForApproval } = usePostsContext();
  const { contacts } = useContactsStore();
  const { toast, success, error, hide } = useToast();

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [videoUris, setVideoUris] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const platforms = ['instagram', 'facebook', 'tiktok', 'x', 'linkedin'];

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultiple: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newUris = result.assets.map(asset => asset.uri);
        setImageUris([...imageUris, ...newUris]);
      }
    } catch (err) {
      console.log('Error picking image:', err);
      error('Failed to pick image');
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultiple: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newUris = result.assets.map(asset => asset.uri);
        setVideoUris([...videoUris, ...newUris]);
      }
    } catch (err) {
      console.log('Error picking video:', err);
      error('Failed to pick video');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideoUris(videoUris.filter((_, i) => i !== index));
  };

  const handleTogglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !caption.trim() && imageUris.length === 0 && videoUris.length === 0) {
      error('Please add title, caption, or media to your post');
      return;
    }

    try {
      setIsLoading(true);
      const mediaUris = [...imageUris, ...videoUris];
      await createDraft(title, caption, mediaUris, selectedPlatforms);
      success('Post saved as draft!');
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (err) {
      console.log('Error saving draft:', err);
      error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!title.trim() && !caption.trim() && imageUris.length === 0 && videoUris.length === 0) {
      error('Please add title, caption, or media to your post');
      return;
    }

    try {
      setIsLoading(true);
      const mediaUris = [...imageUris, ...videoUris];
      const post = await createDraft(title, caption, mediaUris, selectedPlatforms);
      await submitForApproval(post.id);
      success('Post submitted for approval!');
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (err) {
      console.log('Error submitting for approval:', err);
      error('Failed to submit for approval');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Post',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <IconSymbol name="chevron.left" color={colors.primary} size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.label}>Post Title</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter post title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              editable={!isLoading}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              value={caption}
              onChangeText={setCaption}
              textAlignVertical="top"
              editable={!isLoading}
            />
            <Text style={styles.charCount}>
              {caption.length} characters
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Platforms</Text>
            <View style={styles.platformsContainer}>
              {platforms.map(platform => (
                <Pressable
                  key={platform}
                  onPress={() => handleTogglePlatform(platform)}
                  disabled={isLoading}
                  style={[
                    styles.platformBadge,
                    selectedPlatforms.includes(platform) && styles.platformBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.platformText,
                      selectedPlatforms.includes(platform) && styles.platformTextSelected,
                    ]}
                  >
                    {platform}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Media</Text>
            <View style={styles.mediaButtonContainer}>
              <Pressable
                onPress={handlePickImage}
                disabled={isLoading}
                style={[styles.mediaButton, styles.imageButton, isLoading && styles.buttonDisabled]}
              >
                <IconSymbol name="photo" color={colors.card} size={20} />
                <Text style={styles.mediaButtonText}>Add Images</Text>
              </Pressable>
              <Pressable
                onPress={handlePickVideo}
                disabled={isLoading}
                style={[styles.mediaButton, styles.videoButton, isLoading && styles.buttonDisabled]}
              >
                <IconSymbol name="play.circle" color={colors.card} size={20} />
                <Text style={styles.mediaButtonText}>Add Videos</Text>
              </Pressable>
            </View>

            {imageUris.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.mediaTitle}>Images ({imageUris.length})</Text>
                <FlatList
                  data={imageUris}
                  renderItem={({ item, index }) => (
                    <View style={styles.mediaItem}>
                      <Image
                        source={{ uri: item }}
                        style={styles.mediaThumbnail}
                      />
                      <Pressable
                        onPress={() => handleRemoveImage(index)}
                        disabled={isLoading}
                        style={styles.removeButton}
                      >
                        <IconSymbol name="xmark.circle.fill" color={colors.accent} size={24} />
                      </Pressable>
                    </View>
                  )}
                  keyExtractor={(_, index) => `image-${index}`}
                  scrollEnabled={false}
                  numColumns={3}
                  columnWrapperStyle={styles.mediaGrid}
                />
              </View>
            )}

            {videoUris.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.mediaTitle}>Videos ({videoUris.length})</Text>
                <FlatList
                  data={videoUris}
                  renderItem={({ item, index }) => (
                    <View style={styles.mediaItem}>
                      <View style={styles.videoPlaceholder}>
                        <IconSymbol name="play.circle.fill" color={colors.primary} size={32} />
                      </View>
                      <Pressable
                        onPress={() => handleRemoveVideo(index)}
                        disabled={isLoading}
                        style={styles.removeButton}
                      >
                        <IconSymbol name="xmark.circle.fill" color={colors.accent} size={24} />
                      </Pressable>
                    </View>
                  )}
                  keyExtractor={(_, index) => `video-${index}`}
                  scrollEnabled={false}
                  numColumns={3}
                  columnWrapperStyle={styles.mediaGrid}
                />
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleSaveDraft}
              disabled={isLoading}
              style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmitForApproval}
              disabled={isLoading}
              style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Submitting...' : 'Submit for Approval'}
              </Text>
            </Pressable>
          </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.background,
    minHeight: 44,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  platformBadgeSelected: {
    backgroundColor: colors.primary,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  platformTextSelected: {
    color: colors.card,
  },
  mediaButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  imageButton: {
    backgroundColor: colors.primary,
  },
  videoButton: {
    backgroundColor: colors.highlight,
  },
  mediaButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  mediaGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mediaItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  headerButton: {
    padding: 8,
  },
});
