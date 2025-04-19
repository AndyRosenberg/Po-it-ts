import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

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
    queryFn: async ({ pageParam = '' }) => {
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
      
      // Debug output to help understand API requests
      console.log('Fetching poems with URL:', url.toString());
      console.log('draftsOnly parameter:', draftsOnly);

      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user poems');
      }
      
      return await response.json();
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