import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

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
    queryFn: async() => {
      if (!userId) return null;

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/users/${userId}`) as User;
    },
    enabled: !!userId
  });
};

// Hook to fetch user's poems with pagination, infinite scroll, and search
export const useUserPoems = (userId: string | undefined, pageSize = 10, searchQuery?: string, draftsOnly = false) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['userPoems', userId, pageSize, searchQuery, draftsOnly],
    queryFn: async({ pageParam = '' }) => {
      if (!userId) return { poems: [], nextCursor: null, totalCount: 0 };

      const url = new URL(`${process.env.HOST_DOMAIN}/api/poems/user/${userId}`);
      url.searchParams.append('limit', pageSize.toString());
      url.searchParams.append('draftsOnly', draftsOnly.toString());
      if (pageParam) {
        url.searchParams.append('cursor', pageParam);
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }

      // Fetch poems using constructed URL

      return await apiRequest(url.toString());
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: '',
    enabled: !!userId
  });

  // Flatten the pages into a single list of poems
  const poems = data?.pages.flatMap(page => page.poems) || [];

  // Count the number of pages that have been loaded
  const pagesCount = data?.pages.length || 0;

  return {
    poems,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pagesCount
  };
};