# Resultados de Pruebas Consolidados — Ecommify

**Unidades 5 y 6 — Optimización de Bases de Datos**
Equipo: David Ricardo Grandas Cárdenas · Danilo Andrés Cortés Saavedra · Edisson Steven Bustos Galeano

Este documento consolida **todas** las métricas reales medidas contra la infraestructura productiva del proyecto (Supabase PostgreSQL 15 y MongoDB Atlas M0), en un solo lugar, como evidencia cuantitativa de cierre del curso.

---

## 1. PostgreSQL — Índices y optimización (Unidad 5)

### 1.1 EXPLAIN ANALYZE antes/después

| Query | Descripción | Antes (ms) | Después (ms) | Cambio | Índice responsable |
|---|---|---|---|---|---|
| Q1 | Historial pedidos por cliente | 14.19 | 65.33 | -360% | `idx_orders_customer_id` (overhead de particiones) |
| Q2 | Catálogo con filtros y reviews | 404.14 | 389.29 | +3.7% | `idx_products_category_price_stock` |
| Q3 | Revenue por vendedor 90 días | 927.51 | 943.69 | -1.7% | Bloqueado por cast UUID→TEXT |
| Q4 | Búsqueda ILIKE productos | 21.45 | 19.63 | +8.5% | `idx_products_name_trgm` (tabla pequeña) |
| Q5 | Órdenes por rango de fechas | 55.03 | 937.59 | -1603% | Bloqueado por cast UUID→TEXT |
| Q6 | Top productos más vendidos | 2910 | 2620 | +10.0% | `idx_order_items_product_id` |
| Q7 | Verificación producto por PK | 0.001 | 0.001 | 0% | `products_pkey` (ya óptima) |
| Q8 | Pagos pendientes por método | 341.20 | 228.17 | **+33.1%** | `idx_payments_pending_recent` (mejor resultado) |

### 1.2 Tamaño de índices creados (10 totales)

| Índice | Tipo | Tamaño |
|---|---|---|
| `idx_orders_customer_id` | B-tree simple | 3-5 MB |
| `idx_orders_status_created_at` | B-tree compuesto ESR | ~8 MB |
| `idx_products_category_price_stock` | B-tree parcial | <1 MB |
| `idx_products_specifications_gin` | GIN JSONB | ~2 MB |
| `idx_products_name_trgm` | GIN trigrama | ~1 MB |
| `idx_order_items_product_id` | B-tree simple | ~8 MB |
| `idx_payments_order_id_status` | B-tree compuesto | ~5 MB |
| `idx_orders_created_at_brin` | BRIN | ~128 KB |
| `idx_payments_pending_recent` | B-tree parcial | ~500 KB |
| `idx_reviews_product_rating` | B-tree compuesto | ~1 MB |

### 1.3 Volumen de datos verificado (Supabase)

| Tabla | Registros | Tamaño total | Tamaño índices |
|---|---|---|---|
| orders (particionada, 16 particiones) | 149,995 | 68 MB | 37 MB |
| order_items | 299,893 | 74 MB | 28 MB |
| payments | 150,000 | 46 MB | 27 MB |
| reviews | 24,945 | 5,536 KB | 2,264 KB |
| customers | 5,000 | 1,736 KB | 880 KB |
| products | 500 | 992 KB | 784 KB |

Integridad referencial: **0 registros huérfanos** en order_items y payments.

---

## 2. MongoDB — Índices y optimización (Unidad 5)

### 2.1 explain('executionStats')

| Consulta | Stage | Docs examinados | Docs retornados | Tiempo (ms) | Eficiencia |
|---|---|---|---|---|---|
| Catálogo laptops por rating (ESR) | SORT | 76 | 76 | 2 | 100% |
| Productos activos con stock (parcial) | FETCH | 679 | 676 | 1 | 99.6% |
| Productos con rating alto | FETCH | 328 | 328 | 0 | 100% |

### 2.2 Comparativa antes/después de índices ESR

| Consulta | Antes (ms) | Después (ms) | Cambio |
|---|---|---|---|
| Catálogo laptops ESR | 101.36 | 183.26 | -80.8% (overhead con 1,200 docs) |
| Reviews por producto ESR | 141.47 | 102.37 | **+27.6%** |

### 2.3 Índices MongoDB (5 totales)

| Índice | Tipo | Tamaño |
|---|---|---|
| `idx_esr_status_category_rating_price` | B-tree compuesto ESR | 40 KB |
| `idx_esr_reviews_product_score_date` | B-tree compuesto ESR | Medido |
| `idx_partial_active_instock` | B-tree parcial | 36 KB |
| `idx_text_search` | Text index (español) | 336 KB |
| `{category:1, _id:'hashed'}` | Shard key teórica | N/A en M0 |

### 2.4 Infraestructura del cluster

