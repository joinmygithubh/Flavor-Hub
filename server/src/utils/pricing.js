import { Dish } from '../models/Dish.js';
import { ApiError } from './ApiError.js';

const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.05; // 5% — illustrative

/**
 * Builds authoritative order line items and totals from the database.
 *
 * SECURITY: prices are ALWAYS resolved from the DB, never taken from the client,
 * so a tampered cart payload cannot change what the user is charged. Add-on prices
 * are likewise validated against the dish's configured add-ons.
 *
 * @param {Array<{dish, quantity, spiceLevel?, addOns?}>} requestedItems
 * @returns {{ items, itemsTotal, deliveryFee, tax, totalAmount }}
 */
export const buildOrderPricing = async (requestedItems) => {
  const dishIds = requestedItems.map((i) => i.dish);
  const dishes = await Dish.find({ _id: { $in: dishIds } });
  const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

  let itemsTotal = 0;
  const items = requestedItems.map((req) => {
    const dish = dishMap.get(req.dish);
    if (!dish) throw new ApiError(404, `Dish not found: ${req.dish}`);
    if (!dish.isAvailable) throw new ApiError(409, `"${dish.name}" is currently unavailable`);

    // Resolve add-on prices from the dish definition, ignoring any client price.
    const validAddOns = (req.addOns || []).map((addOn) => {
      const match = dish.addOns.find((a) => a.name === addOn.name);
      if (!match) throw new ApiError(400, `Invalid add-on "${addOn.name}" for ${dish.name}`);
      return { name: match.name, price: match.price };
    });

    const addOnsTotal = validAddOns.reduce((sum, a) => sum + a.price, 0);
    const lineUnit = dish.price + addOnsTotal;
    const lineTotal = lineUnit * req.quantity;
    itemsTotal += lineTotal;

    return {
      dish: dish._id,
      name: dish.name,
      image: dish.image,
      price: dish.price,
      quantity: req.quantity,
      spiceLevel: req.spiceLevel,
      addOns: validAddOns,
    };
  });

  const round = (n) => Math.round(n * 100) / 100;
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const tax = round(itemsTotal * TAX_RATE);
  const totalAmount = round(itemsTotal + deliveryFee + tax);

  return { items, itemsTotal: round(itemsTotal), deliveryFee, tax, totalAmount };
};
