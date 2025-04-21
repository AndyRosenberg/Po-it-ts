import { useAuthContext } from "./useAuthContext";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

export type SignupInputs = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export const useSignup = () => {
  const { setAuthUser } = useAuthContext();

  const { mutate: signup, isPending: loading } = useMutation({
    mutationFn: async(inputs: SignupInputs) => {
      const response = await fetch(
        `${process.env.HOST_DOMAIN}/api/auth/signup`,
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
      setAuthUser(data);
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast.error(error.message);
    }
  });

  return { loading, signup };
}