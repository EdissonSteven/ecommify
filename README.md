# Ecommify — Plataforma E-commerce Multivendedor

**Universidad de La Sabana — Maestría en Arquitectura de Software**

| | |
|---|---|
| **Proyecto** | Ecommify — Plataforma e-commerce multivendedor de productos tecnológicos |
| **Asignatura** | Optimización de Bases de Datos / Testing, Verificación y Validación |
| **Integrantes** | David Ricardo Grandas Cárdenas · Danilo Andrés Cortés Saavedra · Edisson Steven Bustos Galeano |
| **Dataset** | [Brazilian E-Commerce (Olist) — Kaggle](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) |

---

## Arquitectura políglota de datos

Ecommify implementa una arquitectura de persistencia políglota donde cada motor resuelve el problema para el que está optimizado:

```
┌─────────────────────────────────────────────────────────────┐
│                     ECOMMIFY BACKEND                        │
│                    (Node.js + Express)                      │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
       ┌───────▼────────┐        ┌────────▼────────┐
       │  PostgreSQL 15  │        │   MongoDB 8     │
       │    Supabase     │        │  Atlas M0       │
       │  (transaccional)│        │  (documental)   │
       ├────────────────┤        ├─────────────────┤
       │ • sellers       │        │ • products      │
       │ • customers     │        │   (catálogo     │
       │ • products      │        │    rico + specs)│
       │   (inventario)  │        │ • reviews       │
       │ • orders        │        │ • user_behavior │
       │   (particionada)│        │   (TTL 30 días) │
       │ • order_items   │        │ • analytics_    │
       │ • payments      │        │   snapshots     │
       │ • promotions    │        │   (TTL 90 días) │
       │ • stock_history │        └─────────────────┘
       └────────────────┘
```

**PostgreSQL** maneja datos transaccionales (ACID): órdenes, pagos, inventario, autenticación.  
**MongoDB** maneja datos documentales: catálogo rico (specs variables por categoría), reseñas, comportamiento de usuarios.

---

## Estructura del repositorio

```
ecommify/
├── schema/                              ← Scripts DDL PostgreSQL (ejecutar en orden)
│   ├── 00_base_schema.sql               ← Tablas base: sellers, customers, products,
│   │                                       orders, order_items, payments, reviews
│   ├── 01_extensions.sql                ← pg_trgm, btree_gin, btree_gist, pgcrypto,
│   │                                       uuid-ossp, pg_stat_statements
│   ├── 02_advanced_types.sql            ← JSONB, TEXT[], TSTZRANGE, tipo address_type,
│   │                                       tabla promotions con EXCLUDE USING GIST
│   ├── 03_partitioning.sql              ← orders particionada RANGE(created_at)
│   │                                       16 particiones trimestrales 2016-2026
│   ├── 04_materialized_views.sql        ← mv_sales_by_category_monthly,
│   │                                       mv_customer_segments, mv_product_performance
│   ├── 05_triggers.sql                  ← updated_at automático, auditoría de
│   │                                       order_status, control de stock
│   └── 06_maintenance_jobs.sql          ← pg_cron jobs, vistas OLTP/OLAP
│
├── seed_data/                           ← Datos de prueba
│   ├── 01_seed.sql                      ← Datos base: 2 sellers, 2 customers,
│   │                                       8 products con specs, tags y promociones
│   ├── 02_seed_masivo.sql               ← Datos sintéticos masivos compatibles
│   │                                       con Supabase: 5k clientes, 20 vendors,
│   │                                       500 products, 150k órdenes, 300k items
│   └── 03_optimizacion_analisis.sql     ← 8 queries EXPLAIN ANALYZE (antes/después)
│                                           + 10 índices especializados optimizados
│
├── notebooks/                           ← Análisis y optimización (Google Colab)
│   ├── MongoDB_U5_Optimizacion_Ecommify.ipynb ← Optimización Atlas: índices ESR,
│   │                                              .explain(), pipeline 7 stages,
│   │                                              replica set, Write Concerns
│   └── PostgreSQL_U4_Ecommify_Optimizacion.ipynb
│
├── evidencias/                          ← Capturas de métricas reales
│   ├── supabase_explain_antes_despues.png
│   ├── supabase_tabla_comparativa.png
│   ├── atlas_explain_stats.png
│   └── atlas_replica_set.png
│
├── docs/
│   └── Documento_Tecnico_U5_Ecommify_APA7.docx ← Documento técnico completo APA7
│
├── backend/                             ← API REST Node.js + Express
├── frontend/                            ← React + Vite servido por nginx
├── docker-compose.yml
└── .env.example
```

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | Node.js + Express | 20 / 5 |
| Testing | Jest | 29 |
| BD relacional | PostgreSQL en Supabase | 15 |
| BD documental | MongoDB en Atlas | M0 v8.0.26 |
| Frontend | React + Vite (nginx) | 18 / 5 |
| Auth | JWT + bcryptjs | rounds=10 |
| Contenedores | Docker + Docker Compose | — |

