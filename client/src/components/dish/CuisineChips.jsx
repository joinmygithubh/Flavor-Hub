import clsx from 'clsx';
import { CUISINES } from '../../utils/constants.js';

/**
 * Horizontally scrollable pill-style cuisine filter. The active chip is rendered
 * in the primary color. Passing `null`/'' as active means "All".
 */
const CuisineChips = ({ active, onChange }) => (
  <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 py-1">
    <button
      type="button"
      onClick={() => onChange('')}
      className={clsx('chip', !active && 'chip-active')}
    >
      🌍 All
    </button>
    {CUISINES.map((c) => (
      <button
        key={c.name}
        type="button"
        onClick={() => onChange(c.name)}
        className={clsx('chip', active === c.name && 'chip-active')}
      >
        <span aria-hidden>{c.emoji}</span> {c.name}
      </button>
    ))}
  </div>
);

export default CuisineChips;
