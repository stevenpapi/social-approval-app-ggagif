
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
import { usePostsStore } from '@/hooks/usePostsStore';
import { useContactsStore } from '@/hooks/useContactsStore';
import { Contact } from '@/types/post';
import { IconSymbol } from '@/components/IconSymbol';

export default function CreatePostScreen() {
  const theme = useTheme();
  const { createPost, submitForApproval } = usePostsStore();
  const { contacts } = useContactsStore();
  const [content, setContent] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showContactList, setShowContactList] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [videoUris, setVideoUris] = useState<string[]>([]);

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
    } catch (error) {
      console.log('Error picking image:', error);
      alert('Failed to pick image');
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
    } catch (error) {
      console.log('Error picking video:', error);
      alert('Failed to pick video');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideoUris(videoUris.filter((_, i) => i !== index));
  };

  const handleToggleContact = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleSaveDraft = () => {
    if (!content.trim() && imageUris.length === 0 && videoUris.length === 0) {
      alert('Please add content, images, or videos to your post');
      return;
    }
    createPost(content, [], imageUris, videoUris);
    alert('Post saved as draft!');
    router.back();
  };

  const handleSubmitForApproval = () => {
    if (!content.trim() && imageUris.length === 0 && videoUris.length === 0) {
      alert('Please add content, images, or videos to your post');
      return;
    }
    if (selectedContacts.length === 0) {
      alert('Please select at least one contact to request approval from');
      return;
    }
    const post = createPost(content, selectedContacts, imageUris, videoUris);
    submitForApproval(post.id, selectedContacts);
    alert('Post submitted for approval!');
    router.back();
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id);
    return (
      <Pressable
        onPress={() => handleToggleContact(item)}
        style={[
          styles.contactItem,
          isSelected && styles.contactItemSelected,
        ]}
      >
        <View style={styles.contactCheckbox}>
          {isSelected && (
            <IconSymbol name="checkmark" color={colors.primary} size={16} />
          )}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.email && (
            <Text style={styles.contactEmail}>{item.email}</Text>
          )}
        </View>
      </Pressable>
    );
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
            <Text style={styles.label}>Post Content</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {content.length} characters
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Media</Text>
            <View style={styles.mediaButtonContainer}>
              <Pressable
                onPress={handlePickImage}
                style={[styles.mediaButton, styles.imageButton]}
              >
                <IconSymbol name="photo" color={colors.card} size={20} />
                <Text style={styles.mediaButtonText}>Add Images</Text>
              </Pressable>
              <Pressable
                onPress={handlePickVideo}
                style={[styles.mediaButton, styles.videoButton]}
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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Request Approval From</Text>
              <Text style={styles.selectedCount}>
                {selectedContacts.length} selected
              </Text>
            </View>
            <Pressable
              onPress={() => setShowContactList(!showContactList)}
              style={styles.contactListToggle}
            >
              <Text style={styles.contactListToggleText}>
                {showContactList ? 'Hide Contacts' : 'Show Contacts'}
              </Text>
              <IconSymbol
                name={showContactList ? 'chevron.up' : 'chevron.down'}
                color={colors.primary}
                size={20}
              />
            </Pressable>

            {showContactList && (
              <FlatList
                data={contacts}
                renderItem={renderContactItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                style={styles.contactList}
              />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleSaveDraft}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Save as Draft</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmitForApproval}
              style={[styles.button, styles.primaryButton]}
            >
              <Text style={styles.primaryButtonText}>Submit for Approval</Text>
            </Pressable>
          </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 100 : 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.background,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'right',
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
  contactListToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.background,
  },
  contactListToggleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  contactList: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.background,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  contactItemSelected: {
    backgroundColor: colors.highlight + '20',
  },
  contactCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  contactEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  headerButton: {
    padding: 8,
  },
});
