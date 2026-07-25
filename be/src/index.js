require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const aiRoutes = require('./routes/ai');

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// localhost and 127.0.0.1 are different browser origins — allow both in dev
if (!allowedOrigins.includes('http://127.0.0.1:3000')) {
  allowedOrigins.push('http://127.0.0.1:3000');
}

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests (Postman, server-to-server) have no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  })
);
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ ok: true, db: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, db: false });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(port, () => {
  console.log(`ShopVerse API listening on http://localhost:${port}`);
});
