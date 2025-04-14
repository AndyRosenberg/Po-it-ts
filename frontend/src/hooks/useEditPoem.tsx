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
      return poemData as Poem;
    }
  });
  
  // Handle success and error effects separately
  useEffect(() => {
    if (poemData) {
      setPoemTitle(poemData.title);
      setStanzas(poemData.stanzas);
      
      if (!poemData.isOwner) {
        const ownershipError = "You don't have permission to edit this poem";
        toast.error(ownershipError);
      }
    }
  }, [poemData]);
  
  // Handle errors
  useEffect(() => {
    if (fetchError) {
      toast.error((fetchError as Error).message);
    }
  }, [fetchError]);
  
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
    }
  });
  
  // Handle successful stanza addition
  const onAddStanzaSuccess = (newStanza: Stanza) => {
    setStanzas(prev => [...prev, newStanza]);
    
    // Invalidate all relevant poem queries
    if (poemId) {
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
    }
    
    return newStanza;
  };
  
  // Handle stanza addition errors
  const onAddStanzaError = (error: Error) => {
    toast.error(error.message);
  };

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
    }
  });
  
  // Handle successful stanza update
  const onUpdateStanzaSuccess = (updatedStanza: Stanza) => {
    setStanzas(prev => prev.map(stanza => 
      stanza.id === updatedStanza.id ? updatedStanza : stanza
    ));
    
    // Invalidate poem-specific queries
    if (poemId) {
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
    }
    
    return updatedStanza;
  };
  
  // Handle stanza update errors
  const onUpdateStanzaError = (error: Error) => {
    toast.error(error.message);
  };

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
    }
  });
  
  // Handle successful stanza deletion
  const onDeleteStanzaSuccess = (stanzaId: string) => {
    setStanzas(prev => prev.filter(stanza => stanza.id !== stanzaId));
    
    // Invalidate all relevant queries
    if (poemId) {
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      // If this was the last stanza, my-poems and userPoems lists might need updating
      if (stanzas.length <= 1) {
        queryClient.invalidateQueries({ queryKey: ['my-poems'] });
        queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      }
    }
    
    return true;
  };
  
  // Handle stanza deletion errors
  const onDeleteStanzaError = (error: Error) => {
    toast.error(error.message);
  };

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
    }
  });
  
  // Handle successful stanza reordering
  const onReorderStanzasSuccess = (updatedPoem: Poem) => {
    setStanzas(updatedPoem.stanzas);
    
    // Invalidate poem-specific query
    if (poemId) {
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
    }
  };
  
  // Handle stanza reordering errors
  const onReorderStanzasError = (error: Error) => {
    toast.error(error.message);
    // Refetch poem to ensure state is consistent with server
    queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
  };

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
      const result = await reorderStanzasOnServer(stanzaIds);
      onReorderStanzasSuccess(result);
    } catch (error) {
      onReorderStanzasError(error as Error);
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
    }
  });
  
  // Handle successful title update
  const onUpdateTitleSuccess = (updatedPoem: Poem) => {
    setPoemTitle(updatedPoem.title);
    
    // Invalidate all relevant queries since the title appears in listings
    if (poemId) {
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
    
    return updatedPoem;
  };
  
  // Handle title update errors
  const onUpdateTitleError = (error: Error) => {
    toast.error(error.message);
  };

  // Complete and view the poem
  const completePoem = async (unsavedTitle?: string, unsavedStanza?: string) => {
    // Submit any unsaved title
    if (unsavedTitle && unsavedTitle !== poemTitle) {
      await updateTitle(unsavedTitle);
    }

    // Submit any unsaved stanza
    if (unsavedStanza && unsavedStanza.trim()) {
      await addStanza(unsavedStanza);
    }

    if (poemId) {
      // Invalidate all poem-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      navigate(`/poems/${poemId}`);
    }
  };

  // Remove duplicate effect - already handled in the earlier useEffect (lines 55-65)

  // Calculate overall loading state
  const isLoading = isFetchingPoem || isAddingStanza || isUpdatingStanza || isDeletingStanza || isReorderingStanzas || isUpdatingTitle;

  // Wrap mutations with their success and error handlers
  const addStanzaWithHandlers = async (body: string) => {
    try {
      const result = await addStanza(body);
      return onAddStanzaSuccess(result);
    } catch (error) {
      onAddStanzaError(error as Error);
      throw error;
    }
  };

  const updateStanzaWithHandlers = async (stanzaId: string, body: string) => {
    try {
      const result = await updateStanza({ stanzaId, body });
      return onUpdateStanzaSuccess(result);
    } catch (error) {
      onUpdateStanzaError(error as Error);
      throw error;
    }
  };

  const deleteStanzaWithHandlers = async (stanzaId: string) => {
    try {
      const result = await deleteStanza(stanzaId);
      return onDeleteStanzaSuccess(result);
    } catch (error) {
      onDeleteStanzaError(error as Error);
      throw error;
    }
  };

  const updateTitleWithHandlers = async (title: string) => {
    try {
      const result = await updateTitle(title);
      return onUpdateTitleSuccess(result);
    } catch (error) {
      onUpdateTitleError(error as Error);
      throw error;
    }
  };

  return {
    isLoading,
    error: fetchError ? (fetchError as Error).message : null,
    stanzas,
    poemId,
    poemTitle,
    poemData,
    addStanza: addStanzaWithHandlers,
    updateStanza: updateStanzaWithHandlers,
    deleteStanza: deleteStanzaWithHandlers,
    reorderStanzas,
    updateTitle: updateTitleWithHandlers,
    completePoem,
  };
};