---

## Setup en Supabase (PostgreSQL — Unidad 5)

### Infraestructura real utilizada

| Parámetro | Valor |
|---|---|
| Plataforma | Supabase free tier |
| Región | us-west-2 (Oregon) |
| Motor | PostgreSQL 15 |
| URL | smaliszofgizhffpnlha.supabase.co |

### Ajustes previos requeridos

Antes de ejecutar el seed masivo, aplicar estos ajustes en el SQL Editor de Supabase:

```sql
-- 1. Permitir seed sin restricciones NOT NULL
ALTER TABLE orders      ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE orders      ALTER COLUMN total    DROP NOT NULL;

-- 2. Ampliar columnas para UUIDs (36 chars)
ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(36);
ALTER TABLE payments    ALTER COLUMN order_id TYPE VARCHAR(36);

-- 3. Desactivar triggers durante seed masivo
ALTER TABLE order_items DISABLE TRIGGER USER;
ALTER TABLE payments    DISABLE TRIGGER USER;
```

### Orden de ejecución en Supabase SQL Editor

```
1. Activar extensiones desde Dashboard → Database → Extensions:
   uuid-ossp, pg_trgm, btree_gin, pgcrypto

2. schema/00_base_schema.sql
3. schema/02_advanced_types.sql
4. schema/03_partitioning.sql
5. schema/04_materialized_views.sql
6. schema/05_triggers.sql
7. schema/06_maintenance_jobs.sql
8. seed_data/01_seed.sql
9. seed_data/02_seed_masivo.sql          ← ~5-8 minutos
10. seed_data/03_optimizacion_analisis.sql ← Crea 10 índices + EXPLAIN
```

> ⚠️ `CREATE INDEX CONCURRENTLY` no está soportado en Supabase SQL Editor.
> Los scripts ya incluyen `CREATE INDEX` sin `CONCURRENTLY`.

### Datos cargados y verificados

| Tabla | Registros | Integridad |
|---|---|---|
| customers | 5.000 | ✅ |
| sellers | 20 | ✅ |
| products | 500 | ✅ |
| orders | 150.000 | ✅ 0 huérfanos |
| order_items | 299.893 | ✅ 0 huérfanos |
| payments | 150.000 | ✅ 0 huérfanos |
| reviews | ~25.254 | ✅ |

---

## Setup en MongoDB Atlas (Unidad 5)

### Infraestructura real utilizada

| Parámetro | Valor |
|---|---|
| Plataforma | MongoDB Atlas M0 (free tier) |
| Versión | 8.0.26 |
| Cluster | ecommify.xdwdeqf.mongodb.net |
| Colecciones | products (1.200) · reviews (1.984) |

### Ejecutar notebook de optimización

