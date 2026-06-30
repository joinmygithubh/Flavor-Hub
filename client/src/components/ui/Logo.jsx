/**
 * Flavor Hub brand logo.
 *
 * Renders a scalable SVG "mark" (a plate flanked by a fork & knife, topped with a
 * steam/flavor flourish) plus an optional wordmark. Used in the navbar, footer and
 * auth screens so branding stays consistent and crisp at any size.
 */
const Logo = ({ withWordmark = true, className = '', markSize = 36 }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Flavor Hub logo"
      className="shrink-0"
    >
      {/* Rounded badge background */}
      <rect width="48" height="48" rx="13" fill="#E2562B" />
      {/* Plate */}
      <circle cx="24" cy="25.5" r="9.5" fill="#FFF7ED" />
      <circle cx="24" cy="25.5" r="5.5" fill="#FDE3D5" />
      {/* Fork (left) */}
      <path
        d="M12 11c-.7 0-1.2.6-1.2 1.3v6.2a3.4 3.4 0 0 0 2.3 3.2v15.1a1.6 1.6 0 0 0 3.2 0V21.7a3.4 3.4 0 0 0 2.3-3.2v-6.2a1.2 1.2 0 0 0-2.4 0v4.7a.7.7 0 0 1-1.3 0v-4.7a1.2 1.2 0 0 0-2.4 0v4.7a.7.7 0 0 1-1.3 0v-4.7c0-.7-.5-1.3-1.2-1.3Z"
        fill="#FFF7ED"
      />
      {/* Knife (right) */}
      <path
        d="M35.5 11c-2 0-3.6 2.6-3.6 5.8 0 2.6 1.1 4.8 2.6 5.5v14.5a1.6 1.6 0 0 0 3.2 0V11.6c0-.3-.3-.6-.6-.6h-1.6Z"
        fill="#FFF7ED"
      />
    </svg>

    {withWordmark && (
      <span className="font-display text-xl font-extrabold tracking-tight text-charcoal dark:text-cream">
        Flavor<span className="text-primary-500">Hub</span>
      </span>
    )}
  </span>
);

export default Logo;
