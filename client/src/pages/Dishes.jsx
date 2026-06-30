import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UtensilsCrossed, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import CuisineChips from '../components/dish/CuisineChips.jsx';
import FilterSidebar from '../components/dish/FilterSidebar.jsx';
import DishCard from '../components/dish/DishCard.jsx';
import { DishGridSkeleton } from '../components/ui/Skeletons.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useDishes } from '../hooks/useDishes.js';
import { useDebounce } from '../hooks/useDebounce.js';

const DEFAULT_FILTERS = {
  search: '',
  cuisine: '',
  isVeg: '',
  minRating: '',
  maxPrice: '',
  sort: 'newest',
  page: 1,
  limit: 12,
};

/** Browse/listing page: search + cuisine chips + filter sidebar + paginated grid. */
const Dishes = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from the URL so links like /dishes?cuisine=Italian work.
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    cuisine: searchParams.get('cuisine') || '',
    sort: searchParams.get('sort') || 'newest',
  }));
  const [searchInput, setSearchInput] = useState(filters.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 450);

  // Push debounced search into the active filters (and reset to page 1).
  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Keep the URL in sync with cuisine/search/sort for shareable links.
  useEffect(() => {
    const next = {};
    if (filters.search) next.search = filters.search;
    if (filters.cuisine) next.cuisine = filters.cuisine;
    if (filters.sort && filters.sort !== 'newest') next.sort = filters.sort;
    setSearchParams(next, { replace: true });
  }, [filters.search, filters.cuisine, filters.sort, setSearchParams]);

  // Memoize the params object passed to the hook to avoid redundant fetches.
  const queryFilters = useMemo(() => filters, [filters]);
  const { dishes, meta, loading, error } = useDishes(queryFilters);

  // Any change (other than page) resets pagination to page 1.
  const updateFilters = (patch) => {
    setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  };

  return (
    <div className="container-page py-8">
      {/* Header + search */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Explore the menu</h1>
        <p className="text-charcoal/55 dark:text-cream/55">
          {meta.total} dishes across 10 cuisines, ready to order.
        </p>
        <div className="relative mt-4 max-w-xl">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search dishes..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Cuisine chips */}
      <div className="mb-6">
        <CuisineChips active={filters.cuisine} onChange={(c) => updateFilters({ cuisine: c })} />
      </div>

      {/* Mobile filter toggle */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="btn-secondary mb-4 lg:hidden"
      >
        <SlidersHorizontal size={16} /> Filters &amp; sort
      </button>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={updateFilters} onReset={resetFilters} />
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <DishGridSkeleton count={9} />
          ) : error ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="Couldn't load dishes"
              message={error}
            />
          ) : dishes.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No dishes match your filters"
              message="Try adjusting your search or clearing some filters."
              action={<button onClick={resetFilters} className="btn-primary">Clear filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {dishes.map((dish) => (
                  <DishCard key={dish._id} dish={dish} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateFilters({ page: filters.page - 1 })}
                    disabled={filters.page <= 1}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="px-3 text-sm font-medium">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => updateFilters({ page: filters.page + 1 })}
                    disabled={filters.page >= meta.totalPages}
                    className="btn-secondary px-3 py-2 disabled:opacity-40"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85%] overflow-y-auto bg-cream p-4 dark:bg-charcoal lg:hidden"
            >
              <div className="mb-3 flex justify-end">
                <button onClick={() => setMobileFiltersOpen(false)} className="btn-ghost rounded-full">
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={updateFilters} onReset={resetFilters} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dishes;
