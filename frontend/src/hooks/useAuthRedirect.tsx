import { useEffect } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthRedirect = (authedRoute?: string) => {
  const { authUser, isLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!authUser && !authedRoute?.length) {
        navigate('/login');
      } else if (authUser && authedRoute?.length) {
        navigate(authedRoute);
      }
    }
  }, [isLoading, authUser?.id, authUser, authedRoute, navigate])
}
