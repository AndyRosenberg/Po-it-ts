import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useComments, Comment } from '../hooks/useComments';
import { useAuthContext } from '../hooks/useAuthContext';
import { getUserInitials } from '../utils/user-utils';
import { Virtuoso } from 'react-virtuoso';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  commentableType: string;
  commentableId: string;
  stanzaText: string;
}

export const CommentDrawer = ({
  isOpen,
  onClose,
  commentableType,
  commentableId,
  stanzaText
}: CommentDrawerProps) => {
  const { 
    comments, 
    isLoading, 
    error, 
    hasMoreComments,
    nextCursor,
    totalCount,
    fetchComments,
    addComment, 
    updateComment, 
    deleteComment 
  } = useComments(
    commentableType,
    commentableId
  );
  const { authUser } = useAuthContext();
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus comment input when drawer opens
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle loading more comments when reaching end of list
  const loadMore = useCallback(() => {
    if (!hasMoreComments || loadingMore || isLoading) return;
    
    setLoadingMore(true);
    
    fetchComments(nextCursor, true)
      .catch(error => {
        console.error('Error loading more comments:', error);
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, [hasMoreComments, loadingMore, isLoading, fetchComments, nextCursor]);

  // Format date helper (wrapped in useCallback)
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Comment editing handlers (wrapped in useCallback)
  const handleEditComment = useCallback((comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.body);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingCommentText('');
  }, []);

  const handleSaveEdit = useCallback(async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    
    const success = await updateComment(commentId, editingCommentText);
    if (success) {
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  }, [editingCommentText, updateComment]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  }, [deleteComment]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    
    const success = await addComment(newCommentText);
    if (success) {
      setNewCommentText('');
    }
  };

  // Render a comment item
  const CommentItem = useCallback((index: number) => {
    const comment = comments[index];
    
    return (
      <div
        key={comment.id}
        className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {comment.user.profilePic ? (
              <img
                src={comment.user.profilePic}
                alt={`${comment.user.username}'s avatar`}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full mr-2 bg-slate-700 flex items-center justify-center text-xs font-medium">
                {getUserInitials(comment.user.username)}
              </div>
            )}
            <div>
              <div className="font-medium text-white">{comment.user.username}</div>
              <div className="text-xs text-slate-400">{formatDate(comment.createdAt)}</div>
            </div>
          </div>

          {authUser?.id === comment.userId && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditComment(comment)}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Edit comment"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 0 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-slate-400 hover:text-red-400 transition-colors"
                aria-label="Delete comment"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {editingCommentId === comment.id ? (
          <div className="mt-2">
            <textarea
              value={editingCommentText}
              onChange={(e) => setEditingCommentText(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm bg-transparent text-slate-300 hover:text-white border border-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(comment.id)}
                className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-200 mt-2 whitespace-pre-wrap break-words">
            {comment.body}
          </div>
        )}
      </div>
    );
  }, [comments, authUser?.id, editingCommentId, editingCommentText, formatDate, handleEditComment, handleDeleteComment, handleSaveEdit, handleCancelEdit]);

  // Render footer with loading state
  const FooterRenderer = useCallback(() => {
    if (loadingMore) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      );
    }
    
    if (!hasMoreComments && comments.length > 0) {
      return (
        <div className="text-center py-3 text-xs text-slate-500">
          {comments.length === totalCount ? 'All' : ''} Comments loaded
        </div>
      );
    }
    
    return (
      <div className="text-xs text-slate-400 mt-2 text-center py-3">
        Showing {comments.length} of {totalCount} comment{totalCount !== 1 ? 's' : ''}
      </div>
    );
  }, [loadingMore, hasMoreComments, comments.length, totalCount]);

  // Header component for the virtuoso list
  const HeaderComponent = useMemo(() => {
    return (
      <>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}
      </>
    );
  }, [error]);

  // Empty list placeholder
  const EmptyPlaceholder = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      );
    }
    
    return (
      <div className="text-center py-6 text-slate-400">
        No comments yet. Be the first to comment!
      </div>
    );
  }, [isLoading]);

  return (
    <div 
      className={`fixed inset-0 z-50 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="fixed inset-0 bg-black/50 transition-opacity"></div>
      <div
        ref={drawerRef}
        className={`fixed bottom-0 right-0 bg-slate-900 w-full sm:w-[400px] max-w-full h-[90vh] sm:h-[100vh] rounded-t-xl sm:rounded-l-xl shadow-lg transform transition-transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } flex flex-col border border-slate-700 overflow-hidden`}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Drawer handle for mobile */}
        <div className="h-2 w-10 mx-auto bg-slate-700 rounded mt-2 sm:hidden"></div>

        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Stanza text */}
        <div className="p-4 bg-slate-800 border-b border-slate-700">
          <blockquote className="text-slate-300 italic">
            {stanzaText}
          </blockquote>
        </div>

        {/* Comments list with total count */}
        <div className="px-4 py-2 border-b border-slate-700">
          <div className="font-medium text-white">
            {totalCount > 0 ? `${totalCount} Comment${totalCount !== 1 ? 's' : ''}` : 'Comments'}
          </div>
        </div>
        
        {/* Comments list with Virtuoso */}
        <div className="flex-1 overflow-hidden">
          {comments.length === 0 ? (
            <div className="p-4">
              <EmptyPlaceholder />
            </div>
          ) : (
            <Virtuoso
              style={{ height: '100%' }}
              totalCount={comments.length}
              itemContent={index => CommentItem(index)}
              endReached={loadMore}
              components={{
                Header: () => HeaderComponent,
                Footer: FooterRenderer
              }}
            />
          )}
        </div>

        {/* Add comment form */}
        <div className="p-4 border-t border-slate-700">
          <form onSubmit={handleSubmitComment} className="flex flex-col">
            <div className="mb-3">
              <textarea
                ref={commentInputRef}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !newCommentText.trim()}
                className={`px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors ${
                  (isLoading || !newCommentText.trim())
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};