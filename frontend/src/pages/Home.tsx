import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useMyPoems, Poem } from "../hooks/usePoems";
import { useDeletePoem } from "../hooks/useDeletePoem";

export const Home = () => {
  useAuthRedirect();
  const { authUser } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    poems, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pagesCount
  } = useMyPoems(12); // Fetch 12 items per page
  const { deletePoem, isLoading: isDeleting } = useDeletePoem();
  
  // Set up infinite scrolling
  const observerTarget = useRef(null);

  const handleObserver = useCallback(
    (entries: any) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]
  );

  // Get initials from username
  const initials = authUser?.username 
    ? authUser.username.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  // Set up the observer effect
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });
    
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [handleObserver]);

  // Filter poems based on search query
  const filteredPoems = searchQuery.trim()
    ? poems.filter(poem => {
        const stanzaText = poem.stanzas.map(s => s.body).join(' ').toLowerCase();
        const titleText = poem.title.toLowerCase();
        const searchTerm = searchQuery.toLowerCase();
        return stanzaText.includes(searchTerm) || titleText.includes(searchTerm);
      })
    : poems;

  // Format preview text
  const formatPreview = (poem: Poem) => {
    if (poem.stanzas.length === 0) return "Empty poem";
    
    // Get the first stanza
    const firstStanza = poem.stanzas[0].body;
    
    // Truncate if needed
    if (firstStanza.length > 120) {
      return firstStanza.substring(0, 120) + '...';
    }
    
    return firstStanza;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col min-h-[90vh]">
        {/* Header */}
        <header className="py-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">Po-it</span>
              </h1>
              <span className="bg-cyan-500/20 text-cyan-200 text-xs px-2 py-1 rounded-full">My Poems</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/explore" className="text-slate-300 hover:text-white transition-colors">
                Explore
              </Link>
              <div className="relative">
                <button className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-slate-800/40 hover:bg-slate-700/60 transition-colors">
                  <span className="text-sm font-medium">{initials}</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search poems..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {`${error}`}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : poems.length === 0 ? (
            /* Empty state */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-cyan-500/10 w-16 h-16 mb-6 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No poems yet</h3>
                <p className="text-slate-400 mb-6 max-w-md">Create your first poem to get started. Express yourself through words and share your creativity.</p>
                <Link 
                  to="/poems/create"
                  className="inline-flex items-center px-4 h-10 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create new poem
                </Link>
              </div>
            </div>
          ) : (
            /* Poem list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {filteredPoems.length === 0 ? (
                <div className="md:col-span-2 text-center py-10">
                  <p className="text-slate-400">No poems match your search</p>
                </div>
              ) : (
                filteredPoems.map(poem => (
                  <div
                    key={poem.id}
                    className="block bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-600/30 hover:bg-slate-800/80 transition-colors shadow-md hover:shadow-cyan-500/10"
                  >
                    <Link to={`/poems/${poem.id}`} className="block">
                      <div className="mb-2 font-medium text-white text-lg">
                        {poem.title}
                      </div>
                      <div className="mb-3 text-xs text-slate-500">
                        {new Date(poem.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="prose prose-slate prose-invert max-w-none mb-4 text-slate-300 line-clamp-4 whitespace-pre-wrap">
                        {formatPreview(poem)}
                      </div>
                    </Link>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">{poem.stanzas.length} stanza{poem.stanzas.length !== 1 ? 's' : ''}</span>
                      <div className="flex space-x-2">
                        <Link 
                          to={`/poems/${poem.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-700"
                          aria-label="Edit poem"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 0 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </Link>
                        <button 
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this poem? This action cannot be undone.')) {
                              await deletePoem(poem.id);
                              refetch();
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-700"
                          aria-label="Delete poem"
                          disabled={isDeleting}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Loading indicator at the bottom for infinite scroll */}
              {!searchQuery && (
                <div 
                  ref={observerTarget} 
                  className="md:col-span-2 py-8 flex justify-center"
                >
                  {isFetchingNextPage && (
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                  )}
                  {!hasNextPage && poems.length > 0 && pagesCount > 1 && (
                    <p className="text-slate-500 text-sm">No more poems to load</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Floating action button (mobile only) */}
        <div className="fixed bottom-6 right-6">
          <Link 
            to="/poems/create"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center hover:from-cyan-600 hover:to-cyan-800 transition-all hover:shadow-cyan-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;