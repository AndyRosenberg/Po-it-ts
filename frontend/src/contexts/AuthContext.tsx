import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

type AuthUserType = {
  id: string;
  email: string;
  username: string;
  profilePic: string;
}

interface AuthContextParams {
  authUser: AuthUserType | null;
  setAuthUser: Dispatch<SetStateAction<AuthUserType | null>>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextParams>({
  authUser: null,
  setAuthUser: () => {},
  isLoading: true,
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const meResponse = await fetch(`${process.env.HOST_DOMAIN}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',  // Include credentials in the request
        });
        const data = await meResponse.json();
  
        if (!meResponse.ok) {
          throw new Error(data.error);
        }
  
        setAuthUser(data);
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAuthUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

