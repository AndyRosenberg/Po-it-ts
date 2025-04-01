import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  stanzas: Stanza[];
}

export const useEditPoem = () => {
  const { poemId } = useParams<{ poemId: string }>();
  const [stanzas, setStanzas] = useState<Stanza[]>([]);
  const [poemTitle, setPoemTitle] = useState<string>("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the poem data
  const { isLoading: isFetchingPoem, error: fetchError, data: poemData } = useQuery({
    queryKey: ['poem', poemId],
    queryFn: async () => {
      if (!poemId) throw new Error('Poem ID is required');
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch poem');
      }
      
      const poemData = await response.json();
      console.log("Poem data fetched:", poemData);
      return poemData as Poem;
    },
    onSuccess: (poem) => {
      console.log("Setting poem data in onSuccess:", poem.title);
      setPoemTitle(poem.title);
      setStanzas(poem.stanzas);
      
      if (!poem.isOwner) {
        const ownershipError = "You don't have permission to edit this poem";
        toast.error(ownershipError);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  // Add a stanza to the poem
  const { mutateAsync: addStanza, isPending: isAddingStanza } = useMutation({
    mutationFn: async (body: string) => {
      if (!poemId) throw new Error('Poem ID is required');
      
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
      
      return response.json();
    },
    onSuccess: (newStanza) => {
      setStanzas(prev => [...prev, newStanza]);
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      return newStanza;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Update an existing stanza
  const { mutateAsync: updateStanza, isPending: isUpdatingStanza } = useMutation({
    mutationFn: async ({ stanzaId, body }: { stanzaId: string, body: string }) => {
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
      
      return response.json();
    },
    onSuccess: (updatedStanza) => {
      setStanzas(prev => prev.map(stanza => 
        stanza.id === updatedStanza.id ? updatedStanza : stanza
      ));
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      return updatedStanza;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Delete a stanza
  const { mutateAsync: deleteStanza, isPending: isDeletingStanza } = useMutation({
    mutationFn: async (stanzaId: string) => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete stanza');
      }
      
      return stanzaId;
    },
    onSuccess: (stanzaId) => {
      setStanzas(prev => prev.filter(stanza => stanza.id !== stanzaId));
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      return true;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Reorder stanzas locally and on the server
  const { mutateAsync: reorderStanzasOnServer, isPending: isReorderingStanzas } = useMutation({
    mutationFn: async (stanzaIds: string[]) => {
      if (!poemId) throw new Error('Poem ID is required');
      
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
      
      return response.json();
    },
    onSuccess: (updatedPoem) => {
      setStanzas(updatedPoem.stanzas);
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
      // Refetch poem to ensure state is consistent with server
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
    }
  });

  // Reorder stanzas function that users will call
  const reorderStanzas = async (sourceIndex: number, destinationIndex: number) => {
    // Update local state immediately for responsiveness
    const newStanzas = arrayMove([...stanzas], sourceIndex, destinationIndex);
    setStanzas(newStanzas);
    
    // Skip server update if no poem ID
    if (!poemId) return;
    
    // Get the stanza IDs in the new order
    const stanzaIds = newStanzas.map(stanza => stanza.id as string);
    
    // Call the mutation
    try {
      await reorderStanzasOnServer(stanzaIds);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Update poem title
  const { mutateAsync: updateTitle, isPending: isUpdatingTitle } = useMutation({
    mutationFn: async (title: string) => {
      if (!poemId) throw new Error('Poem ID is required');
      
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
      
      return response.json();
    },
    onSuccess: (updatedPoem) => {
      setPoemTitle(updatedPoem.title);
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      return updatedPoem;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Complete and view the poem
  const completePoem = () => {
    if (poemId) {
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      navigate(`/poems/${poemId}`);
    }
  };

  // Keep stanzas and title in sync with poemData
  useEffect(() => {
    if (poemData) {
      if (poemData.stanzas && poemData.stanzas.length > 0) {
        setStanzas(poemData.stanzas);
      }
      if (poemData.title) {
        setPoemTitle(poemData.title);
      }
    }
  }, [poemData]);

  // Calculate overall loading state
  const isLoading = isFetchingPoem || isAddingStanza || isUpdatingStanza || isDeletingStanza || isReorderingStanzas || isUpdatingTitle;

  return {
    isLoading,
    error: fetchError ? (fetchError as Error).message : null,
    stanzas,
    poemId,
    poemTitle,
    poemData,
    addStanza: (body: string) => addStanza(body),
    updateStanza: (stanzaId: string, body: string) => updateStanza({ stanzaId, body }),
    deleteStanza,
    reorderStanzas,
    updateTitle,
    completePoem,
  };
};