import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { Header } from "../components/Header";

export const Settings = () => {
  useAuthRedirect();
  const { authUser } = useAuthContext();
  const { updateUser, isLoading, error, success } = useUpdateUser();
  const { deleteAccount, isLoading: isDeleting, error: deleteError } = useDeleteAccount();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (authUser) {
      setUsername(authUser.username);
      setEmail(authUser.email);
    }
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: any = {};
    
    // Only include fields that have changed
    if (username !== authUser?.username) userData.username = username;
    if (email !== authUser?.email) userData.email = email;
    
    // Handle password update if provided
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert("New passwords don't match");
        return;
      }
      if (!currentPassword) {
        alert("Current password is required to change password");
        return;
      }
      userData.password = newPassword;
      userData.currentPassword = currentPassword;
    }
    
    // Only proceed if there are changes to update
    if (Object.keys(userData).length > 0) {
      await updateUser(userData);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      return;
    }
    
    if (window.confirm("Are you absolutely sure? This action cannot be undone.")) {
      await deleteAccount(deletePassword);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="flex flex-col min-h-[90vh]">
        {/* Header */}
        <Header label="Settings" />
        
        {/* Content */}
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
          
          {(error || deleteError) && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error || deleteError}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100"
                required
              />
              <p className="mt-1 text-sm text-slate-500">Username must be unique.</p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100"
                required
              />
              <p className="mt-1 text-sm text-slate-500">Email must be unique.</p>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <h2 className="text-xl font-medium mb-4">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 h-12 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/10 transition-all hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 h-12 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 font-medium rounded-lg transition-all"
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70" 
            onClick={() => setShowDeleteModal(false)}
          ></div>
          
          {/* Modal content */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 w-full max-w-md z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Delete Account</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-slate-300 mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="deletePassword" className="block text-sm font-medium text-slate-300 mb-1">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg bg-slate-700 border border-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;