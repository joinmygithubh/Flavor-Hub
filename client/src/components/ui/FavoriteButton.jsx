import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useFavoriteStore } from '../../store/favoriteStore.js';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Heart toggle for favoriting a dish. Works on cards (compact, floating) and on
 * the detail page (large). Unauthenticated users are routed to login.
 */
const FavoriteButton = ({ dishId, size = 'sm', className = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isFavorite = useFavoriteStore((s) => s.ids.includes(dishId));
  const toggle = useFavoriteStore((s) => s.toggle);

  const onClick = async (e) => {
    // Prevent triggering a wrapping link (e.g. the dish card).
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      toast('Sign in to save your favorites');
      return;
    }
    try {
      const nowFav = await toggle(dishId);
      toast.success(nowFav ? 'Added to favorites' : 'Removed from favorites');
    } catch {
      toast.error('Could not update favorites');
    }
  };

  const dims = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const icon = size === 'lg' ? 22 : 18;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      className={clsx(
        'flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white dark:bg-charcoal/80',
        dims,
        className
      )}
    >
      <Heart
        size={icon}
        className={clsx(
          'transition',
          isFavorite ? 'fill-primary-500 text-primary-500' : 'text-charcoal/50 dark:text-cream/60'
        )}
      />
    </motion.button>
  );
};

export default FavoriteButton;
