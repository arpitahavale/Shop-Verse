-- ShopVerse schema
-- Run in pgAdmin against database: shopverse

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  active_vibe   VARCHAR(40),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category    VARCHAR(80) NOT NULL,
  rating      NUMERIC(3, 2) NOT NULL DEFAULT 0,
  image       TEXT NOT NULL,
  description TEXT NOT NULL,
  badge       VARCHAR(60),
  vibes       JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  UNIQUE (user_id, product_id)
);

CREATE TABLE wishlist_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (user_id, product_id)
);

CREATE TABLE orders (
  id         VARCHAR(32) PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(40) NOT NULL DEFAULT 'Processing',
  total      NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     VARCHAR(32) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(200) NOT NULL,
  qty          INTEGER NOT NULL CHECK (qty >= 1),
  unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_cart_user ON cart_items (user_id);
CREATE INDEX idx_wishlist_user ON wishlist_items (user_id);
CREATE INDEX idx_orders_user ON orders (user_id);
