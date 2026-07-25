const express = require('express');
const db = require('../db');

const router = express.Router();

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
    vibes: row.vibes,
  };
}

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let result;
    if (category) {
      result = await db.query(
        `SELECT * FROM products
         WHERE LOWER(category) = LOWER($1)
         ORDER BY id ASC`,
        [category]
      );
    } else {
      result = await db.query('SELECT * FROM products ORDER BY id ASC');
    }
    return res.json(result.rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [
      Number(req.params.id),
    ]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(mapProduct(result.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load product' });
  }
});

module.exports = router;
