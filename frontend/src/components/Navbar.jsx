import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, clear } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clear();
    navigate('/login');
  };

  const desktopLinkClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 px-3 flex-1 text-[11px] font-medium transition-all ${
      isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
    }`;

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="7" y1="8" x2="7" y2="16" />
                <line x1="11" y1="8" x2="11" y2="16" />
                <line x1="14" y1="8" x2="14" y2="16" />
                <line x1="17" y1="8" x2="17" y2="16" />
              </svg>
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                Scan<span className="text-emerald-400">&amp;</span>Go
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Express
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>
                <NavLink to="/" end className={desktopLinkClass}>
                  Scan
                </NavLink>
                <NavLink to="/cart" className={desktopLinkClass}>
                  Cart
                  {count > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                      {count}
                    </span>
                  )}
                </NavLink>
                <NavLink to="/orders" className={desktopLinkClass}>
                  Orders
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className={desktopLinkClass}>
                    Admin Gate
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <NavLink to="/login" className={desktopLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={desktopLinkClass}>
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* User Status / Action */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">{user.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <NavLink to="/login" className="btn btn-primary text-xs py-2 px-3">
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Dock Navigation for Mobile (Native App Experience) */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 pb-safe">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            <NavLink to="/" end className={mobileLinkClass}>
              <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Scan</span>
            </NavLink>

            <NavLink to="/cart" className={mobileLinkClass}>
              <div className="relative">
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-500 text-slate-950 animate-bounce">
                    {count}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </NavLink>

            <NavLink to="/orders" className={mobileLinkClass}>
              <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Orders</span>
            </NavLink>

            {user.role === 'admin' && (
              <NavLink to="/admin" className={mobileLinkClass}>
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin</span>
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
