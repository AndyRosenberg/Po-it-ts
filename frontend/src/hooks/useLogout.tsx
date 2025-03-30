import toast from "react-hot-toast";
import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
  const { setAuthUser } = useAuthContext();

  const logout = async () => {
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setAuthUser(null);
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message);
    }
  }

  return { logout };
}