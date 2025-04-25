import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Poem } from './usePoems';
import { apiRequest } from '../utils/api';

interface Stanza {
  id?: string;
  body: string;
  poemId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useCreatePoem = () => {
  const [stanzas, setStanzas] = useState<Stanza[]>([]);
  const [poemId, setPoemId] = useState<string | undefined>();
  const [poemTitle, setPoemTitle] = useState<string>("Untitled Poem");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create a new poem
  const { mutateAsync: createPoem, isPending: isCreatingPoem } = useMutation({
    mutationFn: async() => {
      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: (newPoem) => {
      setPoemId(newPoem.id);
      return newPoem.id;
    }
  });

  // Add a stanza to the poem
  const { mutateAsync: addStanza, isPending: isAddingStanza } = useMutation({
    mutationFn: async({ body, pId }: { body: string, pId?: string }) => {
      // If we don't have a poem ID yet, create a new poem first
      let activePoemId = pId || poemId;

      if (!activePoemId) {
        const newPoem = await createPoem();
        activePoemId = newPoem.id;
      }

      if (!activePoemId) {
        throw new Error('Failed to create poem');
      }

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/stanzas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poemId: activePoemId,
          body,
        }),
      });
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
    mutationFn: async({ stanzaId, body }: { stanzaId: string, body: string }) => {
      return await apiRequest(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      });
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
    mutationFn: async(stanzaId: string) => {
      await apiRequest(`${process.env.HOST_DOMAIN}/api/stanzas/${stanzaId}`, {
        method: 'DELETE',
      });

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
    mutationFn: async(title: string) => {
      // If we don't have a poem ID yet, create a new poem first
      let activePoemId = poemId;

      if (!activePoemId) {
        try {
          const newPoem = await createPoem();
          activePoemId = newPoem.id;
        } catch {
          // No need to capture the error since we're throwing a new one
          throw new Error('Failed to create poem for title update');
        }
      }

      if (!activePoemId) {
        throw new Error('Failed to create poem for title update');
      }

      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${activePoemId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
    },
    onSuccess: (updatedPoem: Poem) => {
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
    mutationFn: async(id: string) => {
      return await apiRequest(`${process.env.HOST_DOMAIN}/api/poems/${id}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  });

  // Complete and view the poem
  const completePoem = async(unsavedTitle?: string, unsavedStanza?: string) => {
    let currentPoemId = poemId;
    let updatedPoem: Poem | null = null;

    try {
      // Step 1: Create the poem if we don't have a poem ID yet
      if (!currentPoemId) {
        const newPoem = await createPoem();
        currentPoemId = newPoem.id;
      }

      // Step 2: Update title if provided (even if it's the same as current, we want to ensure it's saved)
      if (unsavedTitle !== undefined) {
        updatedPoem = await updateTitle(unsavedTitle);
        currentPoemId = updatedPoem.id;
      }

      // Step 3: Add any unsaved stanza
      if (unsavedStanza && unsavedStanza.trim()) {
        await addStanza({
          body: unsavedStanza.trim(),
          pId: currentPoemId
        });
      }

      // Step 4: Publish the poem only if we have a poem ID
      if (currentPoemId) {
        await publishPoem(currentPoemId);

        // Step 5: Invalidate all poem-related queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['my-poems'] });
        queryClient.invalidateQueries({ queryKey: ['public-poems'] });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        queryClient.invalidateQueries({ queryKey: ['userPoems'] });
        queryClient.invalidateQueries({ queryKey: ['poem', currentPoemId] });

        // Step 6: Navigate to the poem view after all operations have completed
        navigate(`/poems/${currentPoemId}`);
      } else {
        console.error("Failed to get a valid poem ID after all operations");
      }
    } catch (error) {
      console.error("Error in completePoem:", error);
      // Don't navigate if there was an error
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
    createPoem: async() => {
      const poem = await createPoem();
      return poem.id;
    },
    addStanza: async(body: string, pId?: string) => {
      return addStanza({ body, pId });
    },
    updateStanza: async(stanzaId: string, body: string) => {
      return updateStanza({ stanzaId, body });
    },
    deleteStanza,
    reorderStanzas,
    updateTitle,
    publishPoem,
    completePoem
  };
};