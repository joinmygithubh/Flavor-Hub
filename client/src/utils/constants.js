// Cuisine list mirrors the backend enum. Emoji adds a friendly visual cue on chips.
export const CUISINES = [
  { name: 'African', emoji: '🍛' },
  { name: 'Italian', emoji: '🍝' },
  { name: 'Indian', emoji: '🍲' },
  { name: 'Chinese', emoji: '🥡' },
  { name: 'Mexican', emoji: '🌮' },
  { name: 'Continental', emoji: '🍽️' },
  { name: 'Thai', emoji: '🍜' },
  { name: 'Japanese', emoji: '🍣' },
  { name: 'Lebanese', emoji: '🥙' },
  { name: 'Fast Food', emoji: '🍔' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'prep', label: 'Fastest prep' },
];

export const ORDER_STEPS = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

// Branded fallback image (inline SVG data URI) used when a remote image fails.
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <rect width="100%" height="100%" fill="#FDE3D5"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#C5421C"
        text-anchor="middle" dominant-baseline="middle">🍽️ Flavor Hub</text>
    </svg>`
  );
