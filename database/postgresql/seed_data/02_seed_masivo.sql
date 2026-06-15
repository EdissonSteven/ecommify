-- ============================================================
-- Archivo   : 02_seed_masivo.sql
-- Descripción: Versión corregida para Supabase PostgreSQL.
--              Compatibilidad: UUID vs VARCHAR, nombres de columnas
--              reales del schema, triggers desactivados durante seed.
-- Autores   : David Ricardo Grandas Cárdenas
--             Danilo Andrés Cortés Saavedra
--             Edisson Steven Bustos Galeano
-- Fecha     : 2026-06-14
-- Uso       : SQL Editor de Supabase — ejecutar completo
-- Tiempo    : ~5-8 minutos
-- ============================================================

SET client_min_messages TO WARNING;

-- ── PASO 0: AJUSTES DE SCHEMA COMPATIBLES CON SEED ───────────
ALTER TABLE orders      ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE orders      ALTER COLUMN total    DROP NOT NULL;
ALTER TABLE order_items DISABLE TRIGGER ALL;
ALTER TABLE payments    DISABLE TRIGGER ALL;
ALTER TABLE orders      DISABLE TRIGGER ALL;

-- ── PASO 1: CLIENTES (5.000) ──────────────────────────────────
DO $$
DECLARE
  i            INTEGER;
  dominios     TEXT[] := ARRAY['gmail.com','hotmail.com','yahoo.com',
                               'outlook.com','icloud.com','proton.me'];
  nombres      TEXT[] := ARRAY['Ana','Carlos','María','Juan','Laura',
                               'Pedro','Sofia','Luis','Valentina','Diego',
                               'Camila','Andrés','Isabella','Felipe',
                               'Daniela','Sebastián','Lucía','Alejandro',
                               'Paula','Ricardo','Natalia','Miguel','Sara',
                               'Jorge','Claudia','Marcos','Andrea',
                               'Santiago','Catalina','Roberto'];
  apellidos    TEXT[] := ARRAY['García','López','Martínez','Rodríguez',
                               'González','Hernández','Pérez','Sánchez',
                               'Torres','Ramírez','Flores','Morales','Cruz',
                               'Reyes','Ortiz','Moreno','Silva','Vargas',
                               'Castillo','Ramos','Mendoza','Guerrero',
                               'Rojas','Medina','Vega','Castro','Cortés'];
  nombre_sel   TEXT;
  apellido_sel TEXT;
  email_gen    TEXT;
