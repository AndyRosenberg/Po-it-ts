import React from 'react';
import { SearchMatches } from '../hooks/usePoems';

interface SearchMatchHighlightsProps {
  searchMatches?: SearchMatches;
  searchQuery: string;
}

export const SearchMatchHighlights: React.FC<SearchMatchHighlightsProps> = ({ 
  searchMatches, 
  searchQuery 
}) => {
  if (!searchMatches || !searchQuery.trim() || 
      (searchMatches.matchingStanzas.length === 0 && !searchMatches.titleMatch && !searchMatches.usernameMatch)) {
    return null;
  }

  // Get the search term length for highlighting
  const searchTermLength = searchQuery.trim().length;

  // Format a snippet with highlighted text
  const formatSnippet = (snippet: string, matchIndex: number) => {
    if (matchIndex < 0) return <span>{snippet}</span>;
    
    const beforeMatch = snippet.substring(0, matchIndex);
    const match = snippet.substring(matchIndex, matchIndex + searchTermLength);
    const afterMatch = snippet.substring(matchIndex + searchTermLength);
    
    return (
      <>
        <span>{beforeMatch}</span>
        <span className="bg-cyan-500/30 text-white px-0.5 rounded">{match}</span>
        <span>{afterMatch}</span>
      </>
    );
  };

  return (
    <div className="mt-3 text-xs">
      <div className="border-l-2 border-cyan-500/50 pl-2 space-y-2 text-slate-300">
        {/* Title matches */}
        {searchMatches.titleMatch && (
          <div>
            <span className="text-cyan-400 font-medium">Title match</span>
          </div>
        )}
        
        {/* Username matches */}
        {searchMatches.usernameMatch && (
          <div>
            <span className="text-cyan-400 font-medium">Author match</span>
          </div>
        )}
        
        {/* Show stanza matches */}
        {searchMatches.matchingStanzas.map((stanza) => (
          <div key={stanza.id} className="line-clamp-2">
            <span className="text-cyan-400 font-medium">Stanza {stanza.position + 1}:</span>{' '}
            <span className="whitespace-pre-wrap">{formatSnippet(stanza.snippet, stanza.matchIndex)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};