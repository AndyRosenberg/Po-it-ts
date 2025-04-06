import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useDeleteAccount = () => {
  const [error, setError] = useState<string | null>(null);
  const { setAuthUser } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: deleteAccount, isPending: isLoading } = useMutation({
    mutationFn: async (password: string) => {
      setError(null);
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/users/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      setAuthUser(null);
      queryClient.clear(); // Clear all query cache
      toast.success('Your account has been successfully deleted');
      navigate('/login');
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return { deleteAccount, isLoading, error };
};