# Ecommify — Plataforma E-commerce Multivendedor

**Universidad de La Sabana — Maestría en Arquitectura de Software**

| | |
|---|---|
| **Proyecto** | Ecommify — Plataforma e-commerce multivendedor de productos tecnológicos |
| **Asignatura** | Optimización de Bases de Datos (Arquitectura y selección de tecnologías) |
| **Integrantes** | David Ricardo Grandas Cárdenas · Danilo Andrés Cortés Saavedra · Edisson Steven Bustos Galeano |
| **Dataset base** | [Brazilian E-Commerce (Olist) — Kaggle](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) |

---

## Resumen del proyecto

Ecommify implementa una **arquitectura de persistencia políglota**: PostgreSQL en Supabase para el módulo transaccional (órdenes, pagos, inventario) y MongoDB en Atlas para el módulo analítico (catálogo, reseñas, comportamiento de usuarios). Esta arquitectura fue diseñada, implementada, optimizada y evaluada empíricamente a lo largo de seis unidades del curso, con **datos reales medidos contra infraestructura productiva** — no simulaciones locales.

```
┌─────────────────────────────────────────────────────────────┐
│                     ECOMMIFY BACKEND                        │
│                    (Node.js + Express)                      │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
       ┌───────▼────────┐        ┌────────▼────────┐
       │  PostgreSQL 15  │        │   MongoDB 8     │
       │    Supabase     │        │  Atlas M0       │
       │ Prioridad CAP:  │        │ Prioridad CAP:  │
       │      CP         │        │      AP         │
       ├────────────────┤        ├─────────────────┤
       │ • customers     │        │ • products      │
       │ • sellers       │        │   (catálogo     │
       │ • products      │        │    enriquecido) │
       │ • orders        │        │ • reviews       │
       │   (particionada)│        │ • user_behavior │
       │ • order_items   │        │   (TTL 30 días) │
       │ • payments      │        │ • analytics_    │
       │ • promotions    │        │   snapshots     │
       └────────────────┘        └─────────────────┘
```

---

## Estructura del repositorio

```
ecommify/
├── schema/                              ← Scripts DDL PostgreSQL (ejecutar en orden)
│   ├── 00_base_schema.sql
│   ├── 01_extensions.sql
│   ├── 02_advanced_types.sql
│   ├── 03_partitioning.sql
│   ├── 04_materialized_views.sql        ← Corregido: joins o.id::TEXT, status 'completed'
│   ├── 05_triggers.sql
│   └── 06_maintenance_jobs.sql
│
├── seed_data/
│   ├── 01_seed.sql
│   ├── 02_seed_masivo.sql               ← Compatible con Supabase (150k órdenes)
│   └── 03_optimizacion_analisis.sql     ← 10 índices + EXPLAIN ANALYZE corregido
│
├── notebooks/
│   ├── MongoDB_U5_Optimizacion_Ecommify.ipynb     ← Índices ESR, sharding, replica set
│   └── Load_Testing_Performance_U6.ipynb          ← Carga concurrente, escalabilidad, CAP
│
├── docs/
│   ├── Documento_Tecnico_U5_Ecommify_APA7.docx    ← Implementación y optimización detallada
│   ├── Informe_Tecnico_Integral_U6_Ecommify.docx  ← Arquitectura, rendimiento, análisis CAP
│   └── Presentacion_Ejecutiva_U6_Ecommify.pptx    ← Presentación de alto nivel (11 slides)
│
├── resultados/
│   └── RESULTADOS_CONSOLIDADOS_U5_U6.md           ← Todas las métricas en un solo lugar
│
├── evidencias/
│   ├── supabase_01_comparativa_before_after.png
│   ├── supabase_02_tamano_indices.png
│   ├── supabase_03_volumen_tablas.png
│   ├── supabase_04_particiones_orders.png
│   ├── supabase_05_integridad_datos.png
│   ├── atlas_01_explain_stats.png
│   └── atlas_02_replica_set.png
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
| Testing unitario | Jest | 29 |
| BD relacional | PostgreSQL en Supabase | 15 |
| BD documental | MongoDB en Atlas | M0 v8.0.26 |
| Frontend | React + Vite (nginx) | 18 / 5 |
| Auth | JWT + bcryptjs | rounds=10 |
| Pruebas de carga | Python (ThreadPoolExecutor, psycopg2, pymongo) | 3.11 |

---

## Setup en Supabase (PostgreSQL)

### Infraestructura utilizada

| Parámetro | Valor |
|---|---|
| Plataforma | Supabase free tier (plan Nano) |
| Región | us-west-2 (Oregon) |
| Motor | PostgreSQL 15 |
| Conexión recomendada | Transaction pooler — `aws-1-us-west-2.pooler.supabase.com:6543` |

> ⚠️ El host de conexión directa (`db.<project>.supabase.co:5432`) requiere IPv6 y puede fallar
> en redes locales sin esa conectividad. Usar siempre el **connection pooler** para scripts externos.

### Ajustes previos requeridos (antes del seed masivo)

```sql
ALTER TABLE orders      ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE orders      ALTER COLUMN total    DROP NOT NULL;
ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(36);
ALTER TABLE payments    ALTER COLUMN order_id TYPE VARCHAR(36);
ALTER TABLE order_items DISABLE TRIGGER USER;
ALTER TABLE payments    DISABLE TRIGGER USER;
```

### Orden de ejecución

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
9. seed_data/02_seed_masivo.sql            ← ~5-8 minutos
10. seed_data/03_optimizacion_analisis.sql ← Crea 10 índices + EXPLAIN
```

