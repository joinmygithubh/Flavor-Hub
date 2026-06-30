import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

const NotFound = () => (
  <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
    <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-100 text-primary-500">
      <UtensilsCrossed size={40} />
    </span>
    <h1 className="mt-6 font-display text-5xl font-extrabold">404</h1>
    <p className="mt-2 text-lg font-semibold">This page is off the menu</p>
    <p className="mt-1 text-charcoal/55 dark:text-cream/55">
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/" className="btn-primary mt-6 px-6 py-3">Back to home</Link>
  </div>
);

export default NotFound;
