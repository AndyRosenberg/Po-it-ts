import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isCreateOrEditPage } from '../components/BackButton';
import { useNavigation } from '../contexts/NavigationContext';
import { apiRequest } from '../utils/api';

export const useDeletePoem = () => {
  const navigate = useNavigate();
  const { pathHistory } = useNavigation();
  const queryClient = useQueryClient();

  const { mutate: deletePoem, isPending: isLoading, error } = useMutation({
    mutationFn: async(poemId: string) => {
      if (!poemId) throw new Error('Poem ID is required');

      await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
        method: 'DELETE',
      });

      return true;
    },
    onSuccess: () => {
      toast.success('Poem deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });

      // Find the most recent history entry that isn't a poem and isn't a create/edit page
      const currentPath = location.pathname;
      const validHistory = pathHistory
        .filter(path => path !== currentPath && !path.includes('/poems/') && !isCreateOrEditPage(path));

      if (validHistory.length > 0) {
        navigate(validHistory[validHistory.length - 1]);
        return;
      }

      // If no valid history, go to home
      navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete poem');
    }
  });

  return {
    isLoading,
    error: error ? (error as Error).message : null,
    deletePoem
  };
};