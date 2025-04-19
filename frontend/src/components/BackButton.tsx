import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigation } from "../contexts/NavigationContext";

type BackButtonProps = {
  className?: string;
  preserveDraftState?: boolean;
  fallbackPath?: string;
  children?: React.ReactNode;
};

// Track whether we're on a create/edit page
const isCreateOrEditPage = (path: string): boolean => {
  return path.includes('/create') || (path.includes('/poems/') && path.includes('/edit'));
};

export const BackButton = ({ 
  className = "", 
  preserveDraftState = false,
  fallbackPath = '/',
  children
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthContext();
  const { previousPath } = useNavigation();
  
  const handleGoBack = () => {
    // Special handling for draft poems
    if (preserveDraftState) {
      // Get draft status from either location state or pathname
      const isDraftPoem = location.pathname.includes('/poems/') && 
                      (location.state?.isDraft || location.pathname.includes('/edit'));
      
      // Navigate to drafts tab if appropriate and we have an authenticated user
      if (isDraftPoem && authUser) {
        navigate(`/profile/${authUser.id}?tab=drafts`);
        return;
      }
    }
    
    // Check if we're on a create/edit page
    if (isCreateOrEditPage(location.pathname)) {
      // When on create/edit, always go to home or fallback path
      navigate(fallbackPath);
      return;
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
    
    // If previousPath is a create/edit page or is the current page, go home
    if (isCreateOrEditPage(previousPath) || previousPath === location.pathname) {
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