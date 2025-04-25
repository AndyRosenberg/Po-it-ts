import { useAuthContext } from "./useAuthContext";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export type LoginInputs = {
  usernameOrEmail: string;
  password: string;
}

export const useLogin = () => {
  const { loginAndNavigate } = useAuthContext();
  const navigate = useNavigate();

  const { mutateAsync: login, isPending: loading } = useMutation({
    mutationFn: async(inputs: LoginInputs) => {
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
    },
    onSuccess: (data) => {
      // Use the new login flow from AuthContext
      loginAndNavigate(data, navigate);
    },
    onError: (error: Error) => {
      console.error("Login error:", error.message);
      toast.error(error.message);
    }
  });

  return { loading, login };
}