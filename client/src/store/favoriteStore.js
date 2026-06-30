import { create } from 'zustand';
import { userService } from '../api/userService.js';

/**
 * Favorites state.
 *
 * Holds the set of favorited dish ids so the heart toggle can render instantly
 * anywhere in the catalogue. Mutations are optimistic (update UI first, then call
 * the API, and roll back on failure). Hydrated on login, cleared on logout.
 */
export const useFavoriteStore = create((set, get) => ({
  ids: [], // string[] of favorited dish ids
  hydrated: false,

  hydrate: async () => {
    try {
      const ids = await userService.getFavoriteIds();
      set({ ids, hydrated: true });
    } catch {
      set({ ids: [], hydrated: true });
    }
  },

  clear: () => set({ ids: [], hydrated: false }),

  isFavorite: (dishId) => get().ids.includes(dishId),

  /**
   * Optimistically toggles a dish's favorite state and syncs with the server.
   * Returns the new boolean state. Throws on API failure (after rolling back).
   */
  toggle: async (dishId) => {
    const wasFav = get().ids.includes(dishId);
    const optimistic = wasFav ? get().ids.filter((id) => id !== dishId) : [...get().ids, dishId];
    set({ ids: optimistic });

    try {
      const ids = wasFav
        ? await userService.removeFavorite(dishId)
        : await userService.addFavorite(dishId);
      // Trust the server's authoritative list.
      set({ ids });
      return !wasFav;
    } catch (err) {
      // Roll back on failure.
      set({ ids: wasFav ? [...get().ids, dishId] : get().ids.filter((id) => id !== dishId) });
      throw err;
    }
  },
}));
