import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followers: number;
    following: number;
    poems: number;
  };
}

// Hook to fetch user profile data
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/users/${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }
      
      return await response.json() as User;
    },
    enabled: !!userId
  });
};

// Hook to fetch user's poems
export const useUserPoems = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userPoems', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/user/${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user poems');
      }
      
      return await response.json();
    },
    enabled: !!userId
  });
};