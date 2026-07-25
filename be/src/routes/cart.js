const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function mapCartRow(row) {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    product: {
      id: row.product_id,
      name: row.name,
      price: Number(row.price),
      category: row.category,
      rating: Number(row.rating),
      image: row.image,
      description: row.description,
      badge: row.badge,
      vibes: row.vibes,
    },
  };
}

const CART_SELECT = `
  SELECT c.id, c.product_id, c.quantity,
         p.name, p.price, p.category, p.rating, p.image, p.description, p.badge, p.vibes
  FROM cart_items c
  JOIN products p ON p.id = c.product_id
  WHERE c.user_id = $1
  ORDER BY c.id ASC
`;

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(CART_SELECT, [req.user.id]);
    return res.json(result.rows.map(mapCartRow));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load cart' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }

    await client.query('BEGIN');
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [
      req.user.id,
    ]);

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      if (!productId) continue;
      await client.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = EXCLUDED.quantity`,
        [req.user.id, productId, quantity]
      );
    }

    await client.query('COMMIT');
    const result = await db.query(CART_SELECT, [req.user.id]);
    return res.json(result.rows.map(mapCartRow));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Failed to update cart' });
  } finally {
    client.release();
  }
});

router.post('/items', requireAuth, async (req, res) => {
  try {
    const productId = Number(req.body?.productId);
    const quantity = Math.max(1, Number(req.body?.quantity) || 1);
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [req.user.id, productId, quantity]
    );

    const result = await db.query(CART_SELECT, [req.user.id]);
    return res.json(result.rows.map(mapCartRow));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.delete('/items/:productId', requireAuth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, Number(req.params.productId)]
    );
    const result = await db.query(CART_SELECT, [req.user.id]);
    return res.json(result.rows.map(mapCartRow));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    return res.json([]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
