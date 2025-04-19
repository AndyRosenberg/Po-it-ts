import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";

interface HeaderProps {
  label?: string;
  navLinkPath?: string;
  navLinkLabel?: string;
}

export const Header = ({ label, navLinkPath = '/explore', navLinkLabel = 'Explore' }: HeaderProps) => {
  return (
    <header className="py-6 mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">
            <Link to="/" className="hover:opacity-90 transition-opacity">
              <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">Po-it</span>
            </Link>
          </h1>
          {label && (
            <span className="bg-cyan-500/20 text-cyan-200 text-xs px-2 py-1 rounded-full">
              {label}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {navLinkPath?.length && (
            <Link to={navLinkPath} className="text-slate-300 hover:text-white transition-colors">
              {navLinkLabel}
            </Link>
          )}
          <UserAvatar />
        </div>
      </div>
    </header>
  );
};