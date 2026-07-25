-- Refresh product image paths to unique SVG per product id
UPDATE products SET image = '/products/' || id || '.svg';
