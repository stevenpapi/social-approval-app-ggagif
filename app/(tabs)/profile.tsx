
import { IconSymbol } from '@/components/IconSymbol';
import { usePostsContext } from '@/contexts/PostsContext';
import React, { useState } from 'react';
import { useTheme } from '@react-navigation/native';
import { useContactsStore } from '@/hooks/useContactsStore';
import { GlassView } from 'expo-glass-effect';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export default function ProfileScreen() {
  const theme = useTheme();
  const { resetDatabase, counts } = usePostsContext();
  const { contacts } = useContactsStore();
  const { toast, success, error, hide } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Database',
      'This will delete all posts and restore seed data. Are you sure?',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel pressed'), style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              setIsResetting(true);
              await resetDatabase();
              success('Database reset successfully!');
            } catch (err) {
              console.log('Error resetting database:', err);
              error('Failed to reset database');
            } finally {
              setIsResetting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== 'ios' && styles.listContainerWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {Platform.OS !== 'ios' && (
            <View style={styles.androidHeader}>
              <Text style={styles.androidHeaderTitle}>Profile</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.DRAFT}</Text>
                <Text style={styles.statLabel}>Drafts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.PENDING}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.APPROVED}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.REJECTED}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacts ({contacts.length})</Text>
            {contacts.length === 0 ? (
              <Text style={styles.emptyText}>No contacts added yet</Text>
            ) : (
              <View>
                {contacts.map(contact => (
                  <View key={contact.id} style={styles.contactItem}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>
                        {contact.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      {contact.email && (
                        <Text style={styles.contactEmail}>{contact.email}</Text>
                      )}
                      {contact.phoneNumber && (
                        <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Database</Text>
            <Pressable
              onPress={handleResetDatabase}
              disabled={isResetting}
              style={[styles.resetButton, isResetting && styles.buttonDisabled]}
            >
              <IconSymbol name="arrow.clockwise" color={colors.card} size={18} />
              <Text style={styles.resetButtonText}>
                {isResetting ? 'Resetting...' : 'Reset Database'}
              </Text>
            </Pressable>
            <Text style={styles.resetDescription}>
              This will delete all posts and restore seed data for testing.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
            </View>
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
  listContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  listContainerWithTabBar: {
    paddingBottom: 100,
  },
  androidHeader: {
    marginBottom: 24,
  },
  androidHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
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
  contactPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  resetButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  resetDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
