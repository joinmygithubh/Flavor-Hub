import { unitPrice } from '../store/cartStore.js';

/**
 * Client-side estimate of order totals for DISPLAY ONLY. These constants mirror
 * the server (`server/src/utils/pricing.js`); the backend always recomputes the
 * authoritative amount, so this never drives the actual charge.
 */
export const DELIVERY_FEE = 2.99;
export const TAX_RATE = 0.05;

export const computeTotals = (items) => {
  const round = (n) => Math.round(n * 100) / 100;
  const itemsTotal = items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const tax = round(itemsTotal * TAX_RATE);
  const totalAmount = round(itemsTotal + deliveryFee + tax);
  return { itemsTotal: round(itemsTotal), deliveryFee, tax, totalAmount };
};
