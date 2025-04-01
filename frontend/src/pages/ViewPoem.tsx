import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { useDeletePoem } from '../hooks/useDeletePoem';
import { Poem } from '../hooks/usePoems';

interface ExtendedPoem extends Poem {
  isOwner?: boolean;
  user?: {
    id: string;
    username: string;
    profilePic: string;
  };
}

export const ViewPoem = () => {
  useAuthRedirect();
  const { poemId } = useParams<{ poemId: string }>();
  const navigate = useNavigate();
  const [poem, setPoem] = useState<ExtendedPoem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deletePoem, isLoading: isDeleting, error: deleteError } = useDeletePoem();

  useEffect(() => {
    const fetchPoem = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.HOST_DOMAIN}/api/poems/${poemId}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch poem');
        }
        
        const data = await response.json();
        setPoem(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (poemId) {
      fetchPoem();
    }
  }, [poemId]);

  const formattedDate = poem?.updatedAt 
    ? new Date(poem.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex flex-col min-h-[90vh]">
        {/* Header */}
        <header className="py-6 mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Poem</h1>
          </div>
        </header>
        
        {/* Error display */}
        {(error || deleteError) && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error || deleteError}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : poem ? (
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
              <h2 className="text-2xl font-semibold text-white mb-2">{poem.title}</h2>
              
              <div className="mb-6 flex justify-between items-center">
                <div className="text-sm text-slate-400">
                  {formattedDate}
                </div>
                {poem.user && (
                  <div className="text-sm text-cyan-400">
                    by {poem.user.username}
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                {poem.stanzas.map((stanza) => (
                  <div key={stanza.id} className="leading-relaxed whitespace-pre-wrap text-slate-200">
                    {stanza.body}
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-6 border-t border-slate-700 flex justify-between items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                
                <div className="flex space-x-3">
                  {/* Only show edit/delete buttons if user is the owner */}
                  {poem.isOwner && (
                    <>
                      <button 
                        onClick={() => navigate(`/poems/${poemId}/edit`)}
                        className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-700"
                        aria-label="Edit poem"
                        disabled={isDeleting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 0 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this poem? This action cannot be undone.')) {
                            deletePoem(poemId as string);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-700"
                        aria-label="Delete poem"
                        disabled={isDeleting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Poem not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};