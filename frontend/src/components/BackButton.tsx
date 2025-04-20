import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigation } from "../contexts/NavigationContext";

type BackButtonProps = {
  className?: string;
  preserveDraftState?: boolean;
  fallbackPath?: string;
  children?: React.ReactNode;
  forceUseDefault?: boolean; // Force using the fallback path instead of navigation history
};

// Track whether a path is a create or edit page
const isCreateOrEditPage = (path: string): boolean => {
  return path.includes('/create') || (path.includes('/poems/') && path.includes('/edit'));
};

export const BackButton = ({ 
  className = "", 
  preserveDraftState = false,
  fallbackPath = '/',
  children,
  forceUseDefault = false
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthContext();
  const { previousPath } = useNavigation();
  
  const handleGoBack = () => {
    // If forceUseDefault is true, always go to the fallback path
    if (forceUseDefault) {
      navigate(fallbackPath);
      return;
    }

    // Special handling for draft poems
    if (preserveDraftState) {
      // Check if we're on a poem page
      const onPoemPage = location.pathname.includes('/poems/') && !location.pathname.includes('/edit');
      
      if (onPoemPage) {
        // Get isDraft from location state or sessionStorage (set during ViewPoem component mount)
        const isDraft = location.state?.isDraft || sessionStorage.getItem('viewingDraft') === 'true';
        
        // Navigate to drafts tab if appropriate and we have an authenticated user
        if (isDraft && authUser) {
          // Before navigating, set a flag in localStorage to force drafts tab
          localStorage.setItem('forceDraftsTab', 'true');
          
          // Clear the viewing draft flag
          sessionStorage.removeItem('viewingDraft');
          
          navigate(`/profile/${authUser.id}?tab=drafts`);
          return;
        }
      }
    }
    
    // If we're on a create page, go to fallback
    if (location.pathname.includes('/create')) {
      navigate(fallbackPath);
      return;
    }
    
    // If we're on an edit page, try to use browser history or go to view mode
    if (location.pathname.includes('/poems/') && location.pathname.includes('/edit')) {
      // Try using browser history for normal back navigation
      if (window.history.length > 1) {
        window.history.back();
        return;
      } else {
        // Fallback to view mode for the poem
        const poemMatch = location.pathname.match(/\/poems\/([^/]+)/);
        const poemId = poemMatch ? poemMatch[1] : null;
        
        if (poemId) {
          navigate(`/poems/${poemId}`);
          return;
        }
        
        // Last resort fallback
        navigate(fallbackPath);
        return;
      }
    }
    
    // Check if we're coming from a poem page after publishing
    const preventBackToCreate = sessionStorage.getItem('preventBackToCreate') === 'true';
    if (preventBackToCreate && location.pathname.includes('/poems/') && !location.pathname.includes('/edit')) {
      // Clear the flag
      sessionStorage.removeItem('preventBackToCreate');
      
      // Go to home instead of back to create
      navigate(fallbackPath);
      return;
    }

    // Check if previous path was an edit or create page
    if (isCreateOrEditPage(previousPath)) {
      // Don't go back to create or edit pages
      navigate(fallbackPath);
      return;
    }
    
    // If we're on the same page somehow, go to fallback
    if (previousPath === location.pathname) {
      navigate(fallbackPath);
      return;
    }
    
    // Use the tracked previous path from context
    navigate(previousPath);
  };

  return (
    <button 
      onClick={handleGoBack}
      className={`${className || "text-slate-300 hover:text-white transition-colors"}`}
      aria-label="Go Back"
    >
      {children || (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      )}
    </button>
  );
};