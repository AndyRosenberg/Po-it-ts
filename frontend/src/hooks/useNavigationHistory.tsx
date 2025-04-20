import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Hook to track navigation history and provide safe back navigation
export const useNavigationHistory = () => {
  const location = useLocation();
  const previousPathRef = useRef<string>('/');
  
  useEffect(() => {
    // Don't update for create/edit pages
    const isCreateOrEdit = 
      location.pathname.includes('/create') || 
      (location.pathname.includes('/poems/') && location.pathname.includes('/edit'));
    
    if (!isCreateOrEdit) {
      // Store current path as previous for the next navigation
      previousPathRef.current = location.pathname;
    }
    
  }, [location.pathname]);

  return {
    previousPath: previousPathRef.current
  };
};