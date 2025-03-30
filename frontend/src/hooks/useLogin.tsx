import { useState } from "react"
import { useAuthContext } from "./useAuthContext";
import toast from "react-hot-toast";

type LoginInputs = {
  username: string;
  password: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async (inputs: LoginInputs) => {
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

      setAuthUser(data);
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, login };
}