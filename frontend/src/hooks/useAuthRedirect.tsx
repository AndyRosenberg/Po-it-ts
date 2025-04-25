import { useEffect } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthRedirect = (authedRoute?: string) => {
  const { authUser, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add debugging to see what's happening
  useEffect(() => {
    
    if (!isLoading) {
      if (!authUser && !authedRoute?.length && location.pathname !== '/login' && location.pathname !== '/signup') {
        // Only redirect to login if we're not already on a login/signup page
        navigate('/login');
      } else if (authUser && authedRoute?.length && location.pathname !== authedRoute) {
        // Only redirect to authedRoute if we're not already there
        navigate(authedRoute);
      }
    }
  }, [isLoading, authUser?.id, authUser, authedRoute, navigate, location.pathname])
}