```bash
# Abrir en Google Colab o Jupyter local
notebooks/MongoDB_U5_Optimizacion_Ecommify.ipynb

# Configurar MONGODB_URI en la celda de conexión:
MONGODB_URI = 'mongodb+srv://<usuario>:<password>@ecommify.xdwdeqf.mongodb.net/?appName=ecommify'
```

El notebook ejecuta:
- Creación de índices ESR compuestos y parciales
- `.explain('executionStats')` antes y después de cada índice
- Pipeline de agregación de 7 stages con `allowDiskUse=True`
- Estado real del replica set (3 nodos)
- Medición de Write Concerns (w=1, majority, majority+j)

---

## Resultados de optimización (métricas reales)

### PostgreSQL — EXPLAIN ANALYZE

| Query | Descripción | Antes (ms) | Después (ms) | Mejora |
|---|---|---|---|---|
| Q2 | Catálogo con filtros y reviews | 404.14 | 389.29 | +3.7% |
| Q4 | Búsqueda ILIKE productos | 21.45 | 19.63 | +8.5% |
| Q6 | Top 10 productos más vendidos | 2910 | 2620 | +10.0% |
| Q7 | Verificación producto por PK | 0.001 | 0.001 | Óptima |
| Q8 | Pagos pendientes por método | 341.20 | 228.17 | **+33.1%** |

> Q1, Q3 y Q5 presentan degradación por cast `o.id::TEXT = oi.order_id`.
> Ver sección Deuda Técnica.

### MongoDB — .explain('executionStats')

| Consulta | Docs examinados | Docs retornados | Tiempo (ms) | Eficiencia |
|---|---|---|---|---|
| Catálogo laptops por rating (ESR) | 76 | 76 | 2 | 100% |
| Productos activos con stock (parcial) | 679 | 676 | 1 | 99.6% |
| Productos con rating alto | 328 | 328 | 0 | 100% |

---

## Índices especializados implementados

### PostgreSQL (10 índices)

| Índice | Tipo | Tabla | Mejora principal |
|---|---|---|---|
| `idx_orders_customer_id` | B-tree | orders | Q1: historial cliente |
| `idx_orders_status_created_at` | B-tree compuesto ESR | orders | Q5: reportes por fecha |
| `idx_products_category_price_stock` | B-tree parcial | products | Q2: catálogo activo |
| `idx_products_specifications_gin` | GIN JSONB | products | Consultas con @> |
| `idx_products_name_trgm` | GIN trigrama | products | Q4: búsqueda ILIKE |
| `idx_order_items_product_id` | B-tree | order_items | Q3/Q6: JOIN frecuente |
| `idx_payments_order_id_status` | B-tree compuesto | payments | Q5: JOIN + filtro estado |
| `idx_orders_created_at_brin` | BRIN | orders | ~128 KB vs 8 MB B-tree |
| `idx_payments_pending_recent` | Parcial B-tree | payments | **Q8: +33.1%** |
| `idx_reviews_product_rating` | B-tree compuesto | reviews | Q2: JOIN + sort |

### MongoDB (5 índices)

| Índice | Colección | Tipo | Tamaño |
|---|---|---|---|
| `idx_esr_status_category_rating_price` | products | B-tree compuesto ESR | 40 KB |
| `idx_esr_reviews_product_score_date` | reviews | B-tree compuesto ESR | Medido |
| `idx_partial_active_instock` | products | Parcial B-tree | 36 KB |
| `idx_text_search` | products | Text index (español) | 336 KB |
| `{category:1, _id:'hashed'}` | products | Shard key teórica | N/A M0 |

---

## Deuda técnica documentada

El cast `o.id::TEXT = oi.order_id` en los JOINs impide el uso eficiente de índices en Q1, Q3 y Q5.

**Causa:** `orders.id` es `UUID` pero `order_items.order_id` es `VARCHAR(36)`.

**Solución arquitectónica:**
```sql
-- Migración requerida para eliminar el cast:
ALTER TABLE order_items ALTER COLUMN order_id TYPE UUID
  USING order_id::UUID;
ALTER TABLE payments ALTER COLUMN order_id TYPE UUID
  USING order_id::UUID;
-- Luego recrear los índices afectados
```

