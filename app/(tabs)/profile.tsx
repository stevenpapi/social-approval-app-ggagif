
import { IconSymbol } from '@/components/IconSymbol';
import React from 'react';
import { GlassView } from 'expo-glass-effect';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { usePostsStore } from '@/hooks/usePostsStore';
import { useContactsStore } from '@/hooks/useContactsStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const { posts } = usePostsStore();
  const { contacts } = useContactsStore();

  const stats = {
    totalPosts: posts.length,
    draftPosts: posts.filter(p => p.status === 'draft').length,
    approvedPosts: posts.filter(p => p.status === 'approved').length,
    pendingPosts: posts.filter(p => p.status === 'pending').length,
    contacts: contacts.length,
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            Platform.OS !== 'ios' && styles.contentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          {Platform.OS !== 'ios' && (
            <Text style={styles.pageTitle}>Profile</Text>
          )}

          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" color={colors.card} size={40} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>You</Text>
              <Text style={styles.userEmail}>social.approval@app.com</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Activity</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalPosts}</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.draftPosts}</Text>
                <Text style={styles.statLabel}>Drafts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.approvedPosts}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.pendingPosts}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Contacts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contacts</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.contacts}</Text>
              </View>
            </View>
            <View style={styles.contactsList}>
              {contacts.map((contact, index) => (
                <View
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    index !== contacts.length - 1 && styles.contactItemBorder,
                  ]}
                >
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
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                Social Post Approval v1.0
              </Text>
              <Text style={styles.aboutSubtext}>
                Request approval from your contacts before publishing social media posts
              </Text>
            </View>
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contentWithTabBar: {
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
  sectionTitle: {
    fontSize: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  contactsList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  contactItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: colors.card,
    fontSize: 14,
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
  aboutCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  aboutSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
});
