import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Stanza {
  id?: string;
  body: string;
  poemId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useCreatePoem = () => {
  const [stanzas, setStanzas] = useState<Stanza[]>([]);
  const [poemId, setPoemId] = useState<string | null>(null);
  const [poemTitle, setPoemTitle] = useState<string>("Untitled Poem");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create a new poem
  const { mutateAsync: createPoem, isPending: isCreatingPoem } = useMutation({
    mutationFn: async () => {
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
      
      return response.json();
    },
    onSuccess: (newPoem) => {
      setPoemId(newPoem.id);
      return newPoem.id;
    }
  });

  // Add a stanza to the poem
  const { mutateAsync: addStanza, isPending: isAddingStanza } = useMutation({
    mutationFn: async ({ body, pId }: { body: string, pId?: string }) => {
      // If we don't have a poem ID yet, create a new poem first
      let activePoemId = pId || poemId;
      
      if (!activePoemId) {
        const newPoem = await createPoem();
        activePoemId = newPoem.id;
      }
      
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
      
      return response.json();
    },
    onSuccess: (newStanza) => {
      setStanzas(prev => [...prev, newStanza]);
      
      if (!poemId && newStanza.poemId) {
        setPoemId(newStanza.poemId);
        // Invalidate relevant queries when a new poem is created
        queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      }
      
      return newStanza;
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
      
      // Invalidate the specific poem query if it exists
      if (poemId) {
        queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      }
      
      return updatedStanza;
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
      
      // Invalidate the specific poem query if it exists
      if (poemId) {
        queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
      }
      
      return true;
    }
  });

  // Update poem title
  const { mutateAsync: updateTitle, isPending: isUpdatingTitle } = useMutation({
    mutationFn: async (title: string) => {
      // If we don't have a poem ID yet, create a new poem first
      let activePoemId = poemId;
      
      if (!activePoemId) {
        try {
          const newPoem = await createPoem();
          activePoemId = newPoem.id;
        } catch (error) {
          throw new Error('Failed to create poem for title update');
        }
      }
      
      if (!activePoemId) {
        throw new Error('Failed to create poem for title update');
      }
      
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${activePoemId}/title`, {
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
      setPoemId(updatedPoem.id);
      
      // Invalidate relevant queries when title is updated
      if (updatedPoem.id) {
        queryClient.invalidateQueries({ queryKey: ['poem', updatedPoem.id] });
      }
      
      return updatedPoem;
    }
  });

  // Reorder stanzas (local state only)
  const reorderStanzas = (sourceIndex: number, destinationIndex: number) => {
    setStanzas(prev => arrayMove(prev, sourceIndex, destinationIndex));
  };

  // Publish poem (mark as not a draft)
  const { mutateAsync: publishPoem, isPending: isPublishing } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${id}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish poem');
      }
      
      return response.json();
    }
  });

  // Complete and view the poem
  const completePoem = async (unsavedTitle?: string, unsavedStanza?: string) => {
    // Submit any unsaved title
    if (unsavedTitle && unsavedTitle !== poemTitle) {
      await updateTitle(unsavedTitle);
    }

    // Submit any unsaved stanza
    if (unsavedStanza && unsavedStanza.trim()) {
      await addStanza({
        body: unsavedStanza.trim()
      });
    }

    if (poemId) {
      // Publish the poem - mark as not a draft
      await publishPoem(poemId);
      
      // Invalidate all poem-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['my-poems'] });
      queryClient.invalidateQueries({ queryKey: ['public-poems'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPoems'] });
      navigate(`/poems/${poemId}`);
    }
  };

  // Calculate overall loading state
  const isLoading = isCreatingPoem || isAddingStanza || isUpdatingStanza || isDeletingStanza || isUpdatingTitle || isPublishing;

  return {
    isLoading,
    error: null, // We're handling errors in the mutations
    stanzas,
    poemId,
    poemTitle,
    createPoem: async () => {
      const poem = await createPoem();
      return poem.id;
    },
    addStanza: async (body: string, pId?: string) => {
      return addStanza({ body, pId });
    },
    updateStanza: async (stanzaId: string, body: string) => {
      return updateStanza({ stanzaId, body });
    },
    deleteStanza,
    reorderStanzas,
    updateTitle,
    publishPoem,
    completePoem
  };
};