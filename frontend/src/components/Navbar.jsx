import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import {
  Home,
  Building2,
  GitCompareArrows,
  Heart,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-surface-800/80 backdrop-blur-xl">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="gradient-text">PropConnect</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>
              <Home size={16} />
              Home
            </NavLink>
            <NavLink to="/properties" className={navLinkClass}>
              <Building2 size={16} />
              Properties
            </NavLink>
            <NavLink to="/compare" className={navLinkClass}>
              <GitCompareArrows size={16} />
              Compare
              {compareList.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              )}
            </NavLink>
            {user && (
              <NavLink to="/saved" className={navLinkClass}>
                <Heart size={16} />
                Saved
              </NavLink>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 transition-all text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-slate-300">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-surface-700 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink to="/login" className="btn-secondary text-sm py-2 px-4">
                  <LogIn size={15} />
                  Login
                </NavLink>
                <NavLink to="/register" className="btn-primary text-sm py-2 px-4">
                  <UserPlus size={15} />
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 py-4 space-y-1">
            <NavLink to="/" className={navLinkClass} end onClick={() => setMobileOpen(false)}>
              <Home size={16} /> Home
            </NavLink>
            <NavLink to="/properties" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <Building2 size={16} /> Properties
            </NavLink>
            <NavLink to="/compare" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <GitCompareArrows size={16} /> Compare
              {compareList.length > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {compareList.length}
                </span>
              )}
            </NavLink>
            {user && (
              <NavLink to="/saved" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                <Heart size={16} /> Saved
              </NavLink>
            )}
            <div className="border-t border-white/8 pt-3 mt-3 space-y-2">
              {user ? (
                <div>
                  <p className="px-3 text-sm text-slate-400 mb-2">
                    Signed in as <span className="text-white font-medium">{user.name}</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <NavLink to="/login" className="btn-secondary justify-center" onClick={() => setMobileOpen(false)}>
                    <LogIn size={15} /> Login
                  </NavLink>
                  <NavLink to="/register" className="btn-primary justify-center" onClick={() => setMobileOpen(false)}>
                    <UserPlus size={15} /> Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
