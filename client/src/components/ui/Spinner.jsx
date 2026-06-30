import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 18, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

export const FullPageSpinner = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner size={36} className="text-primary-500" />
  </div>
);

export default Spinner;
