import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { CUISINES, SORT_OPTIONS } from '../../utils/constants.js';

const DIET_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Veg' },
  { value: 'false', label: 'Non-veg' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];

/**
 * Controlled filter & sort sidebar. `filters` is the single source of truth held
 * by the parent listing page; every control calls `onChange(patch)`.
 */
const FilterSidebar = ({ filters, onChange, onReset }) => {
  const set = (patch) => onChange(patch);

  return (
    <aside className="card sticky top-24 space-y-6 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display font-semibold">
          <SlidersHorizontal size={18} className="text-primary-500" /> Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Sort */}
      <div>
        <label className="label" htmlFor="sort">Sort by</label>
        <select
          id="sort"
          className="input"
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Cuisine */}
      <div>
        <span className="label">Cuisine</span>
        <div className="flex flex-wrap gap-2">
          {['', ...CUISINES.map((c) => c.name)].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              onClick={() => set({ cuisine: c })}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                filters.cuisine === c
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-black/10 text-charcoal/70 hover:border-primary-300 dark:border-white/15 dark:text-cream/70'
              )}
            >
              {c || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Diet */}
      <div>
        <span className="label">Dietary</span>
        <div className="grid grid-cols-3 gap-2">
          {DIET_OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => set({ isVeg: o.value })}
              className={clsx(
                'rounded-lg border px-2 py-1.5 text-xs font-medium transition',
                filters.isVeg === o.value
                  ? 'border-veg bg-veg/10 text-veg'
                  : 'border-black/10 text-charcoal/70 hover:border-veg/50 dark:border-white/15 dark:text-cream/70'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="label" htmlFor="maxPrice">
          Max price: <span className="font-bold text-primary-600">${filters.maxPrice || 25}</span>
        </label>
        <input
          id="maxPrice"
          type="range"
          min="5"
          max="25"
          step="1"
          value={filters.maxPrice || 25}
          onChange={(e) => set({ maxPrice: e.target.value })}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-xs text-charcoal/40 dark:text-cream/40">
          <span>$5</span>
          <span>$25+</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <span className="label">Minimum rating</span>
        <div className="grid grid-cols-3 gap-2">
          {RATING_OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => set({ minRating: o.value })}
              className={clsx(
                'rounded-lg border px-2 py-1.5 text-xs font-medium transition',
                filters.minRating === o.value
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-black/10 text-charcoal/70 hover:border-gold/50 dark:border-white/15 dark:text-cream/70'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
