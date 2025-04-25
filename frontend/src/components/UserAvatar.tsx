import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { getUserInitials } from "../utils/user-utils";
import { useLogout } from "../hooks/useLogout";

type UserAvatarProps = {
  highlight?: boolean;
};

export const UserAvatar = ({ highlight = false }: UserAvatarProps) => {
  const { authUser: user, logoutAndNavigate } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = getUserInitials(user?.username);

  useEffect(() => {
    // Handle clicks outside of dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async() => {
    setIsOpen(false);
    
    // Use the proper logout flow from AuthContext
    logoutAndNavigate(navigate);
    
    // Call the API to logout (clean up server-side)
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center rounded-full h-10 w-10 ${
          highlight ? 'bg-cyan-800/40 hover:bg-cyan-700/60' : 'bg-slate-800/40 hover:bg-slate-700/60'
        } transition-colors cursor-pointer`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium">{initials}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 py-1"
          style={{ opacity: 1, transition: 'opacity 100ms ease-out' }}
        >
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm leading-tight font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs leading-tight text-slate-400 truncate">{user?.email}</p>
          </div>
          <Link
            to={`/profile/${user?.id}`}
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};