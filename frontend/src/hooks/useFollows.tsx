import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

      const response = await fetch(`${process.env.HOST_DOMAIN}/api/follows/followers/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch followers');
      }

      return await response.json() as User[];
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

      const response = await fetch(`${process.env.HOST_DOMAIN}/api/follows/following/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch following');
      }

      return await response.json() as User[];
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

      const response = await fetch(`${process.env.HOST_DOMAIN}/api/follows/check/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check following status');
      }

      const data = await response.json();
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
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/follows/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to follow user');
      }

      return await response.json();
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
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/follows/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unfollow user');
      }

      return await response.json();
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