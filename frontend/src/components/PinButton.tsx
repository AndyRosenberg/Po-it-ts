import React, { useEffect, useState } from 'react';
import { usePoemPinsCount, useIsPoemPinned, usePinPoem, useUnpinPoem } from '../hooks/useCollections';
import { useAuthContext } from '../hooks/useAuthContext';

interface PinButtonProps {
  poemId: string;
  poemUserId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const PinButton: React.FC<PinButtonProps> = ({
  poemId,
  poemUserId,
  size = 'md',
  showCount = true
}) => {
  const { authUser: user } = useAuthContext();
  const isOwnPoem = user?.id === poemUserId;

  // Local state to track pinned status
  const [isPinned, setIsPinned] = useState(false);
  const [pinId, setPinId] = useState('');

  const { data: pinsCount = 0, isLoading: isCountLoading } = usePoemPinsCount(poemId);
  const {
    data: pinStatus,
    isLoading: isPinnedLoading,
    refetch: refetchPinStatus
  } = useIsPoemPinned(poemId);

  const pinMutation = usePinPoem();
  const unpinMutation = useUnpinPoem();

  // Update local state when pinStatus changes
  useEffect(() => {
    if (pinStatus) {
      setIsPinned(pinStatus.isPinned || false);
      setPinId(pinStatus.pinId || '');
    }
  }, [pinStatus]);

  const isLoading = isCountLoading || isPinnedLoading || pinMutation.isPending || unpinMutation.isPending;

  const handlePin = async(e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      // User is not logged in
      return;
    }

    if (isOwnPoem) {
      // User should not pin their own poems
      return;
    }

    if (isPinned) {
      // If it's pinned, try to unpin it
      if (pinId) {
        unpinMutation.mutate({ pinId, poemId });
      } else {
        // If we have no pinId but it's pinned, something went wrong
        // Refresh the pin status and try again
        await refetchPinStatus();
        return;
      }
    } else {
      // If it's not pinned, pin it
      pinMutation.mutate(poemId);
    }
  };

  // Size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Spinner size classes
  const spinnerSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Function to stop event propagation
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    // Use a higher z-index and prevent events from reaching the parent
    <div
      className="flex items-center relative z-10"
      onClick={stopPropagation}
      style={{ cursor: 'default' }}
    >
      <button
        onClick={handlePin}
        disabled={isLoading || isOwnPoem || !user}
        className={`
          ${buttonSizeClasses[size]} 
          rounded-full
          ${isOwnPoem
      ? 'text-amber-500'
      : isPinned
        ? 'text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20'
        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700'
    }
          transition-colors
          disabled:opacity-50 disabled:hover:bg-transparent
          disabled:cursor-not-allowed
        `}
        style={{ cursor: isOwnPoem ? 'default' : 'pointer' }}
        title={isOwnPoem ? "You cannot pin your own poems" : isPinned ? "Remove from collection" : "Add to collection"}
        aria-label={isOwnPoem ? "You cannot pin your own poems" : isPinned ? "Remove from collection" : "Add to collection"}
      >
        {isLoading ? (
          <div className={`animate-spin rounded-full border-2 border-t-transparent ${spinnerSizeClasses[size]}`}></div>
        ) : isPinned ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconSizeClasses[size]}
          >
            <line x1="12" y1="17" x2="12" y2="22" strokeWidth="2" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconSizeClasses[size]}
          >
            <line x1="12" y1="17" x2="12" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        )}
      </button>

      {showCount && (
        <span className={`ml-1 ${textSizeClasses[size]} text-slate-400`}>
          {isCountLoading ? '...' : pinsCount}
        </span>
      )}
    </div>
  );
};

export default PinButton;