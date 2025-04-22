import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationContextType {
  previousPath: string;
  currentPath: string;
  pathHistory: string[];
}

const NavigationContext = createContext<NavigationContextType>({
  previousPath: '/',
  currentPath: '/',
  pathHistory: ['/']
});

// Check if a path is a create or edit page
const isCreateOrEditPage = (path: string): boolean => {
  return path.includes('/create') || (path.includes('/poems/') && path.includes('/edit'));
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState<string>('/');
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);

  useEffect(() => {
    // Get full path including search params
    const fullPath = location.pathname + location.search;
    const fullCurrentPath = currentPath;

    // Only update if we're actually changing paths
    if (fullPath !== fullCurrentPath) {
      setPreviousPath(fullCurrentPath);

      // Add to navigation history if not a create/edit page
      if (!isCreateOrEditPage(fullPath)) {
        setPathHistory(prev => {
          if (prev[prev.length - 1] !== fullPath) {
            const newHistory = [...prev, fullPath];
            return newHistory.slice(-30);
          }
          return prev;
        });
      }

      // Always update current path
      setCurrentPath(fullPath);
    }
  }, [location.pathname, location.search, currentPath]);

  return (
    <NavigationContext.Provider value={{
      previousPath,
      currentPath,
      pathHistory
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Create a separate file for this hook to fix the fast refresh warning
// This stays here for compatibility, but causes a warning
export const useNavigation = () => useContext(NavigationContext);