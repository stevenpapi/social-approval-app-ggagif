
import { useState, useCallback, useEffect } from 'react';
import { Post, PostStatus, Contact } from '@/types/post';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POSTS_STORAGE_KEY = 'social_posts';

export const usePostsStore = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load posts from storage on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(POSTS_STORAGE_KEY);
      if (stored) {
        const parsedPosts = JSON.parse(stored).map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          requestedApprovals: post.requestedApprovals || [],
          approvals: post.approvals || {},
          imageUris: post.imageUris || [],
          videoUris: post.videoUris || [],
        }));
        setPosts(parsedPosts);
      }
    } catch (error) {
      console.log('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePosts = useCallback(async (updatedPosts: Post[]) => {
    try {
      await AsyncStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
    } catch (error) {
      console.log('Error saving posts:', error);
    }
  }, []);

  const createPost = useCallback((
    content: string,
    requestedApprovals: Contact[] = [],
    imageUris: string[] = [],
    videoUris: string[] = []
  ) => {
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      requestedApprovals,
      approvals: {},
      imageUris,
      videoUris,
    };
    const updated = [...posts, newPost];
    savePosts(updated);
    return newPost;
  }, [posts, savePosts]);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    const updated = posts.map(post =>
      post.id === id
        ? { ...post, ...updates, updatedAt: new Date() }
        : post
    );
    savePosts(updated);
  }, [posts, savePosts]);

  const deletePost = useCallback((id: string) => {
    const updated = posts.filter(post => post.id !== id);
    savePosts(updated);
  }, [posts, savePosts]);

  const submitForApproval = useCallback((id: string, contacts: Contact[]) => {
    const updated = posts.map(post => {
      if (post.id === id) {
        const approvals: Post['approvals'] = {};
        contacts.forEach(contact => {
          approvals[contact.id] = { status: 'pending' };
        });
        return {
          ...post,
          status: 'pending' as PostStatus,
          requestedApprovals: contacts,
          approvals,
          updatedAt: new Date(),
        };
      }
      return post;
    });
    savePosts(updated);
  }, [posts, savePosts]);

  const approvePost = useCallback((postId: string, contactId: string, feedback?: string) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const approvals = { ...post.approvals };
        approvals[contactId] = {
          status: 'approved',
          respondedAt: new Date(),
          feedback,
        };
        
        // Check if all approvals are done
        const allApproved = post.requestedApprovals.every(
          contact => approvals[contact.id]?.status === 'approved'
        );
        
        return {
          ...post,
          approvals,
          status: allApproved ? ('approved' as PostStatus) : post.status,
          updatedAt: new Date(),
        };
      }
      return post;
    });
    savePosts(updated);
  }, [posts, savePosts]);

  const rejectPost = useCallback((postId: string, contactId: string, feedback?: string) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const approvals = { ...post.approvals };
        approvals[contactId] = {
          status: 'rejected',
          respondedAt: new Date(),
          feedback,
        };
        return {
          ...post,
          approvals,
          status: 'rejected' as PostStatus,
          updatedAt: new Date(),
        };
      }
      return post;
    });
    savePosts(updated);
  }, [posts, savePosts]);

  const getPostsByStatus = useCallback((status: PostStatus) => {
    return posts.filter(post => post.status === status);
  }, [posts]);

  const getPostsAwaitingMyApproval = useCallback((myContactId: string) => {
    return posts.filter(post =>
      post.status === 'pending' &&
      post.requestedApprovals.some(c => c.id === myContactId) &&
      post.approvals[myContactId]?.status === 'pending'
    );
  }, [posts]);

  return {
    posts,
    isLoading,
    createPost,
    updatePost,
    deletePost,
    submitForApproval,
    approvePost,
    rejectPost,
    getPostsByStatus,
    getPostsAwaitingMyApproval,
  };
};
