const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const ordersResult = await db.query(
      `SELECT id, status, total,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const itemsResult = await db.query(
      `SELECT oi.order_id, oi.product_name, oi.qty, oi.unit_price
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = $1`,
      [req.user.id]
    );

    const byOrder = {};
    for (const row of itemsResult.rows) {
      if (!byOrder[row.order_id]) byOrder[row.order_id] = [];
      byOrder[row.order_id].push({
        name: row.product_name,
        qty: row.qty,
        unitPrice: Number(row.unit_price),
      });
    }

    const orders = ordersResult.rows.map((o) => {
      const products = byOrder[o.id] || [];
      return {
        id: o.id,
        status: o.status,
        total: Number(o.total),
        date: o.date,
        items: products.reduce((sum, p) => sum + p.qty, 0),
        products,
      };
    });

    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { total } = req.body || {};
    const orderTotal = Number(total);
    if (Number.isNaN(orderTotal) || orderTotal < 0) {
      return res.status(400).json({ error: 'Valid total is required' });
    }

    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT c.quantity, p.name, p.price
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    if (!cartResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    await client.query(
      `INSERT INTO orders (id, user_id, status, total)
       VALUES ($1, $2, 'Processing', $3)`,
      [orderId, req.user.id, orderTotal]
    );

    for (const row of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_name, qty, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, row.name, row.quantity, row.price]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [
      req.user.id,
    ]);

    await client.query('COMMIT');

    const products = cartResult.rows.map((r) => ({
      name: r.name,
      qty: r.quantity,
      unitPrice: Number(r.price),
    }));

    return res.status(201).json({
      id: orderId,
      status: 'Processing',
      total: orderTotal,
      date: new Date().toISOString().slice(0, 10),
      items: products.reduce((sum, p) => sum + p.qty, 0),
      products,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: 'Checkout failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
