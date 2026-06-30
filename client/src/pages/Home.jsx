import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Truck, Clock3, BadgeCheck } from 'lucide-react';
import CuisineChips from '../components/dish/CuisineChips.jsx';
import DishCard from '../components/dish/DishCard.jsx';
import { DishGridSkeleton } from '../components/ui/Skeletons.jsx';
import { dishService } from '../api/dishService.js';

/** Landing page: hero + search, cuisine chips, value props, and top-rated dishes. */
const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dishService
      .listDishes({ sort: 'rating', limit: 8 })
      .then((res) => active && setFeatured(res.data))
      .catch(() => active && setFeatured([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/dishes?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container-page py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              🌍 10 cuisines · hundreds of dishes
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              Taste the world,<br /> delivered to your door.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/85">
              From smoky African jollof to fresh Japanese sushi — discover, customize and order
              your next favorite meal in seconds.
            </p>

            {/* Search */}
            <form onSubmit={onSearch} className="mt-8 flex max-w-lg gap-2 rounded-2xl bg-white p-2 shadow-card">
              <div className="relative flex-1">
                <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for biryani, pizza, tacos..."
                  className="w-full rounded-xl bg-transparent py-3 pl-10 pr-3 text-charcoal focus:outline-none"
                />
              </div>
              <button type="submit" className="btn-primary px-6">Search</button>
            </form>
          </motion.div>
        </div>
      </section>

      <div className="container-page">
        {/* Value props */}
        <section className="-mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Truck, title: 'Free delivery over $30', text: 'On all your favorite local spots.' },
            { icon: Clock3, title: 'Fast & fresh', text: 'Most orders arrive in under 40 minutes.' },
            { icon: BadgeCheck, title: 'Quality you can trust', text: 'Top-rated kitchens, real reviews.' },
          ].map((f) => (
            <div key={f.title} className="card flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <f.icon size={20} />
              </span>
              <div>
                <p className="font-semibold leading-tight">{f.title}</p>
                <p className="text-sm text-charcoal/55 dark:text-cream/55">{f.text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Cuisines */}
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Explore by cuisine</h2>
            <Link to="/dishes" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <CuisineChips active="" onChange={(c) => navigate(`/dishes?cuisine=${encodeURIComponent(c)}`)} />
        </section>

        {/* Featured */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Top rated this week</h2>
              <p className="text-sm text-charcoal/55 dark:text-cream/55">Loved by hungry customers like you.</p>
            </div>
          </div>
          {loading ? (
            <DishGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {featured.map((dish) => (
                <DishCard key={dish._id} dish={dish} />
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="my-16 overflow-hidden rounded-3xl bg-charcoal px-8 py-12 text-center dark:bg-white/5">
          <h2 className="font-display text-3xl font-bold text-cream">Hungry yet?</h2>
          <p className="mx-auto mt-2 max-w-md text-cream/70">
            Browse the full menu across 10 cuisines and build your perfect order.
          </p>
          <Link to="/dishes" className="btn-primary mt-6 px-7 py-3">
            Explore the full menu <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Home;
