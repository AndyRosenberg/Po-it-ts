import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useFeedPoems } from "../hooks/usePoems";
import { Header } from "../components/Header";
import { PoemCard } from "../components/PoemCard";

export const Home = () => {
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
  
  // Fetch feed poems
  const { 
    poems, 
    isLoading, 
    error, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pagesCount
  } = useFeedPoems(12, debouncedSearchQuery);


  // Infinite scroll with Intersection Observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer if we have a target and more content to load
    if (observerTargetRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const target = entries[0];
          if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(observerTargetRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, poems.length]);

  // Format poems for grid layout - wrap in useMemo to avoid dependency issues
  const formattedPoems = useMemo(() => {
    const result = [];
    for (let i = 0; i < poems.length; i += 2) {
      const rowPoems = [poems[i]];
      if (i + 1 < poems.length) {
        rowPoems.push(poems[i + 1]);
      }
      result.push(rowPoems);
    }
    return result;
  }, [poems]);

  // Render each row of poems (1 or 2 poems per row based on viewport)
  const ItemRenderer = useCallback(
    (index: number) => {
      const rowPoems = formattedPoems[index];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {rowPoems.map((poem) => (
            <PoemCard
              key={poem.id}
              poem={poem}
              searchQuery={debouncedSearchQuery}
            />
          ))}
        </div>
      );
    },
    [formattedPoems, debouncedSearchQuery]
  );

  // Render footer with loading state
  const FooterRenderer = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      );
    }
    
    if (!hasNextPage && poems.length > 0 && pagesCount > 1) {
      return (
        <div className="py-8 flex justify-center">
          <p className="text-slate-500 text-sm">No more poems to load</p>
        </div>
      );
    }
    
    return null;
  }, [isFetchingNextPage, hasNextPage, poems.length, pagesCount]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col min-h-[90vh]">
        {/* Header */}
        <Header label="Feed" navLinkPath="/explore" navLinkLabel="Explore" />
        
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
        <div className="flex-1">
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
                <p className="text-slate-400 mb-6 max-w-md">Your feed shows your poems and poems from poets you follow. Start by creating your own poem or discover new voices.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/poems/create"
                    className="inline-flex items-center px-4 h-10 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create a poem
                  </Link>
                  <Link 
                    to="/explore"
                    className="inline-flex items-center px-4 h-10 border border-cyan-500/50 bg-transparent hover:bg-cyan-500/10 text-cyan-400 font-medium rounded-lg transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Explore poets
                  </Link>
                </div>
              </div>
            </div>
          ) : poems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400">No poems match your search</p>
            </div>
          ) : (
            <div className="pb-20">
              {/* Using regular mapping with scroll event listener for pagination */}
              <div className="space-y-6">
                {formattedPoems.map((rowPoems, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {rowPoems.map((poem) => (
                      <PoemCard
                        key={poem.id}
                        poem={poem}
                        searchQuery={debouncedSearchQuery}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Load observer target and loading indicator */}
              <div className="py-8 flex justify-center" ref={observerTargetRef}>
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

export default Home;