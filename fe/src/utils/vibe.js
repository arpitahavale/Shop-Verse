import { VIBES } from '../constants';

export const getVibeById = (id) => VIBES.find((v) => v.id === id) || null;

export const getMatchScore = (product, vibeId) => {
  if (!vibeId || !product?.vibes) return null;
  return product.vibes[vibeId] ?? 0;
};

export const sortByVibeMatch = (products, vibeId) => {
  if (!vibeId) return products;
  return [...products].sort(
    (a, b) => getMatchScore(b, vibeId) - getMatchScore(a, vibeId)
  );
};

export const getMatchLabel = (score) => {
  if (score == null) return null;
  if (score >= 85) return 'Perfect match';
  if (score >= 70) return 'Strong fit';
  if (score >= 50) return 'Good pair';
  return 'Stretch pick';
};

/** Suggest a complementary product already high-scoring for the vibe */
export const suggestCompanion = (product, catalog, vibeId) => {
  if (!vibeId) return null;
  return (
    catalog
      .filter((p) => p.id !== product.id && getMatchScore(p, vibeId) >= 70)
      .sort((a, b) => getMatchScore(b, vibeId) - getMatchScore(a, vibeId))[0] ||
    null
  );
};
