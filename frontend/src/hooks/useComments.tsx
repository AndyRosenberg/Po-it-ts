import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';

export interface Comment {
  id: string;
  body: string;
  commentableType: string;
  commentableId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    profilePic: string;
  };
}

export const useComments = (commentableType: string, commentableId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasComments, setHasComments] = useState(false);
  const { authUser } = useAuthContext();

  const fetchComments = async () => {
    if (!commentableType || !commentableId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.HOST_DOMAIN}/api/comments/${commentableType}/${commentableId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
      setHasComments(data.length > 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (body: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          body,
          commentableType,
          commentableId
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add comment');
      }
      
      const newComment = await response.json();
      setComments(prevComments => [newComment, ...prevComments]);
      setHasComments(true);
      
      return newComment;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async (commentId: string, body: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ body }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update comment');
      }
      
      const updatedComment = await response.json();
      
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      );
      
      return updatedComment;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.HOST_DOMAIN}/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }
      
      const filteredComments = prevComments => prevComments.filter(comment => comment.id !== commentId);
      setComments(filteredComments);
      
      // Update hasComments based on remaining comments
      const remainingComments = filteredComments(comments);
      setHasComments(remainingComments.length > 0);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchComments();
    }
  }, [authUser, commentableType, commentableId]);

  return {
    comments,
    isLoading,
    error,
    hasComments,
    fetchComments,
    addComment,
    updateComment,
    deleteComment
  };
};