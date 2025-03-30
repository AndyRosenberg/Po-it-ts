import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';

interface Stanza {
  id?: string;
  body: string;
  poemId?: string;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Poem {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
}

export const useEditPoem = () => {
  const { poemId } = useParams<{ poemId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stanzas, setStanzas] = useState<Stanza[]>([]);
  const [poemTitle, setPoemTitle] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();

  // Fetch the poem data
  const fetchPoem = async () => {
    if (!poemId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch poem');
      }
      
      const poem = await response.json();
      setPoemTitle(poem.title);
      setStanzas(poem.stanzas);
      setIsOwner(poem.isOwner);
      
      if (!poem.isOwner) {
        const ownershipError = "You don't have permission to edit this poem";
        setError(ownershipError);
        toast.error(ownershipError);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPoem();
  }, [poemId]);

  // Add a stanza to the poem
  const addStanza = async (body: string) => {
    if (!poemId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/stanzas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          poemId,
          body,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add stanza');
      }
      
      const newStanza = await response.json();
      setStanzas(prev => [...prev, newStanza]);
      
      return newStanza;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing stanza
  const updateStanza = async (stanzaId: string, body: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ body }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update stanza');
      }
      
      const updatedStanza = await response.json();
      setStanzas(prev => prev.map(stanza => 
        stanza.id === stanzaId ? updatedStanza : stanza
      ));
      
      return updatedStanza;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a stanza
  const deleteStanza = async (stanzaId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete stanza');
      }
      
      setStanzas(prev => prev.filter(stanza => stanza.id !== stanzaId));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder stanzas locally and on the server
  const reorderStanzas = async (sourceIndex: number, destinationIndex: number) => {
    // Update local state immediately for responsiveness
    const newStanzas = arrayMove([...stanzas], sourceIndex, destinationIndex);
    setStanzas(newStanzas);
    
    // Skip server update if no poem ID
    if (!poemId) return;
    
    try {
      const stanzaIds = newStanzas.map(stanza => stanza.id as string);
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ stanzaIds }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reorder stanzas');
      }
      
      // Update state with server response to ensure consistency
      const updatedPoem = await response.json();
      setStanzas(updatedPoem.stanzas);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      // Refetch poem to ensure state is consistent with server
      fetchPoem();
    }
  };

  // Update poem title
  const updateTitle = async (title: string) => {
    if (!poemId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update title');
      }
      
      const updatedPoem = await response.json();
      setPoemTitle(updatedPoem.title);
      return updatedPoem;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete and view the poem
  const completePoem = () => {
    if (poemId) {
      navigate(`/poems/${poemId}`);
    }
  };

  return {
    isLoading,
    setIsLoading,
    error,
    stanzas,
    poemId,
    poemTitle,
    addStanza,
    updateStanza,
    deleteStanza,
    reorderStanzas,
    updateTitle,
    completePoem
  };
};