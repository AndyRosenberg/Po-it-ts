import { useState, useCallback } from 'react';
import { apiRequest } from '../utils/api';

interface Stanza {
  id: string;
  [key: string]: any;
}

export const useStanzaComments = () => {
  const [stanzasWithComments, setStanzasWithComments] = useState<Record<string, boolean>>({});
  const [isCheckingComments, setIsCheckingComments] = useState(false);

  const checkStanzaComments = useCallback(async(stanzas: Stanza[]) => {
    if (!stanzas || stanzas.length === 0) return;
    setIsCheckingComments(true);

    try {
      // Create an array of promises for fetching comment status for each stanza
      const commentPromises = stanzas.map(async(stanza) => {
        try {
          // Limit to 1 since we only need to know if any comments exist
          const responseData = await apiRequest(
            `${process.env.HOST_DOMAIN}/api/comments/Stanza/${stanza.id}?limit=1`, 
            { method: 'GET' }
          );
          
          // Return the stanza ID and whether it has comments
          return { id: stanza.id, hasComments: responseData.totalCount > 0 };
        } catch (error) {
          console.error('Error checking comments:', error);
          return { id: stanza.id, hasComments: false };
        }
      });

      // Wait for all comment checks to complete
      const results = await Promise.all(commentPromises);
      
      // Convert the results to a record
      const commentsCheck = results.reduce<Record<string, boolean>>((acc, { id, hasComments }) => {
        acc[id] = hasComments;
        return acc;
      }, {});
      
      setStanzasWithComments(commentsCheck);
    } catch (error) {
      console.error('Error checking stanza comments:', error);
    } finally {
      setIsCheckingComments(false);
    }
  }, []);

  return {
    stanzasWithComments,
    checkStanzaComments,
    isCheckingComments
  };
};