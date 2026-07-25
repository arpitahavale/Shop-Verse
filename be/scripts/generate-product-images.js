/**
 * Generates unique SVG product images (1–62) and optional SQL to refresh image paths.
 * Run from be/: node scripts/generate-product-images.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'sql', '02_seed.sql');
const OUT_DIR = path.join(ROOT, '..', 'fe', 'public', 'products');

const CATEGORY_HUE = {
  Electronics: 175,
  Clothing: 24,
  Home: 138,
  Footwear: 18,
  Accessories: 290,
};

function parseProducts(sql) {
  const products = [];
  const rowRe = /^\((\d+),\s*'((?:''|[^'])*)',\s*[\d.]+,\s*'([^']+)'/gm;
  let match;
  while ((match = rowRe.exec(sql)) !== null) {
    products.push({
      id: Number(match[1]),
      name: match[2].replace(/''/g, "'"),
      category: match[3],
    });
  }
  return products;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLines(text, max = 16) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function buildSvg(product) {
  const baseHue = CATEGORY_HUE[product.category] ?? 200;
  const hue = (baseHue + product.id * 11) % 360;
  const hue2 = (hue + 28) % 360;
  const lines = wrapLines(product.name);
  const category = escapeXml(product.category);
  const lineSvg = lines
    .map(
      (line, i) =>
        `<text x="400" y="${360 + i * 44}" text-anchor="middle" fill="#14212b" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="700">${escapeXml(line)}</text>`
    )
    .join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="${escapeXml(product.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 52%, 82%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 58%, 62%)"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(20,33,43,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect width="800" height="800" fill="url(#grid)"/>
  <circle cx="640" cy="160" r="120" fill="rgba(255,255,255,0.18)"/>
  <circle cx="140" cy="620" r="90" fill="rgba(255,255,255,0.12)"/>
  <rect x="80" y="80" width="640" height="640" rx="36" fill="rgba(255,255,255,0.22)" stroke="rgba(20,33,43,0.08)" stroke-width="2"/>
  <text x="400" y="280" text-anchor="middle" fill="#0f766e" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="0.18em">${category.toUpperCase()}</text>
  <text x="400" y="318" text-anchor="middle" fill="#64748b" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600">#${product.id}</text>
  ${lineSvg}
</svg>
`;
}

function updateSqlImagePaths(filePath) {
  if (!fs.existsSync(filePath)) return;
  let currentId = null;
  const updated = fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => {
      const idStart = line.match(/^\((\d+),/);
      if (idStart) currentId = idStart[1];
      if (currentId && /^\s+'\/products\//.test(line)) {
        return line.replace(/'\/products\/[^']+'/, `'\/products\/${currentId}.svg'`);
      }
      return line;
    })
    .join('\n');
  fs.writeFileSync(filePath, updated, 'utf8');
}

function main() {
  const seed = fs.readFileSync(SEED_PATH, 'utf8');
  const products = parseProducts(seed);

  if (!products.length) {
    throw new Error('No products parsed from 02_seed.sql');
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const product of products) {
    const svg = buildSvg(product);
    fs.writeFileSync(path.join(OUT_DIR, `${product.id}.svg`), svg, 'utf8');
  }

  updateSqlImagePaths(SEED_PATH);
  updateSqlImagePaths(path.join(ROOT, 'sql', '03_more_products.sql'));

  const updateSql = `-- Refresh product image paths to unique SVG per product id
UPDATE products SET image = '/products/' || id || '.svg';
`;
  fs.writeFileSync(path.join(ROOT, 'sql', '04_update_product_images.sql'), updateSql, 'utf8');

  console.log(`Generated ${products.length} SVG images in fe/public/products/`);
  console.log('Updated 02_seed.sql and 03_more_products.sql image paths.');
  console.log('Wrote sql/04_update_product_images.sql');
}

main();
