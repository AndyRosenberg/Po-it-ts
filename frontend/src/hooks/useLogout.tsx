import toast from "react-hot-toast";
import { useAuthContext } from "./useAuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const { setAuthUser } = useAuthContext();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: isLoading, error } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      setAuthUser(null);
      queryClient.clear(); // Clear all query cache on logout
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast.error(error.message);
    }
  });

  return { logout, isLoading, error };
}