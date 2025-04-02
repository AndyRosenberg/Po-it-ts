import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';

type UpdateUserData = {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
};

export const useUpdateUser = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { authUser, setAuthUser } = useAuthContext();
  const [, setUser] = useAtom(userAtom);
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isLoading } = useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      setAuthUser(data);
      setUser(data); // Update Jotai state
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