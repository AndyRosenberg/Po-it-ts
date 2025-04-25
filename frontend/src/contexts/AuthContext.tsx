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
  logoutAndNavigate: (navigate: (path: string) => void) => void;
  loginAndNavigate: (userData: UserType, navigate: (path: string) => void) => void;
}

export const AuthContext = createContext<AuthContextParams>({
  authUser: null,
  setAuthUser: () => {},
  isLoading: true,
  logoutAndNavigate: () => {},
  loginAndNavigate: () => {},
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async() => {
      try {
        // Use apiRequest which handles token refresh automatically
        const userData = await apiRequest(`${process.env.HOST_DOMAIN}/api/auth/me`, {
          method: 'GET'
        });
        return userData;
      } catch (error) {
        if (error instanceof Error) {
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

  // Add utilities to handle auth navigation properly
  const logoutAndNavigate = (navigate: (path: string) => void) => {
    // Set auth user to null first
    setAuthUser(null);
    // Clear all queries in the cache
    queryClient.clear();
    // Navigate to login page
    navigate('/login');
  };

  const loginAndNavigate = (userData: UserType, navigate: (path: string) => void) => {
    // Set the auth user data first
    setAuthUser(userData);
    // Navigate to home page
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      authUser: authUser || null,
      setAuthUser,
      isLoading,
      logoutAndNavigate,
      loginAndNavigate
    }}>
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