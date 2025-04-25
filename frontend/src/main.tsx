import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './contexts/AuthContext.tsx'
import { NavigationProvider } from './contexts/NavigationContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom wrapper to handle auth initialization
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false, // Disable retries for better error handling
      },
    },
  })

  // Pre-fetch auth status when the app starts
  useEffect(() => {
    const checkAuth = async() => {
      try {
        await queryClient.prefetchQuery({
          queryKey: ["auth-user"],
          queryFn: async() => {
            try {
              const response = await fetch(`${process.env.HOST_DOMAIN}/api/auth/me`, {
                method: 'GET',
                credentials: 'include',
              });

              if (!response.ok) {
                return null;
              }

              const userData = await response.json();
              return userData;
            } catch (error) {
              console.error("Error checking authentication:", error);
              return null;
            }
          },
        });
      } catch (error) {
        console.error("Authentication prefetch error:", error);
      }
    };

    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthInitializer>
        <NavigationProvider>
          <App />
        </NavigationProvider>
      </AuthInitializer>
    </BrowserRouter>
  </StrictMode>,
)