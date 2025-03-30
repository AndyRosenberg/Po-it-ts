import { useState } from "react"
import { useAuthContext } from "./useAuthContext";
import toast from "react-hot-toast";

type SignupInputs = {
	email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const signup = async (inputs: SignupInputs) => {
    try {
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

      setAuthUser(data);
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, signup };
}