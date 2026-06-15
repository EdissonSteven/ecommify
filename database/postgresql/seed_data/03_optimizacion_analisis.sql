-- ============================================================
-- Archivo   : 03_optimizacion_analisis.sql
-- Descripción: Análisis de planes de ejecución EXPLAIN ANALYZE
--              ANTES de optimizaciones — capturar métricas base.
--              EJECUTAR DESPUÉS de 02_seed_masivo.sql
-- Autores   : David Ricardo Grandas Cárdenas
--             Danilo Andrés Cortés Saavedra
--             Edisson Steven Bustos Galeano
-- Fecha     : 2026-05-21
-- ============================================================

-- ── ACTUALIZAR ESTADÍSTICAS PRIMERO ──────────────────────────
ANALYZE customers;
ANALYZE sellers;
ANALYZE products;
-- ============================================================
-- CORRECCIONES APLICADAS vs versión original:
--   oi.quantity   → oi.qty            (nombre real de columna)
--   p.method      → p.payment_type    (nombre real de columna)
--   o.id = oi.order_id → o.id::TEXT   (cast UUID→VARCHAR requerido)
--   CONCURRENTLY  eliminado           (Supabase no lo soporta en SQL Editor)
-- ============================================================
-- AJUSTES PREVIOS REQUERIDOS EN SUPABASE (ejecutar antes de este script):
--   ALTER TABLE orders      ALTER COLUMN order_id DROP NOT NULL;
--   ALTER TABLE orders      ALTER COLUMN total    DROP NOT NULL;
--   ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(36);
--   ALTER TABLE payments    ALTER COLUMN order_id TYPE VARCHAR(36);
--   ALTER TABLE order_items DISABLE TRIGGER USER;
--   ALTER TABLE payments    DISABLE TRIGGER USER;
-- ============================================================
-- ============================================================

-- ── ACTUALIZAR ESTADÍSTICAS PRIMERO ──────────────────────────
ANALYZE customers;
ANALYZE sellers;
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE payments;
ANALYZE reviews;

-- ============================================================
-- SECCIÓN A: CONSULTAS CRÍTICAS — ANÁLISIS BASE (SIN OPTIMIZAR)
-- Guardar estos resultados para comparar después
-- ============================================================

-- Q1: Historial de pedidos de un cliente con total pagado
-- Consulta frecuente: página "Mis pedidos"
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  o.id,
  o.status,
  o.created_at,
  COUNT(oi.id)            AS items,
  SUM(oi.unit_price * oi.qty) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.customer_id = (SELECT id FROM customers LIMIT 1)
GROUP BY o.id, o.status, o.created_at
ORDER BY o.created_at DESC;

-- Q2: Catálogo de productos por categoría con filtro de precio
-- Consulta frecuente: página de catálogo con filtros
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  p.id, p.name, p.price, p.category,
  p.specifications->>'ram' AS ram,
  COUNT(r.id) AS total_reviews,
  AVG(r.rating) AS avg_rating
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
WHERE p.category = 'laptops'
  AND p.price BETWEEN 1000 AND 4000
  AND p.stock > 0
GROUP BY p.id, p.name, p.price, p.category, p.specifications
ORDER BY avg_rating DESC NULLS LAST, p.price ASC
LIMIT 20;

-- Q3: Revenue total por vendedor en los últimos 90 días
-- Consulta frecuente: dashboard de vendedores
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  s.name AS seller,
  COUNT(DISTINCT o.id)    AS total_orders,
  COUNT(oi.id)            AS total_items,
  SUM(oi.unit_price * oi.qty) AS revenue,
  AVG(oi.unit_price)      AS avg_price
FROM sellers s
JOIN products p  ON p.seller_id = s.id
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o   ON o.id::TEXT = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '90 days'
  AND o.status = 'delivered'
GROUP BY s.id, s.name
ORDER BY revenue DESC;

-- Q4: Búsqueda full-text de productos por término
-- Consulta frecuente: barra de búsqueda
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, name, price, category,
       specifications->>'ram' AS ram
