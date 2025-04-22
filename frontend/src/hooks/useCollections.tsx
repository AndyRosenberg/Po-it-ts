import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Collection {
  id: string;
  userId: string;
  collectableId: string;
  collectableType: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    profilePic: string;
  };
  poem?: {
    title: string;
    user: {
      username: string;
    }
  };
}

export interface PaginatedCollectionResponse {
  collections: Collection[];
  nextCursor: string | null;
  totalCount: number;
}

// Hook for fetching user's collections with pagination and search
export const useUserCollections = (userId: string, pageSize = 10, searchQuery?: string) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['collections', userId, pageSize, searchQuery],
    queryFn: async({ pageParam = '' }) => {
      const url = new URL(`${process.env.HOST_DOMAIN}/api/users/${userId}/collections`);
      url.searchParams.append('limit', pageSize.toString());
      if (pageParam) {
        url.searchParams.append('cursor', pageParam);
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch collections');
      }

      return await response.json() as PaginatedCollectionResponse;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: '',
  });

  // Flatten the pages into a single list
  const collections = data?.pages.flatMap(page => page.collections) || [];
  const pagesCount = data?.pages.length || 0;
  const totalCount = data?.pages[0]?.totalCount || 0;

  return {
    collections,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pagesCount,
    totalCount
  };
};

// Hook to get the pins count for a poem
export const usePoemPinsCount = (poemId: string) => {
  return useQuery({
    queryKey: ['poemPinsCount', poemId],
    queryFn: async() => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/pins-count`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch poem pins count');
      }

      const data = await response.json();
      return data.count;
    },
  });
};

// Hook to check if the current user has pinned a poem
export const useIsPoemPinned = (poemId: string) => {
  return useQuery({
    queryKey: ['isPoemPinned', poemId],
    queryFn: async() => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/is-pinned`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check if poem is pinned');
      }

      return await response.json();
    },
  });
};

// Hook for pinning a poem
export const usePinPoem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(poemId: string) => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to pin poem');
      }

      return await response.json();
    },
    onSuccess: (_, poemId) => {
      queryClient.invalidateQueries({ queryKey: ['poemPinsCount', poemId] });
      queryClient.invalidateQueries({ queryKey: ['isPoemPinned', poemId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

// Hook for unpinning a poem
export const useUnpinPoem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({ pinId }: { pinId: string, poemId: string }) => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/pins/${pinId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unpin poem');
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['poemPinsCount', variables.poemId] });
      queryClient.invalidateQueries({ queryKey: ['isPoemPinned', variables.poemId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};