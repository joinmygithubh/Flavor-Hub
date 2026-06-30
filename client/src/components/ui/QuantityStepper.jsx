import { Minus, Plus } from 'lucide-react';

/** Accessible +/- quantity control used in the cart and dish detail page. */
const QuantityStepper = ({ value, onChange, min = 1, max = 50 }) => (
  <div className="inline-flex items-center rounded-full border border-primary-200 dark:border-white/15">
    <button
      type="button"
      aria-label="Decrease quantity"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="flex h-8 w-8 items-center justify-center rounded-full text-primary-600 hover:bg-primary-50 disabled:opacity-40 dark:text-primary-200 dark:hover:bg-white/10"
      disabled={value <= min}
    >
      <Minus size={15} />
    </button>
    <span className="w-8 text-center text-sm font-semibold">{value}</span>
    <button
      type="button"
      aria-label="Increase quantity"
      onClick={() => onChange(Math.min(max, value + 1))}
      className="flex h-8 w-8 items-center justify-center rounded-full text-primary-600 hover:bg-primary-50 disabled:opacity-40 dark:text-primary-200 dark:hover:bg-white/10"
      disabled={value >= max}
    >
      <Plus size={15} />
    </button>
  </div>
);

export default QuantityStepper;
