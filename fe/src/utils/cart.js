import { SHIPPING, VIBE_BUNDLE_DISCOUNT } from '../constants';

export const calcSubtotal = (items) =>
  items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

export const calcShipping = (subtotal) =>
  subtotal >= SHIPPING.freeThreshold || subtotal === 0 ? 0 : SHIPPING.flatRate;

export const calcVibeDiscount = (items, activeVibe) => {
  if (!activeVibe || items.length < 2) return 0;
  const matching = items.filter(
    (item) => item.product.vibes?.[activeVibe] >= 70
  );
  if (matching.length < 2) return 0;
  const matchingSubtotal = matching.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return matchingSubtotal * VIBE_BUNDLE_DISCOUNT;
};

export const calcCartTotals = (items, activeVibe) => {
  const subtotal = calcSubtotal(items);
  const vibeDiscount = calcVibeDiscount(items, activeVibe);
  const afterDiscount = Math.max(0, subtotal - vibeDiscount);
  const shipping = calcShipping(afterDiscount);
  return {
    subtotal,
    vibeDiscount,
    shipping,
    total: afterDiscount + shipping,
  };
};

export const getCartCount = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