| Parámetro | Valor |
|---|---|
| Versión MongoDB | 8.0.26 |
| Topología | 1 PRIMARY + 2 SECONDARY (confirmado vía `replSetGetStatus`) |
| Health de nodos | 1.0 en los 3 nodos |
| HHI de sharding (simulado) | 0.1482 (distribución saludable, < 0.15) |

### 2.5 Write Concerns medidos

| Write Concern | Latencia promedio | Durabilidad |
|---|---|---|
| w=1 (default) | 143.17 ms | Media |
| w=majority | 143.31 ms | Alta |
| w=majority + j=true | 102.29 ms | Máxima |

---

## 3. Pruebas de Carga y Escalabilidad (Unidad 6)

### 3.1 Carga concurrente — PostgreSQL (Supabase, transaction pooler)

| Query | Concurrencia 1 | Concurrencia 50 | Errores @ 50 |
|---|---|---|---|
| Q2_catalogo | 0.51 qps | 17.97 qps | 23 |
| Q6_top_productos | 0.33 qps | 13.13 qps | 109 |
| Q8_pagos_pendientes | 0.34 qps | 18.40 qps | 18 |

**Punto de quiebre:** errores comienzan en concurrencia 10-25, coincidiendo con el límite del pool de conexiones (15) del plan Nano.

### 3.2 Carga concurrente — MongoDB (Atlas M0)

| Query | Concurrencia 1 | Concurrencia 50 | Errores @ 50 |
|---|---|---|---|
| catalogo_laptops_esr | 7.27 qps | 90.84 qps | 0 |
| productos_activos_stock | 9.03 qps | 92.35 qps | 0 |
| productos_rating_alto | 11.05 qps | 103.17 qps | 0 |

**Resultado clave:** 0 errores en los 5 niveles de concurrencia probados.

### 3.3 Escalabilidad por ventana temporal (PostgreSQL)

| Ventana | Tiempo (ms) | Filas agregadas |
|---|---|---|
| 1 mes | 3,025.30 | 12 |
| 3 meses | 1,638.60 | 24 |
| 6 meses | 1,337.73 | 42 |
| 1 año | 2,280.74 | 78 |
| Todo (10 años) | 1,401.53 | 222 |

**Hallazgo:** no hay relación lineal entre ventana de tiempo y latencia — el costo dominante es la conexión/red, no el volumen de filas, con el tamaño de dataset actual.

### 3.4 Queries complejas multi-tabla

| Operación | Tiempo medido |
|---|---|
| Refresh `mv_sales_by_category_monthly` (PostgreSQL) | 2,848.06 ms |
| Refresh `mv_customer_segments` (PostgreSQL) | 3,890.55 ms |
| Refresh `mv_product_performance` (PostgreSQL) | 5,818.68 ms |
| Pipeline agregación 7 stages (MongoDB) | 167.85 ms |

### 3.5 Replication Lag medido (MongoDB Atlas, 30 muestras)

| Estadístico | Valor |
|---|---|
| Mínimo | 161.94 ms |
| Mediana | 195.49 ms |
| **Promedio** | **269.59 ms** |
| P95 | 1,125.27 ms |
| Máximo | 1,330.44 ms |
| Timeouts (>3s) | 0 |

**Hallazgo crítico:** el lag promedio y p95 superan el umbral teórico de 200ms asumido en el diseño de la estrategia `secondaryPreferred` de la Unidad 5.

---

## 4. Resumen de mejoras más significativas

| # | Mejora | Métrica |
|---|---|---|
| 1 | Índice parcial pagos pendientes (PostgreSQL) | **+33.1%** |
| 2 | Índice ESR reviews por producto (MongoDB) | +27.6% |
| 3 | Tolerancia a concurrencia sin errores (MongoDB vs PostgreSQL) | 0 vs 150 errores totales |
| 4 | Reducción de tamaño de índice temporal (BRIN vs B-tree) | 128 KB vs 8 MB |
| 5 | Reducción de tamaño de índice parcial vs completo (MongoDB) | 36 KB vs 40 KB |

## 5. Deuda técnica documentada

| Hallazgo | Causa | Impacto medido |
|---|---|---|
| Cast `o.id::TEXT = oi.order_id` | `orders.id` es UUID, `order_items.order_id` es VARCHAR | Anula índices en Q1, Q3, Q5 (-360%, -1.7%, -1603%) |
| Replication lag superior al esperado | Tier M0 compartido, sin SLA de replicación | Promedio 269.59ms vs 200ms asumido |
| Pool de conexiones agotado | Plan Nano de Supabase limita a 15 conexiones | Errores desde concurrencia 10-25 |

---

*Fuentes: Supabase SQL Editor (tabla `explain_metrics`), notebooks `MongoDB_U5_Optimizacion_Ecommify.ipynb` y `Load_Testing_Performance_U6.ipynb`, ejecutados contra infraestructura productiva real.*
