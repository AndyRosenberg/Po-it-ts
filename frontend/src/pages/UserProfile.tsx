import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { getUserInitials } from '../utils/user-utils';
import { useUserProfile, useUserPoems } from '../hooks/useUserProfile';
import { useFollowers, useFollowing } from '../hooks/useFollows';
import FollowButton from '../components/FollowButton';
import { Poem } from '../hooks/usePoems';
import { useAuthContext } from '../hooks/useAuthContext';

const UserProfile = () => {
  useAuthRedirect();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'poems' | 'drafts' | 'followers' | 'following'>('poems');
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
   // Get current user to check if viewing own profile
   const { authUser: currentUser, isLoading: authLoading } = useAuthContext();
   const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Set up search debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    // Debug URL parameters
    console.log('URL parameters:', { 
      queryParams: Object.fromEntries(queryParams.entries()),
      tabParam,
      isOwnProfile 
    });
    
    // For 'drafts' tab, only activate if it's the user's own profile
    if (tabParam === 'drafts') {
      if (isOwnProfile) {
        setActiveTab('drafts');
        console.log('Showing drafts tab');
      } else {
        // If trying to view someone else's drafts, redirect to their poems
        setActiveTab('poems');
        navigate(`/profile/${userId}`, { replace: true });
        console.log('Redirected from drafts to poems');
      }
    } else if (tabParam === 'followers' || tabParam === 'following') {
      setActiveTab(tabParam);
    } else {
      // Check if we want to force drafts tab based on localStorage
      const forceDraftsTab = localStorage.getItem('forceDraftsTab') === 'true';
      
      if (forceDraftsTab && isOwnProfile) {
        setActiveTab('drafts');
        navigate(`/profile/${userId}?tab=drafts`, { replace: true });
        localStorage.removeItem('forceDraftsTab');
      } else {
        setActiveTab('poems');
      }
    }
  }, [location.search, userId, isOwnProfile, navigate]);
  
  // Determine if this is the user's own profile
  useEffect(() => {
    if (!authLoading && currentUser && userId) {
      const isOwn = currentUser.id === userId;
      setIsOwnProfile(isOwn);
      
      // Debug info
      console.log('Auth state:', { currentUser, userId, isOwner: isOwn });
    }
  }, [currentUser, userId, authLoading]);

  // Custom hooks for data fetching
  const { data: user, isLoading: userLoading } = useUserProfile(userId);
  const { 
    poems, 
    isLoading: poemsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPoems(userId, 12, debouncedSearchQuery, false); // false = not drafts
  
  // Fetch drafts (only for own profile)
  const { 
    poems: drafts,
    isLoading: draftsLoading,
    isFetchingNextPage: isFetchingNextDraftPage,
    fetchNextPage: fetchNextDraftPage,
    hasNextPage: hasNextDraftPage,
  } = useUserPoems(userId, 12, debouncedSearchQuery, true); // true = drafts only
  
  const { data: followers, isLoading: followersLoading } = useFollowers(userId);
  const { data: following, isLoading: followingLoading } = useFollowing(userId);
  
  // Set up infinite scrolling 
  const poemsObserverTarget = useRef(null);
  const draftsObserverTarget = useRef(null);

  // Observer for regular poems
  const handlePoemsObserver = useCallback(
    (entries: any) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !poemsLoading) {
        console.log('Fetching next page of poems');
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, poemsLoading]
  );

  // Observer for drafts
  const handleDraftsObserver = useCallback(
    (entries: any) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextDraftPage && !isFetchingNextDraftPage && !draftsLoading) {
        console.log('Fetching next page of drafts');
        fetchNextDraftPage();
      }
    },
    [fetchNextDraftPage, hasNextDraftPage, isFetchingNextDraftPage, draftsLoading]
  );

  // Set up the observer effect for poems
  useEffect(() => {
    if (activeTab !== 'poems') return;

    const observer = new IntersectionObserver(handlePoemsObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });
    
    const currentTarget = poemsObserverTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [handlePoemsObserver, activeTab]);

  // Set up the observer effect for drafts
  useEffect(() => {
    if (activeTab !== 'drafts') return;

    const observer = new IntersectionObserver(handleDraftsObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });
    
    const currentTarget = draftsObserverTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [handleDraftsObserver, activeTab]);

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
                onClick={() => {
                  setActiveTab('poems');
                  navigate(`/profile/${userId}`);
                }}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'poems'
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                Poems
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    setActiveTab('drafts');
                    navigate(`/profile/${userId}?tab=drafts`);
                  }}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === 'drafts'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-amber-300 hover:border-amber-500/50'
                  }`}
                >
                  Drafts
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('followers');
                  navigate(`/profile/${userId}?tab=followers`);
                }}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'followers'
                    ? 'border-cyan-500 text-cyan-500'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                Followers
              </button>
              <button
                onClick={() => {
                  setActiveTab('following');
                  navigate(`/profile/${userId}?tab=following`);
                }}
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
                {/* Search bar for poems tab */}
                <div className="relative mb-6">
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
                
                {poemsLoading && !isFetchingNextPage ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  </div>
                ) : poems?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No poems yet</p>
                  </div>
                ) : (
                  <>
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
                    
                    {/* Loading indicator at the bottom for infinite scroll */}
                    <div 
                      ref={poemsObserverTarget} 
                      className="py-8 flex justify-center"
                    >
                      {isFetchingNextPage && (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                      )}
                      {!isFetchingNextPage && hasNextPage && (
                        <div className="text-sm text-slate-400">Scroll for more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Drafts tab - only visible on user's own profile */}
            {activeTab === 'drafts' && isOwnProfile && (
              <div>
                {/* Search bar for drafts tab */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search drafts..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder:text-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {draftsLoading && !isFetchingNextDraftPage ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  </div>
                ) : drafts?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No drafts yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {drafts?.map((poem: Poem) => (
                        <div 
                          key={poem.id} 
                          onClick={() => navigate(`/poems/${poem.id}`)}
                          className="p-4 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-white mb-2">{poem.title}</h3>
                            <span className="px-2 py-1 text-xs rounded-md bg-amber-500/20 text-amber-200">Draft</span>
                          </div>
                          <p className="text-sm text-slate-400">
                            Last updated: {new Date(poem.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Loading indicator at the bottom for infinite scroll */}
                    <div 
                      ref={draftsObserverTarget}
                      className="py-8 flex justify-center"
                    >
                      {isFetchingNextDraftPage && (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                      )}
                      {!isFetchingNextDraftPage && hasNextDraftPage && (
                        <div className="text-sm text-slate-400">Scroll for more</div>
                      )}
                    </div>
                  </>
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