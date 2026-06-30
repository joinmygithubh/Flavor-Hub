import { Star } from 'lucide-react';

/** Compact gold rating badge, e.g. ★ 4.8 */
const Rating = ({ value = 0, count, size = 'sm' }) => {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1' };
  const iconSize = size === 'md' ? 14 : 12;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gold/15 font-semibold text-gold ${sizes[size]}`}
      title={count != null ? `${value.toFixed(1)} from ${count} reviews` : `${value.toFixed(1)} rating`}
    >
      <Star size={iconSize} className="fill-gold text-gold" />
      {Number(value).toFixed(1)}
      {count != null && <span className="font-normal text-gold/70">({count})</span>}
    </span>
  );
};

export default Rating;