FROM products
WHERE name ILIKE '%samsung%'
   OR name ILIKE '%apple%'
ORDER BY price DESC
LIMIT 20;

-- Q5: Órdenes por rango de fechas con estado específico
-- Consulta frecuente: reportes administrativos
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  DATE_TRUNC('month', o.created_at) AS mes,
  o.status,
  COUNT(*)      AS total_ordenes,
  SUM(p.amount) AS revenue_mes
FROM orders o
JOIN payments p ON p.order_id = o.id::TEXT
WHERE o.created_at BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY 1, 2
ORDER BY 1, 2;

-- Q6: Top 10 productos más vendidos
-- Consulta frecuente: sección "más vendidos"
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  p.id, p.name, p.category, p.price,
  SUM(oi.qty) AS unidades_vendidas,
  SUM(oi.unit_price * oi.qty) AS revenue
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id::TEXT = oi.order_id
WHERE o.status = 'delivered'
GROUP BY p.id, p.name, p.category, p.price
ORDER BY unidades_vendidas DESC
LIMIT 10;

-- Q7: Verificar disponibilidad de producto en checkout
-- Consulta crítica: proceso de compra
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, name, stock, price,
       specifications->>'storage' AS storage
FROM products
WHERE id = 'prod-001'
  AND stock > 0;

-- Q8: Pagos pendientes por método de pago
-- Consulta operativa: tesorería
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  payment_type,
  COUNT(*) AS total,
  SUM(amount) AS monto_total
FROM payments
WHERE status = 'pending'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY payment_type
ORDER BY monto_total DESC;

-- ============================================================
-- SECCIÓN B: CREAR ÍNDICES ESPECIALIZADOS
-- ============================================================

-- B1: B-TREE SIMPLE — customer_id en orders
-- Justificación: Q1 filtra por customer_id en Seq Scan sobre 150k filas
-- Patrón: WHERE o.customer_id = $1 — equidad sobre UUID
-- Trade-off: 3-5 MB de espacio, mantenimiento en INSERT/UPDATE
CREATE INDEX IF NOT EXISTS
  idx_orders_customer_id
  ON orders (customer_id);

-- B2: B-TREE COMPUESTO — (status, created_at) en orders
-- Justificación: Q5 filtra por status AND rango de created_at
-- El orden importa: columna de menor cardinalidad primero
-- Trade-off: ~8 MB, cubre múltiples queries de reportes
CREATE INDEX IF NOT EXISTS
  idx_orders_status_created_at
  ON orders (status, created_at DESC);

-- B3: B-TREE COMPUESTO — (category, price, stock) en products
-- Justificación: Q2 filtra por category + rango price + stock > 0
-- Cubre la cláusula WHERE completa — index only scan posible
-- Trade-off: ~2 MB, 3 columnas combinadas
CREATE INDEX IF NOT EXISTS
  idx_products_category_price_stock
  ON products (category, price, stock)
  WHERE stock > 0;  -- índice PARCIAL: solo productos con stock

-- B4: GIN — specifications JSONB en products
-- Justificación: Q2 y Q7 consultan specifications->>'ram', 'storage'
-- GIN es el tipo correcto para JSONB con operadores @>, ?, #>>
-- Trade-off: ~10 MB, rebuild más lento que B-tree
CREATE INDEX IF NOT EXISTS
  idx_products_specifications_gin
  ON products USING GIN (specifications);

-- B5: GIN — name full-text en products (pg_trgm)
-- Justificación: Q4 usa ILIKE '%término%' — Seq Scan sin índice
-- pg_trgm permite búsqueda tolerante a errores tipográficos
-- Trade-off: ~5 MB, búsquedas LIKE/ILIKE hasta 100x más rápidas
CREATE INDEX IF NOT EXISTS
  idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);

-- B6: B-TREE — (product_id) en order_items
-- Justificación: Q3 y Q6 hacen JOIN entre order_items y products
-- 300k filas sin índice = Seq Scan en cada query de catálogo
-- Trade-off: ~8 MB
CREATE INDEX IF NOT EXISTS
  idx_order_items_product_id
  ON order_items (product_id);

