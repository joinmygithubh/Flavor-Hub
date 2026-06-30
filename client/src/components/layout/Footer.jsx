import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import { CUISINES } from '../../utils/constants.js';

const Footer = () => (
  <footer className="mt-16 border-t border-black/5 bg-white/60 dark:border-white/10 dark:bg-white/5">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link to="/" className="inline-flex items-center" aria-label="Flavor Hub home">
          <Logo withWordmark markSize={36} />
        </Link>
        <p className="mt-3 max-w-xs text-sm text-charcoal/55 dark:text-cream/55">
          Discover and order delicious food from cuisines around the world, delivered hot to your door.
        </p>
        <div className="mt-4 flex gap-3 text-charcoal/50 dark:text-cream/50">
          <Twitter size={18} className="cursor-pointer hover:text-primary-500" />
          <Instagram size={18} className="cursor-pointer hover:text-primary-500" />
          <Github size={18} className="cursor-pointer hover:text-primary-500" />
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-display font-semibold">Explore</h4>
        <ul className="space-y-2 text-sm text-charcoal/55 dark:text-cream/55">
          <li><Link to="/dishes" className="hover:text-primary-500">All dishes</Link></li>
          <li><Link to="/dishes?sort=rating" className="hover:text-primary-500">Top rated</Link></li>
          <li><Link to="/profile" className="hover:text-primary-500">My orders</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-display font-semibold">Cuisines</h4>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-charcoal/55 dark:text-cream/55">
          {CUISINES.slice(0, 8).map((c) => (
            <li key={c.name}>
              <Link to={`/dishes?cuisine=${encodeURIComponent(c.name)}`} className="hover:text-primary-500">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-display font-semibold">Stay in the loop</h4>
        <p className="text-sm text-charcoal/55 dark:text-cream/55">Get the tastiest deals in your inbox.</p>
        <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="you@email.com" className="input py-2 text-sm" />
          <button className="btn-primary px-4 py-2 text-sm">Join</button>
        </form>
      </div>
    </div>
    <div className="border-t border-black/5 py-4 text-center text-xs text-charcoal/40 dark:border-white/10 dark:text-cream/40">
      © {new Date().getFullYear()} Flavor Hub. Built for demonstration purposes.
    </div>
  </footer>
);

export default Footer;
