
import { db } from './db';
import { Post, AuditAction } from '@/types/post';

export const postsRepo = {
  async init(): Promise<void> {
    await db.init();
  },

  async createDraft(
    title: string,
    caption: string,
    mediaUris: string[] = [],
    platforms: string[] = []
  ): Promise<Post> {
    const now = new Date().toISOString();
    const post: Post = {
      id: `post-${Date.now()}`,
      title,
      caption,
      mediaUris,
      platforms: platforms as any,
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
    };
    return db.savePost(post);
  },

  async submitForApproval(postId: string): Promise<Post> {
    const post = await db.getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.status !== 'DRAFT') {
      throw new Error('Only draft posts can be submitted');
    }

    const now = new Date().toISOString();
    post.status = 'PENDING';
    post.updatedAt = now;
    post.audit.push({
      at: now,
      actor: 'current-user',
      action: 'SUBMIT',
    });

    return db.savePost(post);
  },

  async approve(postId: string): Promise<Post> {
    const post = await db.getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.status !== 'PENDING') {
      throw new Error('Only pending posts can be approved');
    }

    const now = new Date().toISOString();
    post.status = 'APPROVED';
    post.updatedAt = now;
    post.audit.push({
      at: now,
      actor: 'current-user',
      action: 'APPROVE',
    });

    return db.savePost(post);
  },

  async reject(postId: string, reason?: string): Promise<Post> {
    const post = await db.getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.status !== 'PENDING') {
      throw new Error('Only pending posts can be rejected');
    }

    const now = new Date().toISOString();
    post.status = 'REJECTED';
    post.rejectionReason = reason;
    post.updatedAt = now;
    post.audit.push({
      at: now,
      actor: 'current-user',
      action: 'REJECT',
      note: reason,
    });

    return db.savePost(post);
  },

  async getByStatus(status: string): Promise<Post[]> {
    return db.getPostsByStatus(status);
  },

  async getCounts(): Promise<{ [key: string]: number }> {
    return db.getCounts();
  },

  async getAll(): Promise<Post[]> {
    return db.getAllPosts();
  },

  async getById(id: string): Promise<Post | null> {
    return db.getPostById(id);
  },

  async delete(id: string): Promise<void> {
    return db.deletePost(id);
  },

  async resetDatabase(): Promise<void> {
    return db.resetDatabase();
  },
};
