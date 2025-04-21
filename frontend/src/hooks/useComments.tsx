import { useState, useEffect, useCallback } from 'react';
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

interface CommentResponse {
  comments: Comment[];
  nextCursor: string | null;
  totalCount: number;
}

export const useComments = (commentableType: string, commentableId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasComments, setHasComments] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { authUser } = useAuthContext();

  const fetchComments = useCallback(async(cursor?: string | null, append = false) => {
    if (!commentableType || !commentableId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add cursor and limit to the URL if provided
      let url = `${process.env.HOST_DOMAIN}/api/comments/${commentableType}/${commentableId}?limit=10`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch comments');
      }

      const data: CommentResponse = await response.json();

      if (append) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }

      setNextCursor(data.nextCursor);
      setHasMoreComments(!!data.nextCursor);
      setTotalCount(data.totalCount);
      setHasComments(data.totalCount > 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [commentableType, commentableId]);

  const addComment = async(body: string) => {
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

      // Add the new comment at the top of the list (newest first)
      setComments(prevComments => [newComment, ...prevComments]);

      // Update comment counts
      setTotalCount(prev => prev + 1);
      setHasComments(true);

      return newComment;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async(commentId: string, body: string) => {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async(commentId: string) => {
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

      // Filter comments first to get the new count
      const filteredComments = (prevComments: Comment[]) =>
        prevComments.filter(comment => comment.id !== commentId);

      // Update comment state
      setComments(filteredComments);

      // Update counts
      setTotalCount(prev => Math.max(0, prev - 1));

      // Get the remaining comments and update hasComments flag
      const remainingComments = filteredComments(comments);
      setHasComments(remainingComments.length > 0);

      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchComments();
    }
  }, [authUser, commentableType, commentableId, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    hasComments,
    hasMoreComments,
    nextCursor,
    totalCount,
    fetchComments,
    addComment,
    updateComment,
    deleteComment
  };
};