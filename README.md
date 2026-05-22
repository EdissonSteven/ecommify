# Ecommify — Plataforma de E-commerce Multivendedor

Proyecto backend + frontend para la materia **Fundamentos de Testing, Verificación y Validación** (Universidad de La Sabana). Implementa TDD con patrón AAA + Given-When-Then, cobertura >75% y arquitectura políglota (PostgreSQL + MongoDB).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express |
| Testing | Jest 29 |
| BD relacional | PostgreSQL 16 vía `pg` |
| BD documental | MongoDB 7 vía `mongoose` |
| Frontend | React + Vite 5 (servido por nginx) |
| Auth | JWT + bcryptjs |
| Contenedores | Docker + Docker Compose |

---

## Instalación

### Backend

```bash
cd backend
npm install
cp ../.env.example .env   # completa tus credenciales
```

### Frontend

```bash
cd frontend
npm install
```

---

## Ejecución

### Iniciar la API

```bash
cd backend
npm start
```

### Iniciar el frontend

```bash
cd frontend
npm run dev
```

---

## Ejecución con Docker (recomendado)

> Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

### Levantar el stack completo

```bash
docker compose up -d
```

Esto arranca **4 servicios** en orden garantizado por healthchecks:

| Servicio | Imagen | Puerto | Descripción |
|---|---|---|---|
| `ecommify-postgres` | `postgres:16-alpine` | `5432` | BD relacional — carga schema y datos semilla automáticamente |
| `ecommify-mongo` | `mongo:7-jammy` | `27017` | BD documental — 8 productos del catálogo y 4 reseñas de prueba |
| `ecommify-backend` | `trabajofinal-backend` | `3000` | API REST Node.js + Express |
| `ecommify-frontend` | `trabajofinal-frontend` | `5173` | React servido por nginx con proxy inverso a `/api` |

Una vez levantado, abre **http://localhost:5173** en el navegador.

### Otros comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f backend

# Reconstruir imágenes tras cambios en el código
docker compose up -d --build

# Detener todos los contenedores
docker compose down

# Detener y eliminar volúmenes (borra datos de BD)
docker compose down -v
```

### Credenciales de prueba (precargadas)

| Rol | Email | Contraseña |
|---|---|---|
| Vendedor | `techstore@ecommify.com` | `Test1234!` |
| Vendedor | `gadget@ecommify.com` | `Test1234!` |
| Cliente | `ana@example.com` | `Test1234!` |
| Cliente | `carlos@example.com` | `Test1234!` |

---

## Ejecutar pruebas

```bash
cd backend
npm test
```

La salida mostrará el resultado de los 67 tests y el reporte de cobertura:

```
Test Suites: 6 passed, 6 total
Tests:       67 passed, 67 total

-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |    98.3 |    89.28 |     100 |     100 |
 auth/auth.service.js  |   93.33 |     87.5 |     100 |     100 |
 cart/cart.service.js  |     100 |       75 |     100 |     100 |
 catalog/...           |     100 |     90.9 |     100 |     100 |
 checkout/...          |     100 |    88.88 |     100 |     100 |
 inventory/...         |     100 |     100  |     100 |     100 |
 reviews/...           |     100 |     100  |     100 |     100 |
