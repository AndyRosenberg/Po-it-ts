import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationContextType {
  previousPath: string;
  currentPath: string;
}

const NavigationContext = createContext<NavigationContextType>({
  previousPath: '/',
  currentPath: '/',
});

// Check if a path is a create or edit page
const isCreateOrEditPage = (path: string): boolean => {
  return path.includes('/create') || (path.includes('/poems/') && path.includes('/edit'));
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState<string>('/');
  const [currentPath, setCurrentPath] = useState<string>('/');

  useEffect(() => {
    // If we're navigating to a create/edit page, don't update the previous path
    if (!isCreateOrEditPage(location.pathname)) {
      // Only update previous path if we're on a non-create/edit page
      if (location.pathname !== currentPath) {
        setPreviousPath(currentPath);
      }
    }

    // Always update current path
    setCurrentPath(location.pathname);
  }, [location.pathname, currentPath]);

  return (
    <NavigationContext.Provider value={{ previousPath, currentPath }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Create a separate file for this hook to fix the fast refresh warning
// This stays here for compatibility, but causes a warning
export const useNavigation = () => useContext(NavigationContext);