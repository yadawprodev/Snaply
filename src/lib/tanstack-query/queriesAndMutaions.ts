import {
  useMutation,
  useQueryClient,
  useQuery,
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  createPost,
  createUserAccount,
  unsavePost,
  getRecentPosts,
  likePost,
  savePost,
  signInAccount,
  signOutAccount,
  getPostById,
  deletePost,
  updatePost,
  getCurrentUser,
  getInfintePosts,
  searchPosts,
  getUsers,
  getUserById,
  updateUser,
  getPostsByIds,
  followUser,
} from '../appwrite/api';

import type { NewPost, NewUser, UpdatePost, UpdateUser } from '@/types';

import { QueryKeys } from './queryKeys';

// ===================== CREATE USER ACCOUNT ========================
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: NewUser) => createUserAccount(user),
  });
};

// ===================== SIGN IN ACCOUNT ========================
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

// ===================== SIGN OUT ACCOUNT ========================
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ===================== GET CURRENT USER ========================
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QueryKeys.GET_CURRENT_USER],
    queryFn: () => {
      return getCurrentUser();
    },
  });
};

// ===================== CREATE POST ========================
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: NewPost) => createPost(post),
    onSuccess: () => {
      // Update the cached posts data after creating a new post
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_RECENT_POSTS] });
    },
  });
};

// ===================== GET RECENT POSTS ========================
export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QueryKeys.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

// ===================== LIKE POST ========================
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      usersId,
    }: {
      postId: string;
      usersId: string[];
    }) => {
      return likePost(postId, usersId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_CURRENT_USER] });
    },
  });
};

// ===================== SAVE POST ========================
export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) => {
      return savePost(postId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_CURRENT_USER] });
    },
  });
};

// ===================== UNSAVE POST ========================
export const useUnsavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (savedPostId: string) => {
      return unsavePost(savedPostId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_CURRENT_USER] });
    },
  });
};

// ===================== GET POST BY ID ========================
export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QueryKeys.GET_POST_BY_ID, postId],
    queryFn: () => {
      return getPostById(postId);
    },
    // Only runs when postId actually has a value
    enabled: !!postId,
  });
};

// ================ GET MULTIPLE POSTS BY IDS ==================
export const useGetPostsByIds = (postIds: string[]) => {
  return useQuery({
    queryKey: ['posts', postIds],
    queryFn: () => getPostsByIds(postIds),
    enabled: postIds.length > 0,
  });
};

// ===================== UPDATE POST ========================
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: UpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

// ================= DELETE POST ==============================
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_RECENT_POSTS] });
    },
  });
};

// ===================== GET INFINITE POSTS ========================
export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QueryKeys.GET_INFINITE_POSTS],
    queryFn: getInfintePosts,
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.documents.length === 0) return null;

      const lastId = lastPage?.documents[lastPage.documents.length - 1].$id;

      return lastId;
    },
  });
};

// ===================== SEARCH POSTS ========================
export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QueryKeys.SEARCH_POSTS, searchTerm],
    queryFn: () => {
      return searchPosts(searchTerm);
    },
    enabled: !!searchTerm, // Only runs when searchTerm actually has a value
  });
};

// ===================== GET USERS ========================
export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QueryKeys.GET_USERS, limit],
    queryFn: () => {
      return getUsers(limit);
    },
  });
};

// ===================== GET USER BY ID ========================
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QueryKeys.GET_USER_BY_ID, userId],
    queryFn: () => {
      return getUserById(userId);
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: UpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_CURRENT_USER] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

// ===================== FOLLOW USER ========================
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followedUserId,
      followedUserFollowers,
      currentUserId,
      currentUserFollowing,
    }: {
      followedUserId: string;
      followedUserFollowers: string[];
      currentUserId: string;
      currentUserFollowing: string[];
    }) =>
      followUser(
        followedUserId,
        followedUserFollowers,
        currentUserId,
        currentUserFollowing,
      ),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_USER_BY_ID, data?.updatedFollowedUser.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.GET_USER_BY_ID, data?.updatedCurrentUser.$id],
      });
    },
  });
};
