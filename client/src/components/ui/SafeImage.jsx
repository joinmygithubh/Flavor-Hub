import { useState } from 'react';
import { FALLBACK_IMAGE } from '../../utils/constants.js';

/**
 * Image with built-in lazy loading and a graceful fallback for broken/expired URLs.
 * Keeps the grid clean with a fixed aspect ratio + object-cover.
 */
const SafeImage = ({ src, alt, className = '', aspect = 'aspect-[4/3]' }) => {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${aspect} bg-primary-50 dark:bg-white/5`}>
      {/* Lightweight shimmer until the image paints. */}
      {!loaded && <div className="absolute inset-0 animate-pulse bg-primary-100/60" />}
      <img
        src={errored ? FALLBACK_IMAGE : src}
        alt={alt}
        loading="lazy"
        onError={() => setErrored(true)}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};

export default SafeImage;
