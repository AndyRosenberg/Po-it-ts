import { useAuthContext } from "./useAuthContext";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';

export type SignupInputs = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export const useSignup = () => {
  const { setAuthUser } = useAuthContext();
  const [, setUser] = useAtom(userAtom);

  const { mutate: signup, isPending: loading, error } = useMutation({
    mutationFn: async (inputs: SignupInputs) => {
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
      setUser(data); // Update Jotai state too
    },
    onError: (error: Error) => {
      console.error(error.message);
      toast.error(error.message);
    }
  });

  return { loading, signup, error };
}