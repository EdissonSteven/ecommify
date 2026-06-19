-- ============================================================
-- Archivo   : 04_materialized_views.sql
-- Descripción: Vistas materializadas OLAP para reportes de Ecommify.
--              con los JOINs corregidos según el patrón real de
--              datos: order_items.order_id y payments.order_id
--              almacenan o.id::TEXT (UUID como texto), NO el
--              código legible orders.order_id (ORD-XXXXXXXXXX).
--              Ejecutar en Supabase SQL Editor.
-- Autores   : David Ricardo Grandas Cárdenas
--             Danilo Andrés Cortés Saavedra
--             Edisson Steven Bustos Galeano
-- Fecha     : 2026-06-18 (Unidad 6)
-- ============================================================

-- ── MV 1: Ventas por categoría y mes ─────────────────────────
DROP MATERIALIZED VIEW IF EXISTS mv_sales_by_category_monthly;

CREATE MATERIALIZED VIEW mv_sales_by_category_monthly AS
SELECT
  DATE_PART('year',  o.created_at)::INT  AS year,
  DATE_PART('month', o.created_at)::INT  AS month,
  COALESCE(p.category, 'sin_categoria')  AS category,
  COUNT(DISTINCT o.id)                   AS total_orders,
  SUM(oi.subtotal)                       AS total_revenue,
  AVG(oi.subtotal)                       AS avg_item_value,
  SUM(o.total) / NULLIF(COUNT(DISTINCT o.id), 0) AS avg_order_value,
  COUNT(oi.id)                           AS total_items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id::TEXT      -- ✓ corregido
JOIN products p     ON p.id        = oi.product_id
WHERE o.status = 'delivered'
GROUP BY 1, 2, 3
WITH DATA;

CREATE UNIQUE INDEX ON mv_sales_by_category_monthly (year, month, category);
CREATE INDEX ON mv_sales_by_category_monthly (category);
CREATE INDEX ON mv_sales_by_category_monthly (year, month);

COMMENT ON MATERIALIZED VIEW mv_sales_by_category_monthly IS
  'Ventas por categoría y mes (solo órdenes entregadas). '
  'REFRESH: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_by_category_monthly;';

-- ── MV 2: Segmentación RFM de clientes ────────────────────────
DROP MATERIALIZED VIEW IF EXISTS mv_customer_segments;

CREATE MATERIALIZED VIEW mv_customer_segments AS
WITH pagos_por_orden AS (
  SELECT order_id, SUM(amount) AS order_total
  FROM payments
  WHERE status = 'completed'                          -- ✓ corregido (no 'approved')
  GROUP BY order_id
),
resumen_cliente AS (
  SELECT
    c.id                                                        AS customer_id,
    c.name                                                      AS customer_name,
    c.email                                                     AS customer_email,
    COUNT(DISTINCT o.id)                                        AS total_orders,
    COALESCE(SUM(pp.order_total), 0)                            AS total_spent,
    COALESCE(AVG(pp.order_total), 0)                            AS avg_order_value,
    EXTRACT(DAY FROM NOW() - MAX(o.created_at))                 AS days_since_last_order,
    MAX(o.created_at)                                           AS last_order_date
  FROM customers c
  LEFT JOIN orders o           ON o.customer_id = c.id
                               AND o.status = 'delivered'
  LEFT JOIN pagos_por_orden pp ON pp.order_id = o.id::TEXT       -- ✓ corregido
  GROUP BY c.id, c.name, c.email
)
SELECT
  customer_id, customer_name, customer_email,
  total_orders, total_spent, avg_order_value,
  days_since_last_order, last_order_date,
  CASE
    WHEN total_orders >= 5 AND total_spent >= 1000 THEN 'VIP'
    WHEN total_orders >= 3                         THEN 'Regular'
    WHEN total_orders >= 2                         THEN 'Occasional'
    ELSE                                                'New'
  END AS customer_segment
FROM resumen_cliente
WITH DATA;

CREATE UNIQUE INDEX ON mv_customer_segments (customer_id);
CREATE INDEX        ON mv_customer_segments (customer_segment);
CREATE INDEX        ON mv_customer_segments (total_spent DESC);
CREATE INDEX        ON mv_customer_segments (days_since_last_order);

COMMENT ON MATERIALIZED VIEW mv_customer_segments IS
  'Segmentación RFM de clientes (VIP/Regular/Occasional/New). '
  'REFRESH: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_segments;';

-- ── MV 3: Ranking de productos por rendimiento ───────────────
DROP MATERIALIZED VIEW IF EXISTS mv_product_performance;

CREATE MATERIALIZED VIEW mv_product_performance AS
SELECT
  p.id                                               AS product_id,
  p.name                                             AS product_name,
  p.category,
  p.price                                            AS current_price,
  p.stock                                            AS current_stock,
  COUNT(DISTINCT oi.id)                              AS units_sold,
  COUNT(DISTINCT o.id)                               AS orders_count,
  COALESCE(SUM(oi.subtotal), 0)                      AS total_revenue,
  COALESCE(AVG(oi.unit_price), p.price)              AS avg_sale_price,
  ROUND(
    COUNT(DISTINCT o.id)::NUMERIC /
    NULLIF(COUNT(DISTINCT o.id) + p.stock, 0) * 100, 2
  )                                                  AS conversion_rate_pct,
  RANK() OVER (PARTITION BY p.category
               ORDER BY SUM(oi.subtotal) DESC NULLS LAST) AS rank_in_category
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o       ON o.id::TEXT    = oi.order_id        -- ✓ corregido
                        AND o.status = 'delivered'
GROUP BY p.id, p.name, p.category, p.price, p.stock
WITH DATA;

CREATE UNIQUE INDEX ON mv_product_performance (product_id);
CREATE INDEX        ON mv_product_performance (category, rank_in_category);
CREATE INDEX        ON mv_product_performance (total_revenue DESC);

COMMENT ON MATERIALIZED VIEW mv_product_performance IS
  'Rendimiento de productos: unidades vendidas, ingresos, '
  'precio promedio y ranking dentro de su categoría. '
  'REFRESH: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_performance;';

-- ── Procedimiento de refresh coordinado ──────────────────────
CREATE OR REPLACE PROCEDURE sp_refresh_all_mvs()
LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_by_category_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_segments;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_performance;
END;
$$;

-- ── Verificación rápida ───────────────────────────────────────
SELECT 'mv_sales_by_category_monthly' AS vista, COUNT(*) AS filas FROM mv_sales_by_category_monthly
UNION ALL
SELECT 'mv_customer_segments', COUNT(*) FROM mv_customer_segments
UNION ALL
SELECT 'mv_product_performance', COUNT(*) FROM mv_product_performance;