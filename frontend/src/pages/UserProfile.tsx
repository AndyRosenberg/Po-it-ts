import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { getUserInitials } from '../utils/user-utils';
import { useUserProfile, useUserPoems } from '../hooks/useUserProfile';
import { useFollowers, useFollowing } from '../hooks/useFollows';
import FollowButton from '../components/FollowButton';
import { Poem } from '../hooks/usePoems';

const UserProfile = () => {
  useAuthRedirect();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'poems' | 'followers' | 'following'>('poems');

  useEffect(() => setActiveTab('poems'), [userId]);
  
  // Custom hooks for data fetching
  const { data: user, isLoading: userLoading } = useUserProfile(userId);
  const { data: poems, isLoading: poemsLoading } = useUserPoems(userId);
  const { data: followers, isLoading: followersLoading } = useFollowers(userId);
  const { data: following, isLoading: followingLoading } = useFollowing(userId);

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <BackButton />
        <div className="text-center my-10">
          <h2 className="text-2xl font-bold text-white">User Not Found</h2>
          <p className="mt-4 text-slate-400">The user you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const userInitials = getUserInitials(user.username);
  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex flex-col min-h-[90vh]">
        {/* Header */}
        <header className="py-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <BackButton />
              <h1 className="text-2xl font-bold text-white">Profile</h1>
            </div>
          </div>
        </header>
        
        {/* Profile header */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <div className="inline-flex items-center justify-center rounded-full h-24 w-24 bg-slate-700 text-white text-2xl font-medium">
                {userInitials}
              </div>
            </div>
            
            {/* User info */}
            <div className="flex-1 flex flex-col items-center md:items-start">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
                <FollowButton userId={userId || ''} />
              </div>
              
              <div className="flex text-slate-300 space-x-6 mb-4">
                <button 
                  onClick={() => setActiveTab('followers')}
                  className="flex flex-col items-center md:items-start hover:text-cyan-400 transition-colors"
                >
                  <span className="font-semibold">{followers?.length || 0}</span>
                  <span className="text-sm text-slate-400">followers</span>
                </button>
                <button 
                  onClick={() => setActiveTab('following')}
                  className="flex flex-col items-center md:items-start hover:text-cyan-400 transition-colors"
                >
                  <span className="font-semibold">{following?.length || 0}</span>
                  <span className="text-sm text-slate-400">following</span>
                </button>
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-semibold">{poems?.length || 0}</span>
                  <span className="text-sm text-slate-400">poems</span>
                </div>
              </div>
              
              <div className="text-sm text-slate-400">
                Joined {formattedDate}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700">
          <div className="border-b border-slate-700">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('poems')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'poems'
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                Poems
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'followers'
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                Followers
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'following'
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                Following
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          <div className="p-6">
            {/* Poems tab */}
            {activeTab === 'poems' && (
              <div>
                {poemsLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  </div>
                ) : poems?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No poems yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {poems?.map((poem: Poem) => (
                      <div 
                        key={poem.id} 
                        onClick={() => navigate(`/poems/${poem.id}`)}
                        className="p-4 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                      >
                        <h3 className="text-lg font-medium text-white mb-2">{poem.title}</h3>
                        <p className="text-sm text-slate-400">
                          {new Date(poem.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Followers tab */}
            {activeTab === 'followers' && (
              <div>
                {followersLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  </div>
                ) : followers?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No followers yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followers?.map(follower => (
                      <div key={follower.id} className="flex justify-between items-center p-3 border-b border-slate-700">
                        <Link 
                          to={`/profile/${follower.id}`} 
                          className="flex items-center space-x-3 text-white hover:text-cyan-400 transition-colors"
                        >
                          <div className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-slate-700 text-white text-sm">
                            {getUserInitials(follower.username)}
                          </div>
                          <span>{follower.username}</span>
                        </Link>
                        <FollowButton userId={follower.id} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Following tab */}
            {activeTab === 'following' && (
              <div>
                {followingLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  </div>
                ) : following?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Not following anyone yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {following?.map(followed => (
                      <div key={followed.id} className="flex justify-between items-center p-3 border-b border-slate-700">
                        <Link 
                          to={`/profile/${followed.id}`} 
                          className="flex items-center space-x-3 text-white hover:text-cyan-400 transition-colors"
                        >
                          <div className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-slate-700 text-white text-sm">
                            {getUserInitials(followed.username)}
                          </div>
                          <span>{followed.username}</span>
                        </Link>
                        <FollowButton userId={followed.id} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;