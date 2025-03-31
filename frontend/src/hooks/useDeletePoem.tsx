import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useDeletePoem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const deletePoem = async (poemId: string) => {
    if (!poemId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete poem');
      }
      
      // Success - navigate back to poems list
      toast.success('Poem deleted successfully');
      navigate('/');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete poem';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    deletePoem
  };
};