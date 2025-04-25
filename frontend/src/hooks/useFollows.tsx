import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

export interface User {
  id: string;
  username: string;
  profilePic: string;
}

// Get followers of a user
export const useFollowers = (userId?: string) => {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async() => {
      if (!userId) return [];

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/follows/followers/${userId}`) as User[];
    },
    enabled: !!userId
  });
};

// Get users that a user is following
export const useFollowing = (userId?: string) => {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async() => {
      if (!userId) return [];

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/follows/following/${userId}`) as User[];
    },
    enabled: !!userId
  });
};

// Check if current user is following another user
export const useCheckFollowing = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['checkFollowing', userId],
    queryFn: async() => {
      if (!userId) return false;

      const data = await apiRequest(`${process.env.HOST_DOMAIN}/api/follows/check/${userId}`);
      return data.isFollowing;
    },
    enabled: !!userId
  });
};

// Hook for follow/unfollow mutations
export const useFollowActions = () => {
  const queryClient = useQueryClient();

  // Follow a user
  const followMutation = useMutation({
    mutationFn: async(userId: string) => {
      return await apiRequest(`${process.env.HOST_DOMAIN}/api/follows/${userId}`, {
        method: 'POST',
      });
    },
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['checkFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    }
  });

  // Unfollow a user
  const unfollowMutation = useMutation({
    mutationFn: async(userId: string) => {
      return await apiRequest(`${process.env.HOST_DOMAIN}/api/follows/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['checkFollowing', userId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    }
  });

  return {
    followUser: followMutation.mutate,
    unfollowUser: unfollowMutation.mutate,
    isFollowLoading: followMutation.isPending,
    isUnfollowLoading: unfollowMutation.isPending,
    followError: followMutation.error,
    unfollowError: unfollowMutation.error
  };
};