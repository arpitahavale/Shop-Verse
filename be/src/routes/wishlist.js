const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

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

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.id DESC`,
      [req.user.id]
    );
    return res.json(result.rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load wishlist' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const productId = Number(req.body?.productId);
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    await db.query(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, productId]
    );

    const result = await db.query(
      `SELECT p.*
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.id DESC`,
      [req.user.id]
    );
    return res.json(result.rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add wishlist item' });
  }
});

router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, Number(req.params.productId)]
    );
    const result = await db.query(
      `SELECT p.*
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.id DESC`,
      [req.user.id]
    );
    return res.json(result.rows.map(mapProduct));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to remove wishlist item' });
  }
});

module.exports = router;
