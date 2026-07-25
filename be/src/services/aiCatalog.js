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
  'than',
  'less',
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

function extractMaxPrice(query) {
  const under = query.match(/under\s*\$?\s*(\d+)/i);
  if (under) return Number(under[1]);
  const less = query.match(/(?:less than|below)\s*\$?\s*(\d+)/i);
  if (less) return Number(less[1]);
  const budget = query.match(/\$\s*(\d+)/);
  if (budget) return Number(budget[1]);
  return null;
}

function scoreProduct(product, query, vibe, maxPrice) {
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

  if (maxPrice != null) {
    if (product.price <= maxPrice) {
      score += 12;
      reasons.push(`within $${maxPrice}`);
    } else {
      score -= 40;
    }
  }

  score += product.rating * 2;
  if (product.badge) score += 3;

  return { score, reasons };
}

async function searchProducts({ query = '', vibe = null, maxPrice = null, limit = 4 } = {}) {
  const products = await getAllProducts();
  const detectedVibe = vibe || detectVibe(query);
  const priceCap = maxPrice ?? extractMaxPrice(query);

  const ranked = products
    .map((product) => {
      const { score, reasons } = scoreProduct(
        product,
        query,
        detectedVibe,
        priceCap
      );
      return { product, score, reasons };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    vibe: detectedVibe,
    maxPrice: priceCap,
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
  compactProduct,
};
