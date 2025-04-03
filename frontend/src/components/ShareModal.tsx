import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 w-full max-w-md z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Share Poem</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-l-lg text-white focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-r-lg transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};