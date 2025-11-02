
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Post } from '@/types/post';
import { postsRepo } from '@/data/postsRepo';

interface PostsContextType {
  posts: Post[];
  counts: { [key: string]: number };
  isLoading: boolean;
  refreshPosts: () => Promise<void>;
  createDraft: (title: string, caption: string, mediaUris?: string[], platforms?: string[]) => Promise<Post>;
  submitForApproval: (postId: string) => Promise<Post>;
  approve: (postId: string) => Promise<Post>;
  reject: (postId: string, reason?: string) => Promise<Post>;
  getByStatus: (status: string) => Post[];
  deletePost: (postId: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState({ DRAFT: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refreshPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const allPosts = await postsRepo.getAll();
      const newCounts = await postsRepo.getCounts();
      setPosts(allPosts);
      setCounts(newCounts);
      console.log('Posts refreshed:', allPosts.length);
    } catch (error) {
      console.log('Error refreshing posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeRepo = async () => {
      try {
        await postsRepo.init();
        await refreshPosts();
      } catch (error) {
        console.log('Error initializing posts repo:', error);
        setIsLoading(false);
      }
    };
    initializeRepo();
  }, [refreshPosts]);

  const createDraft = useCallback(
    async (title: string, caption: string, mediaUris: string[] = [], platforms: string[] = []) => {
      try {
        const post = await postsRepo.createDraft(title, caption, mediaUris, platforms);
        await refreshPosts();
        return post;
      } catch (error) {
        console.log('Error creating draft:', error);
        throw error;
      }
    },
    [refreshPosts]
  );

  const submitForApproval = useCallback(
    async (postId: string) => {
      try {
        const post = await postsRepo.submitForApproval(postId);
        await refreshPosts();
        return post;
      } catch (error) {
        console.log('Error submitting for approval:', error);
        throw error;
      }
    },
    [refreshPosts]
  );

  const approve = useCallback(
    async (postId: string) => {
      try {
        const post = await postsRepo.approve(postId);
        await refreshPosts();
        return post;
      } catch (error) {
        console.log('Error approving post:', error);
        throw error;
      }
    },
    [refreshPosts]
  );

  const reject = useCallback(
    async (postId: string, reason?: string) => {
      try {
        const post = await postsRepo.reject(postId, reason);
        await refreshPosts();
        return post;
      } catch (error) {
        console.log('Error rejecting post:', error);
        throw error;
      }
    },
    [refreshPosts]
  );

  const getByStatus = useCallback(
    (status: string) => {
      return posts.filter(post => post.status === status);
    },
    [posts]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        await postsRepo.delete(postId);
        await refreshPosts();
      } catch (error) {
        console.log('Error deleting post:', error);
        throw error;
      }
    },
    [refreshPosts]
  );

  const resetDatabase = useCallback(async () => {
    try {
      await postsRepo.resetDatabase();
      await refreshPosts();
    } catch (error) {
      console.log('Error resetting database:', error);
      throw error;
    }
  }, [refreshPosts]);

  const value: PostsContextType = {
    posts,
    counts,
    isLoading,
    refreshPosts,
    createDraft,
    submitForApproval,
    approve,
    reject,
    getByStatus,
    deletePost,
    resetDatabase,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePostsContext must be used within PostsProvider');
  }
  return context;
};
