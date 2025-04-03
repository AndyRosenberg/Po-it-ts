import { createContext, ReactNode, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type UserType = {
  id: string;
  email: string;
  username: string;
  profilePic: string;
} | null;

interface AuthContextParams {
  authUser: UserType;
  setAuthUser: (user: UserType) => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextParams>({
  authUser: null,
  setAuthUser: () => {},
  isLoading: true,
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        const meResponse = await fetch(`${process.env.HOST_DOMAIN}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await meResponse.json();

        if (!meResponse.ok) {
          throw new Error(data.error);
        }

        return data;
      } catch (error: any) {
        console.error(error.message);
        return null;
      }
    },
    staleTime: Infinity, // Auth data doesn't change often
    retry: false,
  });

  const setAuthUser = (user: UserType) => {
    queryClient.setQueryData(["auth-user"], user);
  };

  return (
    <AuthContext.Provider value={{ authUser: authUser || null, setAuthUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContextProvider");
  }
  return context;
};