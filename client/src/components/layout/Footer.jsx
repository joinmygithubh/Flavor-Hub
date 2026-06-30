import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, ArrowUp } from 'lucide-react';
import Logo from '../ui/Logo.jsx';
import { CUISINES } from '../../utils/constants.js';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/**
 * Site footer. Spans the full width, scales its inner content up on ultra-wide
 * screens (`container-page`), and adds bottom padding on mobile so its last row
 * is never hidden behind the fixed bottom navigation.
 */
const Footer = () => (
  <footer className="mt-16 w-full border-t border-black/5 bg-white/60 dark:border-white/10 dark:bg-white/5">
    <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link to="/" className="inline-flex items-center" aria-label="Flavor Hub home">
          <Logo withWordmark markSize={36} />
        </Link>
        <p className="mt-3 max-w-xs text-sm text-charcoal/55 dark:text-cream/55">
          Discover and order delicious food from cuisines around the world, delivered hot to your door.
        </p>
        <div className="mt-4 flex gap-3 text-charcoal/50 dark:text-cream/50">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
            <Twitter size={18} className="cursor-pointer transition hover:text-primary-500" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            <Instagram size={18} className="cursor-pointer transition hover:text-primary-500" />
          </a>
          <a
            href="https://github.com/joinmygithubh/Flavor-Hub"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
          >
            <Github size={18} className="cursor-pointer transition hover:text-primary-500" />
          </a>
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-display font-semibold">Explore</h4>
        <ul className="space-y-2 text-sm text-charcoal/55 dark:text-cream/55">
          <li><Link to="/" className="hover:text-primary-500">Home</Link></li>
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
          <input type="email" placeholder="you@email.com" className="input py-2 text-sm" aria-label="Email address" />
          <button className="btn-primary px-4 py-2 text-sm">Join</button>
        </form>
      </div>
    </div>

    {/* Bottom bar — extra bottom padding on mobile clears the fixed bottom nav. */}
    <div className="border-t border-black/5 dark:border-white/10">
      <div className="container-page flex flex-col items-center justify-between gap-3 py-5 pb-[calc(env(safe-area-inset-bottom)+5rem)] text-xs text-charcoal/45 dark:text-cream/45 sm:flex-row md:pb-5">
        <p>© {new Date().getFullYear()} Flavor Hub. Built for demonstration purposes.</p>
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 font-medium transition hover:border-primary-300 hover:text-primary-600 dark:border-white/15"
        >
          <ArrowUp size={13} /> Back to top
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
