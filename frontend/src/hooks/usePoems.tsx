import { useState, useEffect } from 'react';

interface Stanza {
  id: string;
  body: string;
  poemId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  profilePic: string;
}

export interface Poem {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  stanzas: Stanza[];
  user?: User;
  isOwner?: boolean;
}

// Hook for fetching user's own poems
export const useMyPoems = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.HOST_DOMAIN}/api/my-poems`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch poems');
        }
        
        const data = await response.json();
        setPoems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPoems();
  }, []);

  return { poems, isLoading, error };
};

// Hook for fetching all public poems
export const usePublicPoems = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch poems');
        }
        
        const data = await response.json();
        setPoems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPoems();
  }, []);

  return { poems, isLoading, error };
};