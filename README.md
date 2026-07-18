# NaturApp

Aplicación móvil de comercio electrónico de productos naturales, inspirada en Santa Natura. Proyecto académico del curso **Taller de Construcción de Software Móvil** — UNMSM, Ingeniería de Software.

A partir de la **Sesión 11** el proyecto es una aplicación **full-stack**: un **backend** Node.js/Express + MongoDB con endpoints RESTful, y un **frontend** React Native (Expo Router) que los consume vía HTTP.

## Arquitectura

```
┌─────────────────────────────┐        HTTP / JSON        ┌──────────────────────────────┐
│  Frontend (React Native)    │  ───────────────────────► │  Backend (Express)           │
│  app/  ·  src/hooks/        │                           │  routes/ · middleware/       │
│  src/services/apiService.js │  ◄─────────────────────── │  models/ (Mongoose)          │
└─────────────────────────────┘        { success, data }  └───────────────┬──────────────┘
                                                                           │
                                                                    ┌──────▼──────┐
                                                                    │  MongoDB    │
                                                                    └─────────────┘
```

- **Backend**: arquitectura modular (models / routes / middleware). Endpoints RESTful con CRUD, autenticación JWT y validación de negocio (stock, hash de contraseñas).
- **Frontend**: pantallas (Expo Router) → Custom Hooks (lógica) → `apiService` (consumo de endpoints). Estados de carga, paginación, búsqueda y pull-to-refresh.

## Estructura del Proyecto

```
naturapp/
├── backend/                    # API Express + MongoDB
│   ├── server.js               # Punto de entrada, middleware y rutas
│   ├── seed.js                 # Datos iniciales (categorías, productos, usuario demo)
│   ├── models/                 # Esquemas Mongoose
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── User.js
│   │   └── Order.js
│   ├── routes/                 # Endpoints RESTful
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   └── cartRoutes.js
│   └── middleware/
│       └── auth.js             # JWT: authenticate / authorize / generateToken
│
├── app/                        # Frontend — Navegación (Expo Router)
│   ├── _layout.js              # Stack raíz (detalle, modales, checkout)
│   ├── index.js                # Redirección a /home
│   ├── checkout.js             # Finalizar compra
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── product/[id].js         # Detalle de producto (ruta dinámica)
│   └── (tabs)/
│       ├── _layout.js          # Tab Navigator (5 tabs)
│       ├── home.js             # Catálogo + categorías + paginación
│       ├── search.js           # Búsqueda de productos
│       ├── cart.js             # Carrito
│       ├── orders.js           # Historial de pedidos
│       └── profile.js          # Perfil / sesión
├── src/
│   ├── services/
│   │   └── apiService.js       # Consumo de la API (ProductAPI, CartAPI, …)
│   ├── hooks/                  # Lógica de negocio (Custom Hooks)
│   │   ├── useProducts.js
│   │   ├── useCart.js
│   │   ├── useAuth.js
│   │   └── useOrders.js
│   └── components/             # Componentes reutilizables
│       ├── ProductCard.js
│       ├── CartItemRow.js
│       └── CategoryChips.js
│
├── docs/                       # Informes técnicos (informe-s10.md, informe-s11.md)
├── app.json
└── package.json
```

## Endpoints del Backend

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/products` | Listar productos (`?category=`, `?search=`, `?page=`, `?limit=`) | — |
| GET | `/api/products/:id` | Detalle de producto | — |
| POST/PUT/DELETE | `/api/products/:id?` | Crear / actualizar / eliminar (lógico) | admin |
| GET | `/api/categories` | Listar categorías | — |
| POST | `/api/users/register` | Registro (devuelve token JWT) | — |
| POST | `/api/users/login` | Inicio de sesión (devuelve token JWT) | — |
| GET/PUT | `/api/users/profile` | Ver / actualizar perfil | usuario |
| GET | `/api/cart` | Obtener carrito | usuario |
| POST | `/api/cart/add` | Agregar al carrito | usuario |
| PUT/DELETE | `/api/cart/:productId` | Actualizar cantidad / eliminar item | usuario |
| DELETE | `/api/cart` | Vaciar carrito | usuario |
| POST | `/api/orders` | Crear pedido (valida stock, descuenta inventario) | usuario |
| GET | `/api/orders` · `/api/orders/:id` | Listar / detalle de pedidos | usuario |
| PUT | `/api/orders/:id/cancel` | Cancelar pedido (restaura stock) | usuario |
| GET | `/api/health` | Health check | — |

Todas las respuestas siguen el formato `{ success, data }` o `{ success, message }` con códigos HTTP apropiados.

## Puesta en Marcha

### Requisitos
- Node.js 18+
- MongoDB en local (`mongodb://localhost:27017`) o una URI de MongoDB Atlas

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # ajusta PORT, MONGO_URI y JWT_SECRET si hace falta
npm run seed              # pobla categorías, productos y un usuario demo
npm run dev               # arranca en http://localhost:9090 (nodemon)
```

Usuario demo creado por el seed: **demo@naturapp.com** / **123456**.

### 2. Frontend

```bash
# desde la raíz del repositorio
npm install
npm run web               # o: npx expo start  (Android/iOS/Expo Go)
```

La URL del backend se configura en `src/services/apiService.js` (`BASE_URL`):

- **Web / emulador en la misma PC**: `http://localhost:9090/api`
- **Emulador Android (AVD)**: `http://10.0.2.2:9090/api`
- **Dispositivo físico (Expo Go)**: `http://<IP-LAN-de-tu-PC>:9090/api`

> El backend ya incluye `cors()` abierto, por lo que el frontend web puede consumirlo sin configuración adicional. El carrito y los pedidos requieren haber iniciado sesión (usa el usuario demo o regístrate).

## Conceptos Implementados (Sesión 11)

| Concepto | Implementación |
|---|---|
| Arquitectura Modular | `backend/{models,routes,middleware}` · `src/{services,hooks,components}` |
| Backend con Endpoints RESTful | Express con 5 grupos de rutas y CRUD completo |
| Arquitectura Cliente-Servidor | React Native (cliente) ↔ Express + MongoDB (servidor) |
| Librerías de Red (fetch) | `request()` genérico en `apiService.js` con headers y JWT |
| Procesamiento Backend | Validación de stock, hash de contraseñas, Mongoose |
| Respuesta JSON estructurada | `{ success, data/message }` + códigos HTTP |
| Actualización de UI | `useState`/`useEffect` + re-render en hooks |
| Flujo de Datos (5 fases) | Toque → HTTP → Servidor → JSON → UI |
| Performance | Spinners, `Promise.all`, paginación (`onEndReached`), pull-to-refresh |

## Tecnologías

**Backend:** Express · Mongoose (MongoDB) · jsonwebtoken (JWT) · bcryptjs · cors
**Frontend:** React Native · Expo SDK 51 · Expo Router · @react-native-async-storage/async-storage (token de sesión) · @expo/vector-icons

Ver el detalle completo en [`docs/informe-s11.md`](docs/informe-s11.md).

---

UNMSM — Facultad de Ingeniería de Sistemas e Informática — Escuela Profesional de Ingeniería de Software
