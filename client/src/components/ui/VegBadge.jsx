/**
 * The familiar square veg / non-veg indicator dot used across Indian food apps.
 * Green = vegetarian, red = non-vegetarian.
 */
const VegBadge = ({ isVeg, showLabel = false }) => {
  const color = isVeg ? 'border-veg text-veg' : 'border-red-500 text-red-500';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded border ${color}`}
        aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      >
        <span className={`h-2 w-2 rounded-full ${isVeg ? 'bg-veg' : 'bg-red-500'}`} />
      </span>
      {showLabel && (
        <span className={`text-xs font-medium ${isVeg ? 'text-veg' : 'text-red-500'}`}>
          {isVeg ? 'Veg' : 'Non-veg'}
        </span>
      )}
    </span>
  );
};

export default VegBadge;
