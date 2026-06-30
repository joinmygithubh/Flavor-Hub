import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import SafeImage from '../ui/SafeImage.jsx';
import Rating from '../ui/Rating.jsx';
import VegBadge from '../ui/VegBadge.jsx';
import { useCartStore } from '../../store/cartStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { formatCurrency } from '../../utils/format.js';

/**
 * Dish card for the listing grid. Rounded-2xl, soft shadow that lifts on hover,
 * with a subtle scale animation. The whole card links to the detail page; the
 * "Add" button adds straight to the cart with default options.
 */
const DishCard = ({ dish }) => {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const handleQuickAdd = (e) => {
    // Prevent the wrapping <Link> from navigating when the button is clicked.
    e.preventDefault();
    addItem(dish, { quantity: 1 });
    toast.success(`${dish.name} added to cart`);
    openCart();
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link
        to={`/dishes/${dish._id}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-card-hover dark:bg-white/5"
      >
        <div className="relative">
          <SafeImage src={dish.image} alt={dish.name} />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary-600 shadow-sm backdrop-blur dark:bg-charcoal/80">
            {dish.cuisine}
          </span>
          <span className="absolute right-3 top-3 rounded-md bg-white/90 p-1 shadow-sm backdrop-blur dark:bg-charcoal/80">
            <VegBadge isVeg={dish.isVeg} />
          </span>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-base font-semibold text-charcoal dark:text-cream">
              {dish.name}
            </h3>
            <Rating value={dish.rating} />
          </div>

          <p className="line-clamp-2 text-sm text-charcoal/55 dark:text-cream/55">
            {dish.description}
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs text-charcoal/50 dark:text-cream/50">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {dish.prepTime} min
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-display text-lg font-bold text-charcoal dark:text-cream">
              {formatCurrency(dish.price)}
            </span>
            <button
              type="button"
              onClick={handleQuickAdd}
              className="btn-primary px-4 py-2 text-sm"
              aria-label={`Add ${dish.name} to cart`}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DishCard;