### Datos cargados y verificados

| Tabla | Registros | Integridad |
|---|---|---|
| customers | 5,000 | ✅ |
| sellers | 20 | ✅ |
| products | 500 | ✅ |
| orders (16 particiones) | 149,995 | ✅ 0 huérfanos |
| order_items | 299,893 | ✅ 0 huérfanos |
| payments | 150,000 | ✅ 0 huérfanos |
| reviews | 24,945 | ✅ |

---

## Setup en MongoDB Atlas

### Infraestructura utilizada

| Parámetro | Valor |
|---|---|
| Plataforma | MongoDB Atlas M0 (free tier) |
| Versión | 8.0.26 |
| Cluster | `ecommify.xdwdeqf.mongodb.net` |
| Topología | 1 PRIMARY + 2 SECONDARY (replica set real) |
| Colecciones | products (1,200) · reviews (1,984) |

### Ejecutar notebooks

```bash
# Notebook de optimización (Unidad 5): índices ESR, explain(), pipeline, sharding teórico
jupyter notebook notebooks/MongoDB_U5_Optimizacion_Ecommify.ipynb

# Notebook de rendimiento (Unidad 6): carga concurrente, escalabilidad, replication lag
jupyter notebook notebooks/Load_Testing_Performance_U6.ipynb
```

Configurar `MONGODB_URI` y `PG_DSN` en la celda de conexión de cada notebook con las credenciales del proyecto.

---

## Resultados principales (resumen)

> Ver `resultados/RESULTADOS_CONSOLIDADOS_U5_U6.md` para el detalle completo de todas las métricas.

### PostgreSQL — EXPLAIN ANALYZE

| Query | Antes (ms) | Después (ms) | Mejora |
|---|---|---|---|
| Q8 — Pagos pendientes | 341.20 | 228.17 | **+33.1%** |
| Q6 — Top productos | 2,910 | 2,620 | +10.0% |
| Q4 — Búsqueda ILIKE | 21.45 | 19.63 | +8.5% |
| Q2 — Catálogo con filtros | 404.14 | 389.29 | +3.7% |

### MongoDB — explain('executionStats')

| Consulta | Eficiencia |
|---|---|
| Catálogo laptops (ESR) | 100% |
| Productos con rating alto | 100% |
| Productos activos con stock (parcial) | 99.6% |

### Carga concurrente (Unidad 6, 50 usuarios simulados)

