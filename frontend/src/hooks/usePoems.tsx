import { useInfiniteQuery } from '@tanstack/react-query';

interface Stanza {
  id: string;
  body: string;
  poemId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  profilePic: string;
}

export interface StanzaMatch {
  id: string;
  position: number;
  snippet: string;
  matchIndex: number;
}

export interface SearchMatches {
  titleMatch?: boolean;
  usernameMatch?: boolean;
  matchingStanzas: StanzaMatch[];
}

export interface Poem {
  isDraft: boolean;
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  stanzas: Stanza[];
  user?: User;
  isOwner?: boolean;
  searchMatches?: SearchMatches;
}

export interface PaginatedResponse {
  poems: Poem[];
  nextCursor: string | null;
  totalCount: number;
}

// Hook for fetching user's own poems with pagination, infinite scroll, and search
export const useMyPoems = (pageSize = 10, searchQuery?: string) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['my-poems', pageSize, searchQuery],
    queryFn: async({ pageParam = '' }) => {
      const url = new URL(`${process.env.HOST_DOMAIN}/api/my-poems`);
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
        throw new Error(errorData.error || 'Failed to fetch poems');
      }

      return await response.json() as PaginatedResponse;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: '',
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

// Hook for fetching feed poems (from followed users) with pagination, infinite scroll, and search
export const useFeedPoems = (pageSize = 10, searchQuery?: string) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['feed', pageSize, searchQuery],
    queryFn: async({ pageParam = '' }) => {
      const url = new URL(`${process.env.HOST_DOMAIN}/api/feed`);
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
        throw new Error(errorData.error || 'Failed to fetch poems');
      }

      return await response.json() as PaginatedResponse;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: '',
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

// Hook for fetching all public poems with pagination, infinite scroll, and search
export const usePublicPoems = (pageSize = 10, searchQuery?: string) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['public-poems', pageSize, searchQuery],
    queryFn: async({ pageParam = '' }) => {
      const url = new URL(`${process.env.HOST_DOMAIN}/api/poems`);
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
        throw new Error(errorData.error || 'Failed to fetch poems');
      }

      return await response.json() as PaginatedResponse;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor || undefined;
    },
    initialPageParam: '',
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