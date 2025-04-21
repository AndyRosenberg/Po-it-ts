import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isCreateOrEditPage } from '../components/BackButton';
import { useNavigation } from '../contexts/NavigationContext';

export const useDeletePoem = () => {
  const navigate = useNavigate();
  const { previousPath } = useNavigation();
  const queryClient = useQueryClient();

  const { mutate: deletePoem, isPending: isLoading, error } = useMutation({
    mutationFn: async(poemId: string) => {
      if (!poemId) throw new Error('Poem ID is required');

      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete poem');
      }

      return true;
    },
    onSuccess: () => {
      toast.success('Poem deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });

      const preventBackToCreate = sessionStorage.getItem('preventBackToCreate') === 'true';
      if (preventBackToCreate && location.pathname.includes('/poems/') && !location.pathname.includes('/edit')) {
        sessionStorage.removeItem('preventBackToCreate');

        navigate('/');
        return;
      }

      if (isCreateOrEditPage(previousPath)) {
        navigate('/');
        return;
      }

      if (previousPath === location.pathname) {
        navigate('/');
      }

      navigate(previousPath);
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