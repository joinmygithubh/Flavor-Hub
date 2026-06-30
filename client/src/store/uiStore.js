import { create } from 'zustand';

/** Transient UI state (not persisted) — e.g. whether the cart drawer is open. */
export const useUIStore = create((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
}));
