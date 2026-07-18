# NaturApp — Informe Técnico (Sesión 11)

**Universidad Nacional Mayor de San Marcos**

Taller de Construcción de Software Móvil — *Del Módulo a la App: Implementación completa con Express.js (Backend) + React Native con Expo Router (Frontend)*

---

## 1. Introducción y Objetivos

Este informe documenta la evolución de NaturApp de una app autónoma a una aplicación **full-stack** real, aplicando los conceptos de la Sesión 11: *Implementación de Software Móvil — Del Módulo a la App*.

La Sesión 11 se apoya en tres pilares: (1) **arquitectura modular**, que divide la app en módulos independientes y cohesivos; (2) **backend con endpoints RESTful**, que gestiona datos, lógica y seguridad; y (3) **conexión frontend–servidor**, que transforma una interfaz estática en una app dinámica que consume endpoints.

> **Nota de implementación:** El backend vive en `backend/` (Express + MongoDB) y el frontend en la raíz (Expo Router). El frontend consume la API mediante `fetch`. A diferencia de la Sesión 10 (modo demo con datos locales), ahora los datos provienen de un **servidor real**; por eso se requiere levantar MongoDB y el backend. Ver [sección 4](#4-backend--configuración-y-servidor-principal) y el `README.md`.

---

## 2. Conceptos Aplicados

| Concepto (Sesión 11) | Implementación en NaturApp | Archivos clave |
|---|---|---|
| Arquitectura Modular | Carpetas por responsabilidad en backend y frontend | Todo el proyecto |
| Modularidad | Cada módulo con responsabilidad única | `routes/*.js`, `hooks/*.js` |
| Reutilización | `ProductCard`, `apiService`, middleware `auth` | `ProductCard.js`, `apiService.js`, `auth.js` |
| Backend con Endpoints | Express con rutas RESTful | `server.js`, `routes/*.js` |
| RESTful APIs (CRUD) | GET/POST/PUT/DELETE por módulo | `productRoutes.js`, `orderRoutes.js` |
| Arquitectura Cliente-Servidor | App móvil ↔ Express ↔ MongoDB | `apiService.js`, `server.js` |
| Librerías de Red (fetch) | `request()` genérico | `apiService.js` |
| Procesamiento Backend | Validación de stock, hash de passwords, Mongoose | `orderRoutes.js`, `models/User.js` |
| Respuesta JSON | `{ success, data/message }` + códigos HTTP | Todas las rutas |
| Actualización de UI | `useState`/`useEffect` + re-render | `useProducts`, `useCart`, `useOrders` |
| Flujo de Datos en Tiempo Real | Toque → HTTP → Servidor → JSON → UI | `home.js`, `product/[id].js` |
| Performance | Spinners, `Promise.all`, paginación, pull-to-refresh | `home.js`, `useProducts.js` |

---

## 3. Arquitectura del Proyecto

NaturApp sigue una arquitectura modular de dos capas: **backend** Node.js/Express y **frontend** React Native con Expo Router. Cada capa se organiza en módulos con responsabilidades bien definidas.

```
naturapp/
├── backend/                    # CAPA SERVIDOR (Express + MongoDB)
│   ├── server.js               # Punto de entrada, middleware global, registro de rutas
│   ├── seed.js                 # Datos iniciales
│   ├── models/                 # Esquemas Mongoose (Product, Category, User, Order)
│   ├── routes/                 # Endpoints RESTful (products, categories, users, orders, cart)
│   └── middleware/auth.js      # JWT: authenticate / authorize / generateToken
│
├── app/                        # CAPA PRESENTACIÓN (Expo Router)
│   ├── _layout.js              # Stack raíz (detalle, modales auth, checkout)
│   ├── checkout.js
│   ├── auth/{login,register}.js
│   ├── product/[id].js         # Ruta dinámica
│   └── (tabs)/{home,search,cart,orders,profile}.js
├── src/
│   ├── services/apiService.js  # CAPA DE DATOS (consumo de API)
│   ├── hooks/                  # CAPA LÓGICA (useProducts, useCart, useAuth, useOrders)
│   └── components/             # ProductCard, CartItemRow, CategoryChips
```

**Regla de dependencia (frontend):** Pantalla → Hook → `apiService` → Backend. La vista nunca llama a `fetch` directamente (salvo consultas puntuales como el detalle o la búsqueda, que usan `ProductAPI` del servicio).

---

## 4. Backend — Configuración y Servidor Principal

`backend/package.json` define las dependencias (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`) y los scripts `dev` (nodemon), `start` y `seed`.

`server.js` es el corazón del backend: configura middleware global (`cors`, `express.json`), conecta a MongoDB, registra cada módulo de rutas bajo `/api/*`, expone un *health check* y centraliza el manejo de errores.

```js
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/naturapp');
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
```

> **Concepto aplicado — Backend con Endpoints + Arquitectura Modular:** cada módulo de rutas se importa como componente independiente y se registra como un grupo de endpoints RESTful. El middleware global y el manejo de errores centralizado demuestran separación de responsabilidades.

---

## 5. Backend — Modelos de Datos (Mongoose)

Cada modelo es un módulo que encapsula estructura, validación e índices.

- **`Product`** — `name`, `description`, `price` (min 0), `category` (ref a `Category`), `stock`, `isActive`, `tags`, `nutritionalInfo`. Índice de texto para búsqueda.
- **`Category`** — `name` (único), `icon`, `isActive` (borrado lógico).
- **`User`** — `email` único, `password` con **hash bcrypt** en el hook `pre('save')` y método `comparePassword`. Rol `customer`/`admin`.
- **`Order`** — subdocumento `orderItemSchema` para los items, `total`, `status` (enum), `shippingAddress`, `paymentMethod`.

> **Concepto aplicado — Procesamiento Backend + Seguridad:** Mongoose valida antes de guardar; `User` cifra la contraseña con bcrypt; `Order` compone esquemas y garantiza integridad con `enum`.

---

## 6. Backend — Middleware de Autenticación

`middleware/auth.js` es un módulo transversal reutilizable:

- **`authenticate`** — verifica el token JWT del header `Authorization: Bearer <token>` y adjunta `req.userId` / `req.userRole`.
- **`authorize(...roles)`** — restringe rutas por rol (p. ej. `admin`).
- **`generateToken(userId, role)`** — firma un JWT con expiración de 7 días.

> **Concepto aplicado — Reutilización + Seguridad del Backend:** la seguridad se centraliza en un solo módulo importable desde cualquier archivo de rutas.

---

## 7. Backend — Rutas RESTful (Endpoints)

Cada archivo de rutas implementa CRUD con métodos HTTP estándar y responde en formato `{ success, data/message }`.

- **`productRoutes.js`** — `GET /` (con filtros `category`/`search` y **paginación** `page`/`limit`), `GET /:id`, `POST` / `PUT` / `DELETE` (admin; el DELETE es lógico vía `isActive: false`).
- **`categoryRoutes.js`** — listado público; escritura solo admin.
- **`userRoutes.js`** — `POST /register`, `POST /login` (devuelven token JWT), `GET`/`PUT /profile` (protegidos).
- **`orderRoutes.js`** — `POST /` valida stock, calcula total y **descuenta inventario**; `GET /`, `GET /:id`, `PUT /:id/cancel` (restaura stock).
- **`cartRoutes.js`** — carrito en memoria por sesión: `GET /`, `POST /add`, `PUT /:productId`, `DELETE /:productId`, `DELETE /`.

> **Concepto aplicado — RESTful APIs + Procesamiento Backend:** los endpoints públicos no requieren token; los de escritura exigen rol o sesión. `POST /orders` ilustra la cadena completa de procesamiento del servidor (validación → cálculo → persistencia).

---

## 8. Frontend — Servicio de API (Consumo de Endpoints)

`src/services/apiService.js` centraliza **toda** la comunicación con el backend. La función `request()` construye la URL, agrega headers (`Content-Type`, `Authorization: Bearer`), serializa el body a JSON y deserializa la respuesta, con manejo de errores de red.

Exporta sub-módulos que corresponden a los endpoints: `ProductAPI`, `CategoryAPI`, `AuthAPI`, `CartAPI`, `OrderAPI`, más `setToken` / `clearToken` para la sesión.

```js
const BASE_URL = 'http://localhost:9090/api'; // ajustar según plataforma
export const ProductAPI = {
  getAll: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  getById: (id) => request(`/products/${id}`),
  search: (term) => request(`/products?search=${encodeURIComponent(term)}`),
};
```

> **Concepto aplicado — Consumo de Endpoints + Librerías de Red + Cliente-Servidor:** un único módulo estandariza el protocolo cliente↔servidor. Si cambia la URL del servidor, solo se edita `BASE_URL`.

---

## 9. Frontend — Custom Hooks (Lógica de Negocio)

Los hooks encapsulan estado (loading/error/data) y coordinan el servicio de API:

- **`useProducts`** — carga inicial de productos y categorías con **`Promise.all`** (paralelo), filtro por categoría, búsqueda, **paginación** (`loadMore`) y **pull-to-refresh** (`refresh`).
- **`useCart`** — CRUD del carrito contra `CartAPI`; recarga (`loadCart`) tras cada operación para sincronizar con el servidor.
- **`useAuth`** — ciclo de autenticación: `login`/`register` persisten el token JWT en **AsyncStorage** y lo inyectan en `apiService`; `restoreSession` valida el token guardado con `GET /profile`; `logout` limpia sesión.
- **`useOrders`** — crear, listar y cancelar pedidos.

> **Concepto aplicado — Actualización de UI + Performance:** `Promise.all` reduce el tiempo de carga inicial; los hooks gestionan estados de carga/error y disparan el re-render automático de React Native.

---

## 10. Frontend — Navegación con Expo Router

Navegación basada en archivos. `app/_layout.js` define el **Stack** raíz (detalle de producto, `auth/login` y `auth/register` como modales, y `checkout`). `app/(tabs)/_layout.js` define el **Tab Navigator** de 5 pestañas: Inicio, Buscar, Carrito, Pedidos, Perfil.

> **Concepto aplicado — Arquitectura Modular en Navegación:** cada pantalla es un módulo independiente; los layouts componen la navegación como módulos (stack global + tabs).

---

## 11. Frontend — Pantallas y Componentes

**Pantallas** (`app/`): `home` (catálogo con `CategoryChips`, paginación infinita, spinner y pull-to-refresh), `search` (búsqueda dinámica `GET /products?search=`), `product/[id]` (detalle con `useLocalSearchParams`, info nutricional y control de stock), `cart` (CRUD + resumen), `checkout` (formulario de dirección → `POST /orders` → `DELETE /cart`), `orders` (historial con `STATUS_MAP` y cancelación), `profile` (sesión con `useAuth`), y `auth/login` · `auth/register`.

**Componentes reutilizables** (`src/components/`): `ProductCard` (usado en `home` y `search`), `CartItemRow` (fila con control de cantidad), `CategoryChips` (filtro horizontal controlado `selected`/`onSelect`).

> **Concepto aplicado — Flujo de Datos en Tiempo Real + Reutilización:** las pantallas obtienen datos vía hooks y reutilizan componentes; el detalle y la búsqueda ilustran solicitudes HTTP puntuales y dinámicas.

---

## 12. Flujo de Datos Completo

Ejemplo: **agregar un producto al carrito** (las 5 fases de la Sesión 11):

1. **Inicio (0–50ms):** el usuario toca "+" en `ProductCard`; `onPress` dispara `addItem(product)` de `useCart`, que llama `CartAPI.addItem()`.
2. **Red (50–200ms):** `request()` arma `POST /api/cart/add` con body JSON y header `Authorization: Bearer`; `fetch` viaja al servidor.
3. **Servidor (200–500ms):** Express recibe en `cartRoutes.js`; `authenticate` valida el JWT; el handler agrega o incrementa el item y responde el carrito.
4. **Retorno (500–700ms):** llega `{ success, data }`; `apiService` verifica `response.ok` y deserializa.
5. **UI (700–1000ms):** `useCart` ejecuta `loadCart()` (setItems/setTotal/setCount); React Native re-renderiza el carrito.

> **Concepto aplicado — Performance:** spinners (`ActivityIndicator`), solicitudes en paralelo (`Promise.all`), paginación infinita (`onEndReached`), pull-to-refresh (`RefreshControl`) y estados de error con mensajes del servidor.

---

## 13. Puesta en Marcha (resumen)

```bash
# Backend
cd backend && npm install
cp .env.example .env
npm run seed        # categorías, productos y usuario demo (demo@naturapp.com / 123456)
npm run dev         # http://localhost:9090

# Frontend (raíz)
npm install
npm run web         # o npx expo start
```

`BASE_URL` en `src/services/apiService.js`: `localhost` (web/emulador en la PC), `10.0.2.2` (emulador Android) o la **IP LAN** de la PC (dispositivo físico con Expo Go). El backend incluye `cors()` abierto. El carrito y los pedidos requieren sesión iniciada. Detalle completo en el `README.md`.

---

## 14. Resumen de Conceptos Aplicados

| Concepto | Implementación | Aplicado |
|---|---|---|
| Arquitectura Modular | Carpetas por responsabilidad (backend/frontend) | Sí |
| Backend con Endpoints | Express con 5 grupos de rutas | Sí |
| RESTful APIs (CRUD) | GET/POST/PUT/DELETE por módulo | Sí |
| Arquitectura Cliente-Servidor | React Native + Express + MongoDB | Sí |
| Librerías de Red (fetch) | `request()` en `apiService.js` | Sí |
| Solicitud HTTP configurada | Headers, `Authorization`, body JSON | Sí |
| Procesamiento Backend | Validación, lógica de negocio, Mongoose | Sí |
| Respuesta JSON estructurada | `{ success, data/message }` + códigos HTTP | Sí |
| Autenticación JWT | `auth.js` + `useAuth` + AsyncStorage | Sí |
| Actualización de UI | `useState`/`useEffect` + re-render | Sí |
| Flujo de Datos (5 fases) | Toque → HTTP → Servidor → JSON → UI | Sí |
| Performance | Spinners, `Promise.all`, paginación, pull-to-refresh | Sí |
| Ciclo Completo | Los 3 pilares integrados en la app funcional | Sí |

NaturApp Sesión 11 integra los tres pilares —arquitectura modular, backend RESTful y consumo desde la app móvil— en una aplicación full-stack funcional, con separación de responsabilidades y consideraciones de performance de extremo a extremo.
