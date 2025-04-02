import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userAtom, UserType } from "../atoms/userAtom";
import { useAtom } from "jotai";

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
  const [user, setUser] = useAtom(userAtom);

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

  // Sync authUser with Jotai atom
  useEffect(() => {
    setUser(authUser || null);
  }, [authUser, setUser]);

  const setAuthUser = (user: UserType) => {
    queryClient.setQueryData(["auth-user"], user);
    setUser(user);
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