import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiRequest } from '../utils/api';

export const useDeleteAccount = () => {
  const [error, setError] = useState<string | null>(null);
  const { setAuthUser } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: deleteAccount, isPending: isLoading } = useMutation({
    mutationFn: async(password: string) => {
      setError(null);

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/users/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
    },
    onSuccess: () => {
      // Pre-navigate cleanup
      localStorage.removeItem('lastLoginTime');

      // Clear auth state and cache
      setAuthUser(null);
      queryClient.removeQueries(); // More performant than clear()

      // UI feedback and navigation
      toast.success('Your account has been successfully deleted');

      // Use timeout to allow React to process state changes before navigation
      setTimeout(() => navigate('/login'), 10);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return { deleteAccount, isLoading, error };
};