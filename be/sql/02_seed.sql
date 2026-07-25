-- ShopVerse seed data
-- Prerequisite: run 01_schema.sql first
-- Demo login: demo@shopverse.com / Demo@123

INSERT INTO users (name, email, password_hash, active_vibe) VALUES
(
  'Demo Shopper',
  'demo@shopverse.com',
  '$2b$10$VBYPlHIjfl9oAK3J3349wO6jR1M4IqoyF.AbeDij8dOrmF9hHelrm',
  'focus'
);

INSERT INTO products (id, name, price, category, rating, image, description, badge, vibes) VALUES
(1, 'Wireless Noise-Cancel Headphones', 249.99, 'Electronics', 4.8,
 '/products/1.jpg',
 'Premium over-ear headphones with 30-hour battery life and studio-quality sound. Tuned for deep work sessions without fatigue.',
 'Best Seller', '{"focus":96,"motion":55,"nest":40,"signal":72}'::jsonb),
(2, 'Minimalist Leather Watch', 189.00, 'Accessories', 4.6,
 '/products/2.jpg',
 'Handcrafted Italian leather strap with sapphire crystal glass. Quiet luxury that signals intention.',
 'New', '{"focus":70,"motion":35,"nest":48,"signal":92}'::jsonb),
(3, 'Organic Cotton Hoodie', 79.99, 'Clothing', 4.5,
 '/products/3.jpg',
 'Soft, sustainable hoodie perfect for everyday comfort — the layer you live in at home and on the go.',
 NULL, '{"focus":62,"motion":58,"nest":94,"signal":40}'::jsonb),
(4, 'Smart Fitness Tracker', 129.99, 'Electronics', 4.4,
 '/products/4.jpg',
 'Track steps, heart rate, sleep, and workouts with a vibrant AMOLED display. Built for people who move.',
 'Sale', '{"focus":48,"motion":97,"nest":35,"signal":60}'::jsonb),
(5, 'Ceramic Pour-Over Set', 54.99, 'Home', 4.7,
 '/products/5.jpg',
 'Artisan ceramic dripper and carafe for the perfect morning brew. Turns coffee into a calm ritual.',
 NULL, '{"focus":78,"motion":20,"nest":98,"signal":45}'::jsonb),
(6, 'Running Sneakers Pro', 159.99, 'Footwear', 4.9,
 '/products/6.jpg',
 'Lightweight mesh upper with responsive cushioning for long runs. Engineered bounce that keeps you moving.',
 'Top Rated', '{"focus":35,"motion":99,"nest":25,"signal":80}'::jsonb),
(7, 'Linen Desk Mat', 42.00, 'Home', 4.3,
 '/products/7.jpg',
 'Natural linen desk surface that softens your workspace and keeps tools grounded during long focus blocks.',
 NULL, '{"focus":90,"motion":15,"nest":85,"signal":30}'::jsonb),
(8, 'Statement Crossbody', 118.00, 'Accessories', 4.6,
 '/products/8.jpg',
 'Structured silhouette with bold hardware — the bag that finishes an outfit before you leave the door.',
 'Limited', '{"focus":40,"motion":50,"nest":35,"signal":95}'::jsonb),
(9, 'Merino Travel Tee', 68.00, 'Clothing', 4.7,
 '/products/9.jpg',
 'Temperature-regulating merino that packs flat and still looks sharp after a full day out.',
 'New', '{"focus":55,"motion":78,"nest":60,"signal":70}'::jsonb),
(10, 'Studio Desk Lamp', 96.50, 'Home', 4.5,
 '/products/10.jpg',
 'Warm directional light with a matte arm — made for late focus sessions without eye strain.',
 NULL, '{"focus":93,"motion":20,"nest":88,"signal":42}'::jsonb),
(11, 'Trail Daypack 20L', 134.00, 'Accessories', 4.8,
 '/products/11.jpg',
 'Lightweight pack with bounce-free straps for city commute and weekend trails.',
 'Best Seller', '{"focus":45,"motion":94,"nest":30,"signal":65}'::jsonb),
(12, 'Cloud Foam Slides', 49.99, 'Footwear', 4.4,
 '/products/12.jpg',
 'Post-run recovery slides with plush foam and a grippy outsole for house-to-street ease.',
 'Sale', '{"focus":30,"motion":72,"nest":90,"signal":35}'::jsonb);

SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));

INSERT INTO orders (id, user_id, status, total, created_at) VALUES
('ORD-1042', 1, 'Delivered', 539.97, TIMESTAMPTZ '2026-07-10 12:00:00+00'),
('ORD-1038', 1, 'Shipped', 189.00, TIMESTAMPTZ '2026-06-28 12:00:00+00'),
('ORD-1031', 1, 'Processing', 134.98, TIMESTAMPTZ '2026-06-15 12:00:00+00'),
('ORD-1025', 1, 'Cancelled', 79.99, TIMESTAMPTZ '2026-05-30 12:00:00+00');

INSERT INTO order_items (order_id, product_name, qty, unit_price) VALUES
('ORD-1042', 'Wireless Noise-Cancel Headphones', 1, 249.99),
('ORD-1042', 'Smart Fitness Tracker', 2, 129.99),
('ORD-1038', 'Minimalist Leather Watch', 1, 189.00),
('ORD-1031', 'Ceramic Pour-Over Set', 1, 54.99),
('ORD-1031', 'Organic Cotton Hoodie', 1, 79.99),
('ORD-1025', 'Organic Cotton Hoodie', 1, 79.99);
