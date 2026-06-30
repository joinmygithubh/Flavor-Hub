import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart state (Zustand, persisted to localStorage).
 *
 * A "line" is uniquely identified by the dish + chosen spice level + selected
 * add-ons, so the same dish with different customizations are separate lines.
 * Pricing shown here is indicative only; the SERVER recomputes authoritative
 * totals at checkout from the database.
 */
const lineKey = (dishId, spiceLevel, addOns = []) =>
  `${dishId}__${spiceLevel || 'default'}__${addOns
    .map((a) => a.name)
    .sort()
    .join(',')}`;

const unitPrice = (item) =>
  item.price + (item.addOns || []).reduce((sum, a) => sum + a.price, 0);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ key, dishId, name, image, price, quantity, spiceLevel, addOns }]

      addItem: (dish, { quantity = 1, spiceLevel, addOns = [] } = {}) => {
        const key = lineKey(dish._id, spiceLevel, addOns);
        const items = [...get().items];
        const existing = items.find((i) => i.key === key);

        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({
            key,
            dishId: dish._id,
            name: dish.name,
            image: dish.image,
            price: dish.price,
            quantity,
            spiceLevel,
            addOns,
          });
        }
        set({ items });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) return get().removeItem(key);
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [] }),

      // Derived selectors.
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0),

      // Maps cart lines to the payload the API expects.
      toOrderItems: () =>
        get().items.map((i) => ({
          dish: i.dishId,
          quantity: i.quantity,
          spiceLevel: i.spiceLevel,
          addOns: i.addOns,
        })),
    }),
    { name: 'flavorhub_cart' }
  )
);

export { unitPrice };