-----------------------|---------|----------|---------|---------|
```

El reporte HTML se genera en `backend/coverage/lcov-report/index.html`.

---

## Arquitectura de carpetas

```
ecommify/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       (auth.service.js, auth.controller.js, auth.routes.js)
│   │   │   ├── catalog/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── reviews/
│   │   │   └── inventory/
│   │   ├── db/
│   │   │   ├── postgres.js
│   │   │   └── mongo.js
│   │   └── app.js
│   ├── tests/              (6 archivos *.service.test.js)
│   ├── jest.config.js
│   └── package.json
├── frontend/
│   └── src/
│       ├── pages/          (Login, Register, Catalog, ProductDetail, Cart, Checkout, SellerInventory)
│       ├── components/     (Navbar)
│       └── api/
├── .env.example
└── .gitignore
```

---

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login y obtención de JWT |
| GET | `/api/catalog` | Listado con filtros (`category`, `minPrice`, `maxPrice`, `minRating`) |
| GET | `/api/catalog/:id` | Detalle de producto |
| GET | `/api/cart/:userId` | Ver carrito |
| POST | `/api/cart/:userId/items` | Agregar ítem al carrito |
| DELETE | `/api/cart/:userId/items/:productId` | Eliminar ítem |
| PATCH | `/api/cart/:userId/items/:productId` | Actualizar cantidad |
| POST | `/api/checkout/orders` | Crear orden de compra |
| POST | `/api/reviews` | Publicar review |
| GET | `/api/reviews/product/:productId` | Reviews de un producto |
| GET | `/api/inventory/seller/:sellerId` | Inventario del vendedor |
| PATCH | `/api/inventory/:productId` | Actualizar stock |

---

## Tabla de trazabilidad

| Test ID | Historia de Usuario | Criterio de Aceptación | Módulo | Archivo de test |
|---|---|---|---|---|
| CP-AU-01 | HU-01 Registro | Valida formato RFC del correo | auth | `tests/auth/auth.service.test.js` |
| CP-AU-02 | HU-01 Registro | Email sin @ es inválido | auth | `tests/auth/auth.service.test.js` |
| CP-AU-03 | HU-01 Registro | Contraseña ≥8 chars, mayúscula, número | auth | `tests/auth/auth.service.test.js` |
| CP-AU-04 | HU-01 Registro | Contraseña sin mayúscula es débil | auth | `tests/auth/auth.service.test.js` |
| CP-AU-05 | HU-01 Registro | Contraseña corta (<8) es inválida | auth | `tests/auth/auth.service.test.js` |
| CP-AU-06 | HU-02 Login | generateJWT retorna string no vacío | auth | `tests/auth/auth.service.test.js` |
| CP-AU-07 | HU-02 Login | verifyJWT con token válido retorna payload | auth | `tests/auth/auth.service.test.js` |
| CP-AU-08 | HU-02 Login | verifyJWT con token inválido retorna null | auth | `tests/auth/auth.service.test.js` |
| CP-AU-09 | HU-02 Login | 2 intentos: cuenta no bloqueada | auth | `tests/auth/auth.service.test.js` |
| CP-AU-10 | HU-02 Login | 3 intentos: cuenta bloqueada 5 min | auth | `tests/auth/auth.service.test.js` |
| CP-CT-01 | HU-03 Búsqueda | Filtra por rango de precio (dentro) | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-02 | HU-03 Búsqueda | Excluye productos fuera del rango | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-03 | HU-03 Búsqueda | Filtra solo por categoría | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-04 | HU-03 Búsqueda | Filtra por rating mínimo | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-05 | HU-03 Búsqueda | Aplica 3 filtros simultáneamente | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-06 | HU-04 Detalle | stock=0 → producto no disponible | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-07 | HU-04 Detalle | stock=5 → producto disponible | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CT-08 | HU-04 Detalle | formatProductSummary retorna campos requeridos | catalog | `tests/catalog/catalog.service.test.js` |
| CP-CR-01 | HU-05 Carrito | calculateSubtotal con 2 ítems | cart | `tests/cart/cart.service.test.js` |
| CP-CR-02 | HU-05 Carrito | calculateSubtotal con carrito vacío = 0 | cart | `tests/cart/cart.service.test.js` |
| CP-CR-03 | HU-05 Carrito | calculateDiscount(100, 10) = 90 | cart | `tests/cart/cart.service.test.js` |
| CP-CR-04 | HU-05 Carrito | calculateTotal con subtotal, descuento y tax | cart | `tests/cart/cart.service.test.js` |
| CP-CR-05 | HU-05 Carrito | validateStockLimit lanza error si qty > stock | cart | `tests/cart/cart.service.test.js` |
| CP-CR-06 | HU-05 Carrito | validateStockLimit no lanza si qty <= stock | cart | `tests/cart/cart.service.test.js` |
| CP-CR-07 | HU-05 Carrito | addItemToCart agrega ítem correctamente | cart | `tests/cart/cart.service.test.js` |
| CP-CR-08 | HU-05 Carrito | removeItemFromCart elimina el ítem correcto | cart | `tests/cart/cart.service.test.js` |
| CP-CR-09 | HU-05 Carrito | updateItemQuantity actualiza subtotal | cart | `tests/cart/cart.service.test.js` |
| CP-CH-01 | HU-06 Checkout | Dirección completa → { valid: true } | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-02 | HU-06 Checkout | Dirección sin ciudad → error "city required" | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-03 | HU-06 Checkout | validatePaymentMethod("credit_card") = true | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-04 | HU-06 Checkout | validatePaymentMethod("bitcoin") = false | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-05 | HU-06 Checkout | generateOrderNumber retorna prefijo "ORD-" | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-06 | HU-06 Checkout | calculateOrderTotal suma ítems + envío | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-07 | HU-06 Checkout | processStockDecrement con stock suficiente | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-08 | HU-06 Checkout | processStockDecrement lanza error sin mutar inventario | checkout | `tests/checkout/checkout.service.test.js` |
| CP-CH-09 | HU-06 Checkout | buildOrderSummary retorna campos orderId, total, items, address | checkout | `tests/checkout/checkout.service.test.js` |
| CP-RV-01 | HU-07 Reviews | validateReviewScore(4) = true | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-02 | HU-07 Reviews | validateReviewScore(0) = false | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-03 | HU-07 Reviews | validateReviewScore(6) = false | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-04 | HU-07 Reviews | validateReviewScore(3.5) = false (no entero) | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-05 | HU-07 Reviews | canUserReview sin compras = false | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-06 | HU-07 Reviews | canUserReview con compra entregada = true | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-07 | HU-07 Reviews | hasExistingReview cuando ya existe = true | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-08 | HU-07 Reviews | hasExistingReview cuando no existe = false | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-09 | HU-07 Reviews | calculateAverageRating([5,4,3]) = 4.00 | reviews | `tests/reviews/reviews.service.test.js` |
| CP-RV-10 | HU-07 Reviews | calculateAverageRating([]) = 0 | reviews | `tests/reviews/reviews.service.test.js` |
| CP-PV-01 | HU-08 Inventario | validateStockValue(10) = true | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-02 | HU-08 Inventario | validateStockValue(-1) = false | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-03 | HU-08 Inventario | validateStockValue(0) = true (válido) | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-04 | HU-08 Inventario | isOutOfStock(0) = true | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-05 | HU-08 Inventario | isOutOfStock(1) = false | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-06 | HU-08 Inventario | applyStockUpdate(10, 25) → delta +15 | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-07 | HU-08 Inventario | applyStockUpdate(5, 0) → isOutOfStock true | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-08 | HU-08 Inventario | buildStockHistoryEntry retorna timestamp, userId, etc. | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-09 | HU-08 Inventario | validateSellerOwnership con propietario = true | inventory | `tests/inventory/inventory.service.test.js` |
| CP-PV-10 | HU-08 Inventario | validateSellerOwnership con otro seller = false | inventory | `tests/inventory/inventory.service.test.js` |

---

## Patrones de prueba aplicados

Todos los tests siguen el patrón **AAA (Arrange-Act-Assert)** combinado con **Given-When-Then**:

```javascript
test('Given a valid email, When validateEmail is called, Then it returns true', () => {
  // Arrange
  const validEmail = 'usuario@example.com';

  // Act
  const result = validateEmail(validEmail);

  // Assert
  expect(result).toBe(true);
});
```

---

## Variables de entorno

Ver [.env.example](.env.example) para la lista completa de variables requeridas.

---

## Tecnologías y dependencias clave

```json
{
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^8.24.0",
    "pg": "^8.21.0"
  },
  "devDependencies": {
    "jest": "^29.x"
  }
}
```
