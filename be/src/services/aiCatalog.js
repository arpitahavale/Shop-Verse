const db = require('../db');

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    rating: Number(row.rating),
    image: row.image,
    description: row.description,
    badge: row.badge,
    vibes: row.vibes || {},
  };
}

async function getAllProducts() {
  const result = await db.query('SELECT * FROM products ORDER BY id ASC');
  return result.rows.map(mapProduct);
}

async function getProductById(id) {
  const result = await db.query('SELECT * FROM products WHERE id = $1', [
    Number(id),
  ]);
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

const STOP = new Set([
  'the',
  'and',
  'for',
  'with',
  'under',
  'above',
  'over',
  'than',
  'less',
  'more',
  'below',
  'need',
  'want',
  'gift',
  'some',
  'that',
  'this',
  'from',
  'into',
  'your',
  'have',
  'pick',
  'picks',
  'idea',
  'ideas',
  'least',
]);

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

const VIBE_KEYWORDS = {
  focus: ['focus', 'work', 'desk', 'office', 'study', 'quiet', 'deep', 'productivity'],
  motion: ['run', 'running', 'fitness', 'sport', 'active', 'trail', 'outdoor', 'gym', 'sweat'],
  nest: ['home', 'cozy', 'calm', 'coffee', 'soft', 'comfort', 'relax', 'morning', 'ritual'],
  signal: ['bold', 'style', 'statement', 'gift', 'fashion', 'look', 'outfit', 'luxury'],
};

function detectVibe(query) {
  const tokens = tokenize(query);
  let best = null;
  let bestScore = 0;
  for (const [vibe, words] of Object.entries(VIBE_KEYWORDS)) {
    const score = words.reduce(
      (sum, w) => sum + (tokens.includes(w) || query.toLowerCase().includes(w) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = vibe;
    }
  }
  return bestScore > 0 ? best : null;
}

function extractPriceFilter(query = '') {
  const text = String(query).replace(/\\/g, ' ').trim();

  const range = text.match(
    /(?:between|from)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*\$?\s*(\d+(?:\.\d+)?)/i
  );
  if (range) {
    const low = Math.min(Number(range[1]), Number(range[2]));
    const high = Math.max(Number(range[1]), Number(range[2]));
    return {
      minPrice: low,
      maxPrice: high,
      label: `$${low}–$${high}`,
    };
  }

  const minMatch = text.match(
    /(?:above|over|more than|greater than|at least)\s*\$?\s*(\d+(?:\.\d+)?)/i
  );
  if (minMatch) {
    const minPrice = Number(minMatch[1]);
    return { minPrice, maxPrice: null, label: `above $${minPrice}` };
  }

  const maxMatch = text.match(
    /(?:under|below|less than|upto|up to|max)\s*\$?\s*(\d+(?:\.\d+)?)/i
  );
  if (maxMatch) {
    const maxPrice = Number(maxMatch[1]);
    return { minPrice: null, maxPrice, label: `under $${maxPrice}` };
  }

  // Bare "$50" with no direction → treat as budget cap (under)
  const budget = text.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (budget) {
    const maxPrice = Number(budget[1]);
    return { minPrice: null, maxPrice, label: `under $${maxPrice}` };
  }

  return { minPrice: null, maxPrice: null, label: null };
}

/** @deprecated use extractPriceFilter */
function extractMaxPrice(query) {
  return extractPriceFilter(query).maxPrice;
}

function matchesPriceFilter(product, { minPrice, maxPrice }) {
  if (minPrice != null && product.price < minPrice) return false;
  if (maxPrice != null && product.price > maxPrice) return false;
  return true;
}

function scoreProduct(product, query, vibe, priceFilter) {
  const hay = `${product.name} ${product.category} ${product.description} ${product.badge || ''}`.toLowerCase();
  const tokens = tokenize(query);
  let score = 0;
  const reasons = [];

  for (const token of tokens) {
    if (hay.includes(token)) {
      score += 8;
      if (reasons.length < 2) reasons.push(`matches “${token}”`);
    }
  }

  if (vibe && product.vibes?.[vibe] != null) {
    const vibeScore = Number(product.vibes[vibe]) || 0;
    score += vibeScore / 5;
    if (vibeScore >= 70) reasons.push(`strong ${vibe} match (${vibeScore})`);
  }

  const { minPrice, maxPrice, label } = priceFilter || {};

  if (minPrice != null || maxPrice != null) {
    if (matchesPriceFilter(product, { minPrice, maxPrice })) {
      score += 12;
      if (label) reasons.push(label);
      else if (minPrice != null) reasons.push(`above $${minPrice}`);
      else reasons.push(`under $${maxPrice}`);
    } else {
      score -= 40;
    }
  }

  score += product.rating * 2;
  if (product.badge) score += 3;

  return { score, reasons };
}

async function searchProducts({
  query = '',
  vibe = null,
  minPrice = null,
  maxPrice = null,
  limit = 4,
} = {}) {
  const products = await getAllProducts();
  const detectedVibe = vibe || detectVibe(query);
  const parsed = extractPriceFilter(query);
  const priceFilter = {
    minPrice: minPrice ?? parsed.minPrice,
    maxPrice: maxPrice ?? parsed.maxPrice,
    label: parsed.label,
  };

  const ranked = products
    .filter((product) => matchesPriceFilter(product, priceFilter))
    .map((product) => {
      const { score, reasons } = scoreProduct(
        product,
        query,
        detectedVibe,
        priceFilter
      );
      return { product, score, reasons };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    vibe: detectedVibe,
    minPrice: priceFilter.minPrice,
    maxPrice: priceFilter.maxPrice,
    priceLabel: priceFilter.label,
    results: ranked,
  };
}

function compactProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    rating: product.rating,
    badge: product.badge,
    vibes: product.vibes,
    description: product.description.slice(0, 140),
  };
}

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  detectVibe,
  extractMaxPrice,
  extractPriceFilter,
  compactProduct,
};
