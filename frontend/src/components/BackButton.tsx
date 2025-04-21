import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useQueryClient } from "@tanstack/react-query";

type BackButtonProps = {
  className?: string;
  preserveDraftState?: boolean;
  fallbackPath?: string;
  children?: React.ReactNode;
  forceUseDefault?: boolean; // Force using the fallback path instead of navigation history
};

// Create a separate file for shared utilities
// This stays here to maintain compatibility, but will cause a warning
// Consider moving this to a separate file in the future
export const isCreateOrEditPage = (path: string): boolean => {
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
  const queryClient = useQueryClient();

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

    // If we're on a create page, verify if we should preserve draft state based on content
    if (location.pathname.includes('/create')) {
      // Only preserveDraftState if explicitly requested AND there's enough content to save
      if (preserveDraftState) {
        // Get stanzas and title from DOM to check if there's enough content to save
        const stanzaElements = document.querySelectorAll('[data-stanza-id]');
        const titleElement = document.querySelector('.bg-slate-800 .text-xl.text-slate-200.font-medium');
        const title = titleElement?.textContent || '';
        const hasValidTitle = title && title !== 'Untitled Poem';
        const hasAtLeastOneStanza = stanzaElements.length > 0;

        // Preserve draft if there's a valid title OR at least one stanza
        if (hasValidTitle || hasAtLeastOneStanza) {
          // More aggressive cache invalidation to ensure fresh data
          // Invalidate all relevant queries that might contain poems
          queryClient.invalidateQueries({ queryKey: ['my-poems'] });
          // Invalidate all user poems queries as they might contain drafts
          queryClient.invalidateQueries({ queryKey: ['userPoems'] });

          if (authUser) {
            // Specifically invalidate this user's poems in the drafts tab
            queryClient.invalidateQueries({
              queryKey: ['userPoems', authUser.id],
              refetchType: 'all'
            });
          }

          // Force an immediate refetch to ensure data is fresh
          setTimeout(() => {
            if (authUser) {
              // Refetch just to be extra certain the drafts are refreshed
              queryClient.refetchQueries({
                queryKey: ['userPoems', authUser.id, 10, undefined, true],
                exact: false
              });
            }
          }, 10);

          // Let default navigation happen (useCreatePoem will auto-save)
          // The current implementation creates a draft as soon as you edit title or add stanza
          navigate(fallbackPath);
          return;
        }
      }

      // If we don't have enough content, simply navigate away without preserving draft
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