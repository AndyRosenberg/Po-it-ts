import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeletePoem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deletePoem, isPending: isLoading, error } = useMutation({
    mutationFn: async (poemId: string) => {
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
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      // Invalidate feed to update the home page
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      // Also invalidate userPoems query to update the profile page
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      navigate(-1);
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