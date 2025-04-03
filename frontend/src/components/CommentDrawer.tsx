import { useState, useRef, useEffect } from 'react';
import { useComments, Comment } from '../hooks/useComments';
import { useAuthContext } from '../hooks/useAuthContext';
import { UserAvatar } from './UserAvatar';

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
  const { comments, isLoading, error, addComment, updateComment, deleteComment } = useComments(
    commentableType,
    commentableId
  );
  const { authUser } = useAuthContext();
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    
    const success = await addComment(newCommentText);
    if (success) {
      setNewCommentText('');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.body);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    
    const success = await updateComment(commentId, editingCommentText);
    if (success) {
      setEditingCommentId(null);
      setEditingCommentText('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        ref={drawerRef}
        className={`bg-slate-900 w-full sm:w-[600px] max-w-full h-[90vh] sm:h-[80vh] rounded-t-xl sm:rounded-xl shadow-lg transform transition-transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-8'
        } flex flex-col overflow-hidden border border-slate-700`}
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

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {isLoading && comments.length === 0 ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <img
                        src={comment.user.profilePic}
                        alt={`${comment.user.username}'s avatar`}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <div className="font-medium text-white">{comment.user.username}</div>
                        <div className="text-xs text-slate-400">{formatDate(comment.createdAt)}</div>
                      </div>
                    </div>

                    {/* Edit/Delete options for own comments */}
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
              ))}
            </div>
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