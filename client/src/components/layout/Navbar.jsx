import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Mic, Search, User, LogOut, LayoutDashboard, Home as HomeIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel h-16 flex items-center justify-between px-6 border-b border-white/5">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Mic size={20} className="text-black" />
          </div>
          <span className="font-display text-2xl tracking-widest text-primary">WAVCAST</span>
        </Link>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
          <input 
            type="text" 
            placeholder="Search podcasts, episodes, creators..." 
            className="w-full bg-surface/50 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            onClick={() => navigate('/discover')}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1 text-sm font-medium text-textMuted hover:text-primary transition-colors">
          <HomeIcon size={18} className="md:hidden" />
          <span className="hidden md:block">Home</span>
        </Link>
        <Link to="/discover" className="text-sm font-medium text-textMuted hover:text-primary transition-colors hidden md:block">Discover</Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            {user.role === 'creator' && (
              <Link to="/dashboard" className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-white transition-colors">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + user.name + '&background=random' }}
                />
              </div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-textMuted capitalize">{user.role}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                  <User size={16} /> Profile
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors text-left">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium hover:text-white text-textMuted transition-colors">Log in</Link>
            <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
