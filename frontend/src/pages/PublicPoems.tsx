import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { usePublicPoems, Poem } from "../hooks/usePoems";
import { UserAvatar } from "../components/UserAvatar";
import { SearchMatchHighlights } from "../components/SearchMatchHighlights";

export const PublicPoems = () => {
  useAuthRedirect();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Set up search debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);
  
  const { 
    poems, 
    isLoading, 
    error, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pagesCount,
  } = usePublicPoems(12, debouncedSearchQuery); // Fetch 12 items per page with search query
  
  // Set up infinite scrolling
  const observerTarget = useRef(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]
  );

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

  // We no longer need client-side filtering as it's done server-side
  const filteredPoems = poems;

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
              <span className="bg-cyan-500/20 text-cyan-200 text-xs px-2 py-1 rounded-full">Explore</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                My Poems
              </Link>
              <UserAvatar />
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
            placeholder="Search poems or authors..."
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
                <p className="text-slate-400 mb-6 max-w-md">There are no published poems yet. Be the first to share your creativity!</p>
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
                  <Link
                    key={poem.id}
                    to={`/poems/${poem.id}`}
                    className="block bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-600/30 hover:bg-slate-800/80 transition-colors shadow-md hover:shadow-cyan-500/10"
                  >
                    <div className="mb-2 font-medium text-white text-lg">
                      {poem.title}
                    </div>
                    <div className="mb-3 text-xs flex justify-between">
                      <span className="text-slate-500">
                        {new Date(poem.updatedAt).toLocaleDateString()}
                      </span>
                      {poem.user && (
                        <span className="text-cyan-400">
                          by {poem.user.username}
                        </span>
                      )}
                    </div>
                    <div className="prose prose-slate prose-invert max-w-none mb-2 text-slate-300 line-clamp-4 whitespace-pre-wrap">
                      {formatPreview(poem)}
                    </div>
                    
                    {/* Show search match highlights */}
                    {debouncedSearchQuery && poem.searchMatches && (
                      <SearchMatchHighlights 
                        searchMatches={poem.searchMatches} 
                        searchQuery={debouncedSearchQuery}
                      />
                    )}
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{poem.stanzas.length} stanza{poem.stanzas.length !== 1 ? 's' : ''}</span>
                      {poem.isOwner && (
                        <span className="bg-slate-700 px-2 py-1 rounded text-slate-300">Your poem</span>
                      )}
                    </div>
                  </Link>
                ))
              )}
              
              {/* Loading indicator at the bottom for infinite scroll */}
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

export default PublicPoems;