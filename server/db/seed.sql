INSERT INTO products (name, sku, description, category, price, quantity, minimum_stock)
VALUES
  ('Wireless Keyboard', 'KB-001', 'Compact wireless keyboard', 'Accessories', 35.99, 24, 5),
  ('USB-C Hub', 'HB-002', 'Seven-port USB-C hub', 'Accessories', 49.50, 8, 10),
  ('Webcam HD', 'WC-003', '1080p webcam for video calls', 'Electronics', 79.99, 15, 4)
ON CONFLICT (sku) DO NOTHING;
