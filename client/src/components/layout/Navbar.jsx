import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Moon, Sun, LogOut, ClipboardList, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

/** Sticky top navbar: logo, search, cart (with badge), profile dropdown, theme toggle. */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useUIStore((s) => s.openCart);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the profile dropdown on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on route change.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/dishes?search=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur-md dark:border-white/10 dark:bg-charcoal/85">
      <nav className="container-page flex items-center gap-2 py-3 sm:gap-5">
        {/* Logo — wordmark hidden on the smallest screens to save room */}
        <Link to="/" className="flex shrink-0 items-center" aria-label="Flavor Hub home">
          <Logo withWordmark={false} markSize={36} className="sm:hidden" />
          <Logo withWordmark markSize={36} className="hidden sm:inline-flex" />
        </Link>

        {/* Search */}
        <form onSubmit={onSearch} className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, cuisines..."
            className="input pl-10"
            aria-label="Search dishes"
          />
        </form>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn-ghost rounded-full" aria-label="Toggle dark mode">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Cart */}
        <button onClick={openCart} className="relative btn-ghost rounded-full" aria-label="Open cart">
          <ShoppingCart size={22} />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-500 px-1 text-[11px] font-bold text-white"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Profile / Auth */}
        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 py-1 pl-1 pr-2 hover:border-primary-300 dark:border-white/15"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                {user.name?.[0]?.toUpperCase()}
              </span>
              <ChevronDown size={15} className="text-charcoal/50" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-card dark:border-white/10 dark:bg-charcoal"
                >
                  <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-charcoal/50 dark:text-cream/50">{user.email}</p>
                  </div>
                  <DropdownLink to="/profile" icon={ClipboardList}>My Orders</DropdownLink>
                  {isAdmin && <DropdownLink to="/admin" icon={LayoutDashboard}>Admin Dashboard</DropdownLink>}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-white/5"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">
            <User size={16} /> Sign in
          </Link>
        )}
      </nav>
    </header>
  );
};

const DropdownLink = ({ to, icon: Icon, children }) => (
  <Link to={to} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-white/5">
    <Icon size={16} className="text-charcoal/60 dark:text-cream/60" /> {children}
  </Link>
);

export default Navbar;