---

## Setup con Docker (desarrollo local)

```bash
# 1. Clonar variables de entorno
cp .env.example .env

# 2. Levantar el stack completo
docker compose up -d
```

| Servicio | Puerto | Descripción |
|---|---|---|
| `ecommify-postgres` | `5432` | PostgreSQL 15 |
| `ecommify-mongo` | `27017` | MongoDB 8 |
| `ecommify-backend` | `3000` | API REST Node.js |
| `ecommify-frontend` | `5173` | React + nginx |

Abrir **http://localhost:5173** en el navegador.

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Vendedor | `techstore@ecommify.com` | `Test1234!` |
| Vendedor | `gadget@ecommify.com` | `Test1234!` |
| Cliente | `ana@example.com` | `Test1234!` |
| Cliente | `carlos@example.com` | `Test1234!` |

---

## Pruebas unitarias (Unidades 1-3)

- **67 tests** organizados en 6 módulos — 67/67 PASS
- **Cobertura:** Statements 98.3% · Branches 89.28% · Functions 100% · Lines 100%
- **Framework:** Jest 29 · **Patrones:** TDD + AAA + Given-When-Then

```bash
cd backend
npm test                 # Todos los tests
npm run test:coverage    # Con reporte HTML
npm run test:ci          # Modo CI/CD
```

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |    98.3 |    89.28 |     100 |     100 |
 auth.service.js       |   93.33 |     87.5 |     100 |     100 |
 cart.service.js       |     100 |       75 |     100 |     100 |
 catalog.service.js    |     100 |     90.9 |     100 |     100 |
 checkout.service.js   |     100 |    88.88 |     100 |     100 |
 inventory.service.js  |     100 |      100 |     100 |     100 |
 reviews.service.js    |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|
Test Suites: 6 passed, 6 total  |  Tests: 67 passed, 67 total
```

### Documentación de testing

| Documento | Ubicación |
|---|---|
| Plan de pruebas | `backend/docs/TEST_PLAN.md` |
| Matriz de trazabilidad (67 filas) | `backend/docs/TRACEABILITY_MATRIX.md` |
| Reporte HTML de cobertura | `backend/coverage/index.html` |
| Log de ejecución | `backend/tests/evidence/test-output.txt` |

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login y JWT |
| GET | `/api/catalog` | Listado con filtros |
| GET | `/api/catalog/:id` | Detalle de producto |
| GET | `/api/cart/:userId` | Ver carrito |
| POST | `/api/cart/:userId/items` | Agregar ítem |
| DELETE | `/api/cart/:userId/items/:productId` | Eliminar ítem |
| PATCH | `/api/cart/:userId/items/:productId` | Actualizar cantidad |
| POST | `/api/checkout/orders` | Crear orden |
| POST | `/api/reviews` | Publicar reseña |
| GET | `/api/reviews/product/:productId` | Reseñas de un producto |
| GET | `/api/inventory/seller/:sellerId` | Inventario del vendedor |
| PATCH | `/api/inventory/:productId` | Actualizar stock |

---

## Comandos Docker adicionales

```bash
docker compose logs -f backend      # Logs en tiempo real
docker compose up -d --build        # Reconstruir tras cambios
docker compose down                 # Detener contenedores
docker compose down -v              # Detener y borrar volúmenes
```

---

## Documentación adicional

| Documento | Descripción |
|---|---|
| `docs/Documento_Tecnico_U5_Ecommify_APA7.docx` | Documento técnico completo U5 — APA7 |
| `notebooks/MongoDB_U5_Optimizacion_Ecommify.ipynb` | Optimización MongoDB con métricas reales |
| `seed_data/03_optimizacion_analisis.sql` | EXPLAIN ANALYZE + 10 índices PostgreSQL |
| `docs/Extensiones_PostgreSQL_Ecommify.md` | Análisis detallado de extensiones |