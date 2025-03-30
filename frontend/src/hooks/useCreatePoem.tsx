import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';

interface Stanza {
  id?: string;
  body: string;
  poemId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Poem {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const useCreatePoem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stanzas, setStanzas] = useState<Stanza[]>([]);
  const [poemId, setPoemId] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string>("Untitled Poem");
  const navigate = useNavigate();

  // Create a new poem without passing title (we'll update it later)
  const createPoem = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create poem');
      }
      
      const newPoem = await response.json();
      setPoemId(newPoem.id);
      return newPoem.id;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a stanza to the poem
  const addStanza = async (body: string, pId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If we don't have a poem ID yet, create a new poem first
      const activePoemId = pId || poemId || await createPoem();
      
      if (!activePoemId) {
        throw new Error('Failed to create poem');
      }
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/stanzas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          poemId: activePoemId,
          body,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add stanza');
      }
      
      const newStanza = await response.json();
      setStanzas(prev => [...prev, newStanza]);
      
      if (!poemId) {
        setPoemId(activePoemId);
      }
      
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

  // Reorder stanzas (local state only)
  const reorderStanzas = (sourceIndex: number, destinationIndex: number) => {
    setStanzas(prev => arrayMove(prev, sourceIndex, destinationIndex));
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
    error,
    stanzas,
    poemId,
    poemTitle,
    createPoem,
    addStanza,
    updateStanza,
    deleteStanza,
    reorderStanzas,
    updateTitle,
    completePoem
  };
};