import { CATEGORY_META, ROUTES } from '../constants';

export const categoryFromSlug = (slug = '') => {
  const key = decodeURIComponent(slug).toLowerCase();
  return CATEGORY_META[key]?.label || null;
};

export const categoryToSlug = (label) => label.toLowerCase();

export const categoryPath = (label) =>
  ROUTES.shopCategory(categoryToSlug(label));

export const sortProducts = (list, sortId, vibeId) => {
  const next = [...list];
  switch (sortId) {
    case 'price-asc':
      return next.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return next.sort((a, b) => b.price - a.price);
    case 'rating':
      return next.sort((a, b) => b.rating - a.rating);
    case 'vibe':
      if (!vibeId) return next;
      return next.sort(
        (a, b) => (b.vibes?.[vibeId] || 0) - (a.vibes?.[vibeId] || 0)
      );
    default:
      return next;
  }
};
