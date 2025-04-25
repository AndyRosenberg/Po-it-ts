import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

type UpdateUserData = {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
};

export const useUpdateUser = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { setAuthUser } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isLoading } = useMutation({
    mutationFn: async(userData: UpdateUserData) => {
      setError(null);
      setSuccess(null);

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
    },
    onSuccess: (data) => {
      setAuthUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      setSuccess('Settings updated successfully');
    },
    onError: (error: Error) => {
      setError(error.message);
      setSuccess(null);
    },
  });

  return { updateUser, isLoading, error, success };
};