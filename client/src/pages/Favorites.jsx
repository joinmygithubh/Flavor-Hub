import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import DishCard from '../components/dish/DishCard.jsx';
import { DishGridSkeleton } from '../components/ui/Skeletons.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { userService } from '../api/userService.js';
import { useFavoriteStore } from '../store/favoriteStore.js';

/** Lists the dishes the user has favorited. */
const Favorites = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Re-fetch when the favorite id set changes (e.g. user un-hearts from this page).
  const favIds = useFavoriteStore((s) => s.ids);

  useEffect(() => {
    let active = true;
    userService
      .getFavorites()
      .then((data) => active && setDishes(data))
      .catch(() => active && setDishes([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Keep the displayed list in sync if an item is removed via its heart toggle.
  const visible = dishes.filter((d) => favIds.includes(d._id));

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-500">
          <Heart size={22} className="fill-primary-500" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold">Your favorites</h1>
          <p className="text-charcoal/55 dark:text-cream/55">
            {visible.length} {visible.length === 1 ? 'dish' : 'dishes'} saved
          </p>
        </div>
      </div>

      {loading ? (
        <DishGridSkeleton count={8} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          message="Tap the heart on any dish to save it here for quick access later."
          action={<Link to="/dishes" className="btn-primary">Browse dishes</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((dish) => (
            <DishCard key={dish._id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
