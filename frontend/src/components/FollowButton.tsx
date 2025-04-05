import { useAuthContext } from '../hooks/useAuthContext';
import { useCheckFollowing, useFollowActions } from '../hooks/useFollows';

interface FollowButtonProps {
  userId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const FollowButton = ({ userId, size = 'md' }: FollowButtonProps) => {
  const { authUser } = useAuthContext();
  const { data: isFollowing, isLoading: isCheckLoading } = useCheckFollowing(userId);
  const { 
    followUser, 
    unfollowUser, 
    isFollowLoading, 
    isUnfollowLoading 
  } = useFollowActions();

  // Don't show button if viewing own profile
  if (!authUser || authUser.id === userId) {
    return null;
  }

  const isLoading = isCheckLoading || isFollowLoading || isUnfollowLoading;

  const handleFollowAction = () => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1',
    md: 'px-4 py-2',
    lg: 'text-lg px-5 py-2'
  };

  return (
    <button
      className={`${sizeClasses[size]} rounded-md ${
        isFollowing 
          ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
      } transition-colors ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      onClick={handleFollowAction}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading
        </span>
      ) : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;