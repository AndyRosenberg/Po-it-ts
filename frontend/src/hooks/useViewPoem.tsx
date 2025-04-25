import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { Poem } from './usePoems';

interface ExtendedPoem extends Poem {
  isOwner?: boolean;
  user?: {
    id: string;
    username: string;
    profilePic: string;
  };
}

export const useViewPoem = (poemId: string | undefined) => {
  const {
    data: poem,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['poem', poemId],
    queryFn: async() => {
      if (!poemId) {
        throw new Error('Poem ID is required');
      }

      try {
        return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
          method: 'GET',
        }) as ExtendedPoem;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch poem');
      }
    },
    enabled: !!poemId,
  });

  return {
    poem,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'An unknown error occurred') : null,
    refetch
  };
};