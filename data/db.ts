
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, AuditEntry, AuditAction } from '@/types/post';

const POSTS_STORAGE_KEY = 'social_posts_db';
const DB_INITIALIZED_KEY = 'social_posts_db_initialized';

export const db = {
  async init(): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(DB_INITIALIZED_KEY);
      if (!initialized) {
        console.log('Initializing database with seed data...');
        await this.seedData();
        await AsyncStorage.setItem(DB_INITIALIZED_KEY, 'true');
      }
    } catch (error) {
      console.log('Error initializing database:', error);
    }
  },

  async seedData(): Promise<void> {
    try {
      const now = new Date().toISOString();
      const seedPosts: Post[] = [
        {
          id: 'draft-1',
          title: 'Morning Coffee Vibes',
          caption: 'Starting the day with a fresh cup of coffee and good vibes ☕',
          mediaUris: [],
          platforms: ['instagram', 'facebook'],
          status: 'DRAFT',
          createdBy: 'current-user',
          createdAt: now,
          updatedAt: now,
          audit: [
            {
              at: now,
              actor: 'current-user',
              action: 'CREATE',
            },
          ],
        },
        {
          id: 'pending-1',
          title: 'New Product Launch',
          caption: 'Excited to announce our new product! Available next week 🚀',
          mediaUris: [],
          platforms: ['instagram', 'tiktok', 'linkedin'],
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          status: 'PENDING',
          createdBy: 'current-user',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          audit: [
            {
              at: new Date(Date.now() - 3600000).toISOString(),
              actor: 'current-user',
              action: 'CREATE',
            },
            {
              at: new Date(Date.now() - 1800000).toISOString(),
              actor: 'current-user',
              action: 'SUBMIT',
            },
          ],
        },
        {
          id: 'approved-1',
          title: 'Team Celebration',
          caption: 'Celebrating our amazing team and their hard work! 🎉',
          mediaUris: [],
          platforms: ['facebook', 'linkedin'],
          status: 'APPROVED',
          createdBy: 'current-user',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          audit: [
            {
              at: new Date(Date.now() - 86400000).toISOString(),
              actor: 'current-user',
              action: 'CREATE',
            },
            {
              at: new Date(Date.now() - 72000000).toISOString(),
              actor: 'current-user',
              action: 'SUBMIT',
            },
            {
              at: new Date(Date.now() - 43200000).toISOString(),
              actor: 'approver-user',
              action: 'APPROVE',
            },
          ],
        },
        {
          id: 'rejected-1',
          title: 'Controversial Post',
          caption: 'This post needs revision before publishing',
          mediaUris: [],
          platforms: ['x'],
          status: 'REJECTED',
          rejectionReason: 'Please tone down the language and make it more professional',
          createdBy: 'current-user',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          audit: [
            {
              at: new Date(Date.now() - 172800000).toISOString(),
              actor: 'current-user',
              action: 'CREATE',
            },
            {
              at: new Date(Date.now() - 158400000).toISOString(),
              actor: 'current-user',
              action: 'SUBMIT',
            },
            {
              at: new Date(Date.now() - 86400000).toISOString(),
              actor: 'approver-user',
              action: 'REJECT',
              note: 'Please tone down the language and make it more professional',
            },
          ],
        },
      ];

      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(seedPosts));
    } catch (error) {
      console.log('Error seeding data:', error);
    }
  },

  async getAllPosts(): Promise<Post[]> {
    try {
      const data = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting all posts:', error);
      return [];
    }
  },

  async getPostsByStatus(status: string): Promise<Post[]> {
    try {
      const posts = await this.getAllPosts();
      return posts.filter(post => post.status === status);
    } catch (error) {
      console.log('Error getting posts by status:', error);
      return [];
    }
  },

  async getPostById(id: string): Promise<Post | null> {
    try {
      const posts = await this.getAllPosts();
      return posts.find(post => post.id === id) || null;
    } catch (error) {
      console.log('Error getting post by id:', error);
      return null;
    }
  },

  async savePost(post: Post): Promise<Post> {
    try {
      const posts = await this.getAllPosts();
      const index = posts.findIndex(p => p.id === post.id);
      if (index >= 0) {
        posts[index] = post;
      } else {
        posts.push(post);
      }
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
      return post;
    } catch (error) {
      console.log('Error saving post:', error);
      throw error;
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      const posts = await this.getAllPosts();
      const filtered = posts.filter(p => p.id !== id);
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.log('Error deleting post:', error);
      throw error;
    }
  },

  async getCounts(): Promise<{ [key: string]: number }> {
    try {
      const posts = await this.getAllPosts();
      return {
        DRAFT: posts.filter(p => p.status === 'DRAFT').length,
        PENDING: posts.filter(p => p.status === 'PENDING').length,
        APPROVED: posts.filter(p => p.status === 'APPROVED').length,
        REJECTED: posts.filter(p => p.status === 'REJECTED').length,
      };
    } catch (error) {
      console.log('Error getting counts:', error);
      return { DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    }
  },

  async resetDatabase(): Promise<void> {
    try {
      await AsyncStorage.removeItem(POSTS_STORAGE_KEY);
      await AsyncStorage.removeItem(DB_INITIALIZED_KEY);
      await this.init();
    } catch (error) {
      console.log('Error resetting database:', error);
      throw error;
    }
  },
};
