import { useAuthContext } from "./useAuthContext";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export type LoginInputs = {
  usernameOrEmail: string;
  password: string;
}

export const useLogin = () => {
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  const { mutateAsync: login, isPending: loading } = useMutation({
    mutationFn: async(inputs: LoginInputs) => {
      try {
        const response = await fetch(
          `${process.env.HOST_DOMAIN}/api/auth/login`,
          {
            method: "POST",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(inputs)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        return data;
      } catch (error) {
        throw error; // Re-throw to be handled by onError
      }
    },
    onSuccess: (data) => {
      
      // Update auth user state
      setAuthUser(data);
      
      // Force a longer delay before navigation to ensure auth context is updated and persisted
      setTimeout(() => {
        navigate("/");
        
        // After navigation, invalidate queries to refresh data
        setTimeout(() => {
          window.location.reload(); // Force a full refresh to ensure everything is up to date
        }, 100);
      }, 500);
    },
    onError: (error: Error) => {
      console.error("Login error:", error.message);
      toast.error(error.message);
    }
  });

  return { loading, login };
}