-- B7: B-TREE — (order_id) en payments
-- Justificación: Q5 hace JOIN payments → orders sin índice en FK
-- Payments tiene 150k filas — sin índice es Seq Scan siempre
CREATE INDEX IF NOT EXISTS
  idx_payments_order_id_status
  ON payments (order_id, status);

-- B8: BRIN — created_at en orders (datos temporales correlacionados)
-- Justificación: orders es candidata a particionamiento por fecha
-- BRIN es ideal para columnas con correlación natural con el heap
-- Trade-off: mínimo espacio (~128 KB), menos preciso que B-tree
-- Reemplazará al B-tree en la tabla particionada
CREATE INDEX IF NOT EXISTS
  idx_orders_created_at_brin
  ON orders USING BRIN (created_at)
  WITH (pages_per_range = 32);

-- B9: PARCIAL — pagos pendientes recientes
-- Justificación: Q8 siempre filtra status='pending' AND recientes
-- El índice parcial cubre solo el subconjunto relevante (~5-10%)
-- Trade-off: muy pequeño (~500 KB), consulta específica muy rápida
CREATE INDEX IF NOT EXISTS
  idx_payments_pending_recent
  ON payments (created_at DESC)
  WHERE status = 'pending';

-- B10: B-TREE — (product_id, rating) en reviews
-- Justificación: Q2 LEFT JOIN reviews agrupando por product_id
-- Sin índice = Hash Aggregate sobre Seq Scan
CREATE INDEX IF NOT EXISTS
  idx_reviews_product_rating
  ON reviews (product_id, rating DESC);

-- Verificar índices creados
SELECT
  indexname,
  indexdef,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS tamaño
FROM pg_indexes
WHERE tablename IN ('orders','order_items','products','payments','reviews')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================
-- SECCIÓN C: ANÁLISIS DESPUÉS DE ÍNDICES
-- Ejecutar las mismas queries y comparar
-- ============================================================

-- Q1 CON ÍNDICES: historial cliente
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  o.id, o.status, o.created_at,
  COUNT(oi.id)            AS items,
  SUM(oi.unit_price * oi.qty) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.customer_id = (SELECT id FROM customers LIMIT 1)
GROUP BY o.id, o.status, o.created_at
ORDER BY o.created_at DESC;

-- Q2 CON ÍNDICES: catálogo con filtros
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  p.id, p.name, p.price, p.category,
  p.specifications->>'ram' AS ram,
  COUNT(r.id) AS total_reviews,
  AVG(r.rating) AS avg_rating
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
WHERE p.category = 'laptops'
  AND p.price BETWEEN 1000 AND 4000
  AND p.stock > 0
GROUP BY p.id, p.name, p.price, p.category, p.specifications
ORDER BY avg_rating DESC NULLS LAST, p.price ASC
LIMIT 20;

-- Q4 CON ÍNDICES: búsqueda full-text con pg_trgm
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, name, price, category
FROM products
WHERE name ILIKE '%samsung%'
   OR name ILIKE '%apple%'
ORDER BY price DESC
LIMIT 20;

-- Q5 CON ÍNDICES: órdenes por fecha y estado
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  DATE_TRUNC('month', o.created_at) AS mes,
  o.status,
  COUNT(*) AS total_ordenes,
  SUM(p.amount) AS revenue_mes
FROM orders o
JOIN payments p ON p.order_id = o.id::TEXT
WHERE o.created_at BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY 1, 2
ORDER BY 1, 2;

-- ============================================================
-- SECCIÓN D: TABLA RESUMEN DE MÉTRICAS PARA DOCUMENTAR
-- ============================================================
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamaño_total,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS tamaño_datos,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS tamaño_indices,
  (SELECT reltuples::BIGINT FROM pg_class WHERE relname = tablename) AS filas_estimadas
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders','order_items','products','payments','reviews','customers')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;