| Motor | Throughput máx. | Errores |
|---|---|---|
| MongoDB (Atlas) | 95.5 qps | **0** |
| PostgreSQL (Supabase) | 16.5 qps | 150 (límite de pool de conexiones del free tier) |

### Replication Lag medido (MongoDB, 30 muestras)

| Promedio | P95 | Umbral teórico asumido |
|---|---|---|
| 269.59 ms | 1,125.27 ms | 200 ms — **superado** |

---

## Deuda técnica documentada

| Hallazgo | Causa | Solución propuesta |
|---|---|---|
| Cast `o.id::TEXT = oi.order_id` en JOINs | `orders.id` es UUID, `order_items.order_id` es VARCHAR | Migrar `order_items.order_id` y `payments.order_id` a tipo UUID |
| Pool de conexiones agotado (10-25 usuarios) | Plan Nano de Supabase limita a 15 conexiones | PgBouncer dedicado o plan superior |
| Replication lag superior a lo asumido | Tier M0 compartido sin SLA de replicación | Migrar a M10+ para producción |

---

## Análisis arquitectónico: Teorema CAP por módulo

| Módulo | Motor | Prioridad CAP | Justificación |
|---|---|---|---|
| Órdenes y pagos | PostgreSQL | **CP** | Rechaza escritura ante falla en lugar de arriesgar inconsistencia financiera |
| Catálogo (lectura) | MongoDB `secondaryPreferred` | **AP** | Tolera el lag medido a cambio de disponibilidad y distribución de carga |
| Reseñas y eventos | MongoDB `w:1` / `w:0` | **AP** | Pérdida ocasional aceptable; no son datos financieros |

Detalle completo de escenarios de falla, trade-offs por escenario de negocio (Black Friday, auditoría financiera) y recomendaciones estratégicas en `docs/Informe_Tecnico_Integral_U6_Ecommify.docx`.

---

## Pruebas unitarias (Unidades 1-3)

- **67 tests** organizados en 6 módulos — 67/67 PASS
- **Cobertura:** Statements 98.3% · Branches 89.28% · Functions 100% · Lines 100%
- **Framework:** Jest 29 · **Patrones:** TDD + AAA + Given-When-Then

```bash
cd backend
npm test                 # Todos los tests
npm run test:coverage    # Con reporte HTML
```

---

## Setup con Docker (desarrollo local)

```bash
cp .env.example .env
docker compose up -d
```

| Servicio | Puerto |
|---|---|
| `ecommify-postgres` | 5432 |
| `ecommify-mongo` | 27017 |
| `ecommify-backend` | 3000 |
| `ecommify-frontend` | 5173 |

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Vendedor | `techstore@ecommify.com` | `Test1234!` |
| Cliente | `ana@example.com` | `Test1234!` |

---

## Documentación completa por unidad

| Unidad | Entregable | Ubicación |
|---|---|---|
| U5 | Documento técnico de implementación (APA7) | `docs/Documento_Tecnico_U5_Ecommify_APA7.docx` |
| U5 | Notebook de optimización MongoDB | `notebooks/MongoDB_U5_Optimizacion_Ecommify.ipynb` |
| U6 | Informe técnico integral (arquitectura + rendimiento + CAP) | `docs/Informe_Tecnico_Integral_U6_Ecommify.docx` |
| U6 | Presentación ejecutiva | `docs/Presentacion_Ejecutiva_U6_Ecommify.pptx` |
| U6 | Notebook de pruebas de carga y escalabilidad | `notebooks/Load_Testing_Performance_U6.ipynb` |
| U6 | Resultados consolidados de todas las pruebas | `resultados/RESULTADOS_CONSOLIDADOS_U5_U6.md` |
| U6 | Video de presentación final (12-15 min) | Enlace en la entrega de la plataforma del curso |

---

## Licencia y uso académico

Proyecto desarrollado con fines académicos para la Maestría en Arquitectura de Software de la Universidad de La Sabana. Dataset base bajo licencia de Kaggle (Olist Brazilian E-Commerce).