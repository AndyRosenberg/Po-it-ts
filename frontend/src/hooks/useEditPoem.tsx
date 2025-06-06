import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';

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
  isDraft: boolean;
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
    queryFn: async() => {
      if (!poemId) throw new Error('Poem ID is required');

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`) as Poem;
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
    mutationFn: async(body: string) => {
      if (!poemId) throw new Error('Poem ID is required');

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/stanzas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poemId,
          body,
        }),
      });
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
    mutationFn: async({ stanzaId, body }: { stanzaId: string, body: string }) => {
      return await apiRequest(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      });
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
    mutationFn: async(stanzaId: string) => {
      await apiRequest(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'DELETE',
      });

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
    mutationFn: async(stanzaIds: string[]) => {
      if (!poemId) throw new Error('Poem ID is required');

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stanzaIds }),
      });
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
  const reorderStanzas = async(sourceIndex: number, destinationIndex: number) => {
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
    mutationFn: async(title: string) => {
      if (!poemId) throw new Error('Poem ID is required');

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
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

  // Publish poem (mark as not a draft)
  const { mutateAsync: publishPoem, isPending: isPublishing } = useMutation({
    mutationFn: async() => {
      if (!poemId) throw new Error('Poem ID is required');

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      if (poemId) {
        queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
        queryClient.invalidateQueries({ queryKey: ['my-poems'] });
        queryClient.invalidateQueries({ queryKey: ['public-poems'] });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      }

      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Complete and view the poem
  const completePoem = async(unsavedTitle?: string, unsavedStanza?: string) => {
    // Submit any unsaved title
    if (unsavedTitle && unsavedTitle !== poemTitle) {
      await updateTitle(unsavedTitle);
    }

    // Submit any unsaved stanza
    if (unsavedStanza && unsavedStanza.trim()) {
      await addStanza(unsavedStanza);
    }

    if (poemId) {
      // If the poem is currently a draft, publish it
      if (poemData?.isDraft) {
        await publishPoem();
      }

      // Invalidate all poem-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });

      // Navigate to the poem with the draft state information preserved
      navigate(`/poems/${poemId}`, {
        state: { isDraft: false } // Set isDraft to false since we're publishing
      });
    }
  };

  // Remove duplicate effect - already handled in the earlier useEffect (lines 55-65)

  // Convert published poem to draft
  const { mutateAsync: convertToDraft, isPending: isConverting } = useMutation({
    mutationFn: async() => {
      if (!poemId) throw new Error('Poem ID is required');

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${poemId}/draft`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries
      if (poemId) {
        queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
        queryClient.invalidateQueries({ queryKey: ['my-poems'] });
        queryClient.invalidateQueries({ queryKey: ['public-poems'] });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      }

      toast.success('Poem converted to draft');
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Calculate overall loading state
  const isLoading = isFetchingPoem || isAddingStanza || isUpdatingStanza || isDeletingStanza || isReorderingStanzas || isUpdatingTitle || isConverting || isPublishing;

  // Wrap mutations with their success and error handlers
  const addStanzaWithHandlers = async(body: string) => {
    try {
      const result = await addStanza(body);
      return onAddStanzaSuccess(result);
    } catch (error) {
      onAddStanzaError(error as Error);
      throw error;
    }
  };

  const updateStanzaWithHandlers = async(stanzaId: string, body: string) => {
    try {
      const result = await updateStanza({ stanzaId, body });
      return onUpdateStanzaSuccess(result);
    } catch (error) {
      onUpdateStanzaError(error as Error);
      throw error;
    }
  };

  const deleteStanzaWithHandlers = async(stanzaId: string) => {
    try {
      const result = await deleteStanza(stanzaId);
      return onDeleteStanzaSuccess(result);
    } catch (error) {
      onDeleteStanzaError(error as Error);
      throw error;
    }
  };

  const updateTitleWithHandlers = async(title: string) => {
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
    convertToDraft,
    publishPoem,
    completePoem,
  };
};