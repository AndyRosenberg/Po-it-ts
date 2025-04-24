import { createContext, ReactNode, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";

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
    queryFn: async() => {
      try {
        // Use apiRequest which handles token refresh automatically
        return await apiRequest(`${process.env.HOST_DOMAIN}/api/auth/me`, {
          method: 'GET'
        });
      } catch (error) {
        // If it's a specific authentication error after refresh attempt failed
        if (error instanceof Error && error.message === 'Authentication expired') {
          console.log('Session expired, please log in again');
        } else if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred');
        }
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