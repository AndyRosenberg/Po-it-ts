import { Link } from "react-router-dom";
import { Poem } from "../hooks/usePoems";
import { SearchMatchHighlights } from "./SearchMatchHighlights";
import { memo, useMemo } from "react";

interface PoemCardProps {
  poem: Poem;
  searchQuery?: string;
}

export const PoemCard: React.FC<PoemCardProps> = ({
  poem,
  searchQuery,
}) => {
  // Format preview text - memoize to avoid recalculating on every render
  const preview = useMemo(() => {
    if (poem.stanzas.length === 0) return "Empty poem";
    
    // Get the first stanza
    const firstStanza = poem.stanzas[0].body;
    
    // Truncate if needed
    if (firstStanza.length > 120) {
      return firstStanza.substring(0, 120) + '...';
    }
    
    return firstStanza;
  }, [poem.stanzas]);

  // Pre-format the date to avoid formatting on each render
  const formattedDate = useMemo(() => {
    return new Date(poem.updatedAt).toLocaleDateString();
  }, [poem.updatedAt]);

  return (
    <div
      className="block bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-cyan-600/30 hover:bg-slate-800/80 transition-colors shadow-md hover:shadow-cyan-500/10"
    >
      <Link to={`/poems/${poem.id}`} className="block">
        <div className="mb-2 font-medium text-white text-lg">
          {poem.title}
        </div>
        <div className="mb-3 text-xs flex justify-between">
          <span className="text-slate-500">
            {formattedDate}
          </span>
          {poem.user && (
            <span className={poem.isOwner ? 'text-orange-300' : 'text-cyan-400'}>
              {poem.isOwner ? 'your poem' : `by ${poem.user.username}`}
            </span>
          )}
        </div>
        <div className="prose prose-slate prose-invert max-w-none mb-2 text-slate-300 line-clamp-4 whitespace-pre-wrap">
          {preview}
        </div>
        
        {/* Show search match highlights */}
        {searchQuery && poem.searchMatches && (
          <SearchMatchHighlights 
            searchMatches={poem.searchMatches} 
            searchQuery={searchQuery}
          />
        )}
      </Link>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">{poem.stanzas.length} stanza{poem.stanzas.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

// Optimize rendering with React.memo to prevent unnecessary re-renders
export default memo(PoemCard);