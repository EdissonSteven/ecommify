-- ============================================================
-- Ecommify – Datos semilla PostgreSQL
-- Contraseña para todos los usuarios de prueba: Test1234!
-- Hash generado con bcrypt rounds=10
-- ============================================================

INSERT INTO sellers (id, name, email, password_hash) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'TechStore BR',
   'techstore@ecommify.com',
   '$2b$10$vgU8eYk6ZWnkHUL9fRhBGuGREscx21ap8mzb9QDkMupqBvtwSU9Eq'),
  ('b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22',
   'Gadget World',
   'gadget@ecommify.com',
   '$2b$10$vgU8eYk6ZWnkHUL9fRhBGuGREscx21ap8mzb9QDkMupqBvtwSU9Eq')
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, email, password_hash) VALUES
  ('c2aafe11-be2d-6a1a-dd8f-8dd1cf502c33',
   'Ana García',
   'ana@example.com',
   '$2b$10$vgU8eYk6ZWnkHUL9fRhBGuGREscx21ap8mzb9QDkMupqBvtwSU9Eq'),
  ('d3bbff22-cf3e-7b2b-ee90-9ee2d0613d44',
   'Carlos López',
   'carlos@example.com',
   '$2b$10$vgU8eYk6ZWnkHUL9fRhBGuGREscx21ap8mzb9QDkMupqBvtwSU9Eq')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, seller_id, stock, price) VALUES
  ('prod-001', 'Smartphone Samsung Galaxy A54',   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 25, 1299.90),
  ('prod-002', 'Laptop Dell Inspiron 15',          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  8, 3499.90),
  ('prod-003', 'Tablet Apple iPad 10',             'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 12, 2199.90),
  ('prod-004', 'Fone Bluetooth Sony WH-1000XM5',  'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22', 50,  899.90),
  ('prod-005', 'Smartwatch Apple Watch SE',        'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22', 15, 1599.90),
  ('prod-006', 'Mouse Logitech MX Master 3',       'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22', 30,  349.90),
  ('prod-007', 'Teclado Mecánico Keychron K2',     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  0,  499.90),
  ('prod-008', 'Monitor LG 27" 4K UltraFine',      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  5, 1899.90)
ON CONFLICT (id) DO NOTHING;