BEGIN
  FOR i IN 1..5000 LOOP
    nombre_sel   := nombres[1   + floor(random() * array_length(nombres,   1))::INT];
    apellido_sel := apellidos[1 + floor(random() * array_length(apellidos, 1))::INT];
    email_gen    := lower(nombre_sel) || '.' || lower(apellido_sel)
                    || i || '@'
                    || dominios[1 + floor(random() * array_length(dominios, 1))::INT];
    INSERT INTO customers (id, name, email, password_hash)
    VALUES (
      gen_random_uuid(),
      nombre_sel || ' ' || apellido_sel,
      email_gen,
      '$2b$10$vgU8eYk6ZWnkHUL9fRhBGuGREscx21ap8mzb9QDkMupqBvtwSU9Eq'
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
END $$;

SELECT 'customers' AS paso, COUNT(*) AS total FROM customers;

-- ── PASO 2: VENDEDORES (20) ───────────────────────────────────
DO $$
DECLARE
  i      INTEGER;
  tiendas TEXT[] := ARRAY['TechZone','MegaStore','DigitalHub','SmartShop',
                           'GadgetPro','ElectroPlus','TechWorld','ByteStore',
                           'PixelShop','DataMart','CloudStore','NetShop',
                           'BitMart','CyberZone','TechBazaar','DigiWorld',
                           'MicroStore','NanoShop','QubitMart','AlphaStore'];
BEGIN
  FOR i IN 1..array_length(tiendas, 1) LOOP
    INSERT INTO sellers (id, name, email, password_hash,
                         notification_emails, business_hours)
    VALUES (
      gen_random_uuid(),
      tiendas[i],
      lower(replace(tiendas[i], ' ', '')) || '@ecommify.com',
      '$2b$10$vgU8eYk6ZWnkHUL9fRhBGuGREscx21ap8mzb9QDkMupqBvtwSU9Eq',
      ARRAY[lower(replace(tiendas[i], ' ', '')) || '@ecommify.com'],
      '{"monday":"9:00-18:00","tuesday":"9:00-18:00","wednesday":"9:00-18:00","thursday":"9:00-18:00","friday":"9:00-17:00"}'
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
END $$;

SELECT 'sellers' AS paso, COUNT(*) AS total FROM sellers;

-- ── PASO 3: PRODUCTOS (500) ───────────────────────────────────
DO $$
DECLARE
  i          INTEGER;
  categorias TEXT[] := ARRAY['smartphones','laptops','tablets','audio',
                              'wearables','peripherals','monitors',
                              'networking','gaming','cameras'];
  marcas     TEXT[] := ARRAY['Samsung','Apple','Sony','LG','Dell','HP',
                              'Lenovo','Asus','Acer','Microsoft','Huawei',
                              'Xiaomi','OnePlus','Google','Logitech',
                              'Razer','Corsair','SteelSeries','JBL','Bose'];
  cat        TEXT;
  marca      TEXT;
  precio     NUMERIC;
  sid        UUID;
  specs_json JSONB;
BEGIN
  FOR i IN 1..500 LOOP
    cat   := categorias[1 + floor(random() * array_length(categorias, 1))::INT];
    marca := marcas[1     + floor(random() * array_length(marcas,     1))::INT];
    precio := round((random() * 4500 + 200)::NUMERIC, 2);

    SELECT id INTO sid FROM sellers ORDER BY random() LIMIT 1;

    CASE cat
      WHEN 'smartphones' THEN
        specs_json := jsonb_build_object(
          'storage', (ARRAY['64GB','128GB','256GB','512GB'])[1+floor(random()*4)::INT],
          'ram',     (ARRAY['4GB','6GB','8GB','12GB'])[1+floor(random()*4)::INT],
          'camera',  (ARRAY['12MP','50MP','108MP'])[1+floor(random()*3)::INT],
          'os',      (ARRAY['Android 14','iOS 17'])[1+floor(random()*2)::INT]
        );
      WHEN 'laptops' THEN
        specs_json := jsonb_build_object(
          'processor', (ARRAY['Intel i5','Intel i7','AMD Ryzen 5','Apple M2'])[1+floor(random()*4)::INT],
          'ram',       (ARRAY['8GB','16GB','32GB'])[1+floor(random()*3)::INT],
          'storage',   (ARRAY['256GB SSD','512GB SSD','1TB SSD'])[1+floor(random()*3)::INT],
          'os',        (ARRAY['Windows 11','macOS','Linux'])[1+floor(random()*3)::INT]
        );
      ELSE
        specs_json := jsonb_build_object(
          'category_type', cat,
          'weight_g', floor(random() * 2000 + 100)::INT,
          'warranty_months', (ARRAY[6,12,24])[1+floor(random()*3)::INT]
        );
    END CASE;

    INSERT INTO products (id, name, seller_id, stock, price, category,
                          specifications, tags, photos)
    VALUES (
      'prod-gen-' || LPAD(i::TEXT, 4, '0'),
      marca || ' ' || initcap(cat) || ' Pro ' || chr(64 + (i % 26) + 1) || i::TEXT,
      sid,
      floor(random() * 200)::INT,
      precio,
      cat,
      specs_json,
      ARRAY[cat, lower(marca), 'oferta'],
      ARRAY['https://picsum.photos/seed/' || cat || i || '/400/300']
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

SELECT 'products' AS paso, COUNT(*) AS total FROM products;

-- ── PASO 4: ÓRDENES (150.000) ─────────────────────────────────
DO $$
DECLARE
  b           INT;
  batch_size  INT := 10000;
  batches     INT := 15;
BEGIN
  FOR b IN 1..batches LOOP
    INSERT INTO orders (id, customer_id, status, created_at, updated_at)
    SELECT
      gen_random_uuid(),
      c.id,
      (ARRAY['pending','processing','confirmed',
             'shipped','delivered','cancelled'])[1 + floor(random()*6)::INT],
      NOW() - (
        INTERVAL '1 day'    * floor(random() * 1095)::INT +
        INTERVAL '1 hour'   * floor(random() * 24)::INT +
        INTERVAL '1 minute' * floor(random() * 60)::INT
      ),
      NOW()
    FROM (
      SELECT id FROM customers ORDER BY random() LIMIT batch_size
    ) c;
  END LOOP;
END $$;

SELECT 'orders' AS paso, COUNT(*) AS total FROM orders;

-- ── PASO 5: ORDER_ITEMS (~300.000) ────────────────────────────
DO $$
DECLARE
  total_done INT := 0;
  ord        RECORD;
BEGIN
  FOR ord IN (
    SELECT o.id AS order_id
    FROM orders o
    WHERE NOT EXISTS (
      SELECT 1 FROM order_items oi
      WHERE oi.order_id = o.id::TEXT
    )
    ORDER BY o.created_at
    LIMIT 150000
  ) LOOP
    INSERT INTO order_items (
      id, order_id, product_id, product_name, unit_price, qty, created_at
    )
    SELECT
      gen_random_uuid(),
      ord.order_id::TEXT,
      p.id,
      p.name,
      p.price * (0.85 + random() * 0.30),
      floor(random() * 3 + 1)::INT,
      NOW() - INTERVAL '1 day' * floor(random() * 365)::INT
    FROM (
      SELECT id, name, price FROM products
      ORDER BY random()
      LIMIT floor(random() * 3 + 1)::INT
    ) p;

    total_done := total_done + 1;
  END LOOP;
END $$;

SELECT 'order_items' AS paso, COUNT(*) AS total FROM order_items;

-- ── PASO 6: PAGOS (~150.000) ──────────────────────────────────
INSERT INTO payments (id, order_id, amount, payment_type, status, created_at)
SELECT
  gen_random_uuid(),
  o.id::TEXT,
  COALESCE(
    (SELECT SUM(oi.unit_price * oi.qty)
     FROM order_items oi
     WHERE oi.order_id = o.id::TEXT),
    round((random() * 2000 + 100)::NUMERIC, 2)
  ),
  (ARRAY['credit_card','debit_card','pix','bank_transfer','cash'])[
    1 + floor(random() * 5)::INT
  ],
  CASE
    WHEN o.status IN ('delivered','shipped','confirmed') THEN 'completed'
    WHEN o.status = 'cancelled'                          THEN 'refunded'
    ELSE 'pending'
  END,
  o.created_at + INTERVAL '5 minutes' * floor(random() * 12)::INT
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.order_id = o.id::TEXT
);

SELECT 'payments' AS paso, COUNT(*) AS total FROM payments;

-- ── PASO 7: REVIEWS (~50.000) ─────────────────────────────────
DO $$
DECLARE
  comentarios TEXT[] := ARRAY[
    'Excelente producto, superó mis expectativas.',
    'Muy buena calidad, lo recomiendo.',
    'Llegó rápido y en perfectas condiciones.',
    'Buen producto pero la entrega tardó más de lo esperado.',
    'Cumple con lo prometido, nada más.',
    'No me convenció del todo, esperaba más.',
    'Producto de buena calidad precio.',
    'Lo compraría de nuevo sin dudar.',
    'El empaque llegó un poco dañado pero el producto ok.',
    'Increíble, exactamente lo que necesitaba.'
  ];
BEGIN
  INSERT INTO reviews (
    id, customer_id, product_id, rating, comment,
    verified_purchase, created_at
  )
  SELECT
    gen_random_uuid(),
    sub.customer_id,
    sub.product_id,
    floor(random() * 3 + 3)::INT,
    comentarios[1 + floor(random() * array_length(comentarios, 1))::INT],
    TRUE,
    sub.created_at + INTERVAL '7 days' * floor(random() * 4 + 1)::INT
  FROM (
    SELECT DISTINCT ON (oi.order_id, oi.product_id)
      oi.product_id,
      o.customer_id,
      o.id::TEXT   AS order_id,
      o.created_at
    FROM order_items oi
    JOIN orders o ON o.id::TEXT = oi.order_id
    WHERE o.status = 'delivered'
    ORDER BY oi.order_id, oi.product_id, random()
    LIMIT 50000
  ) sub
  ON CONFLICT DO NOTHING;
END $$;

SELECT 'reviews' AS paso, COUNT(*) AS total FROM reviews;

-- ── PASO 8: REACTIVAR TRIGGERS ───────────────────────────────
ALTER TABLE order_items ENABLE TRIGGER ALL;
ALTER TABLE payments    ENABLE TRIGGER ALL;
ALTER TABLE orders      ENABLE TRIGGER ALL;

-- ── RESUMEN FINAL ─────────────────────────────────────────────
SELECT
  'customers'   AS tabla, COUNT(*) AS registros FROM customers
UNION ALL SELECT 'sellers',     COUNT(*) FROM sellers
UNION ALL SELECT 'products',    COUNT(*) FROM products
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments',    COUNT(*) FROM payments
UNION ALL SELECT 'reviews',     COUNT(*) FROM reviews
ORDER BY tabla;