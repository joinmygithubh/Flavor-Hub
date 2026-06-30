import { NavLink, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, User } from 'lucide-react';
import clsx from 'clsx';
import { useCartStore } from '../../store/cartStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { useAuth } from '../../context/AuthContext.jsx';

/** Bottom navigation bar shown on mobile only. */
const MobileNav = () => {
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useUIStore((s) => s.openCart);
  const { isAuthenticated } = useAuth();

  const linkClass = ({ isActive }) =>
    clsx(
      'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition',
      isActive ? 'text-primary-500' : 'text-charcoal/50 dark:text-cream/50'
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-black/5 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/10 dark:bg-charcoal/95 md:hidden">
      <NavLink to="/" className={linkClass} end>
        <Home size={20} /> Home
      </NavLink>
      <NavLink to="/dishes" className={linkClass}>
        <UtensilsCrossed size={20} /> Menu
      </NavLink>
      <button onClick={openCart} className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-charcoal/50 dark:text-cream/50">
        <span className="relative">
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </span>
        Cart
      </button>
      <button
        onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
        className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-charcoal/50 dark:text-cream/50"
      >
        <User size={20} /> {isAuthenticated ? 'Profile' : 'Sign in'}
      </button>
    </nav>
  );
};

export default MobileNav;
