# NaturApp — Informe Técnico (Semana 10)

**Universidad Nacional Mayor de San Marcos**

Taller de Construcción de Software Móvil.

---

## 1. Introducción y Objetivos

NaturApp es una aplicación móvil de comercio electrónico de productos naturales, inspirada en Santa Natura. Permite explorar un catálogo, gestionar un carrito de compras, marcar favoritos, realizar pedidos y administrar preferencias del usuario.

El objetivo es demostrar la aplicación práctica de los conceptos de la Sesión 10 — *Diseño de Software Móvil II* — usando React Native y Expo: **Arquitectura en Capas**, **patrón MVVM** (adaptado con Custom Hooks), y los tres niveles de **persistencia** (básica, local y remota) con **asincronía** (`async/await`).

> **Nota de implementación:** La persistencia local (carrito y favoritos) se implementa sobre **AsyncStorage** en lugar de SQLite. La decisión se toma por compatibilidad multiplataforma (Android, iOS y web) y para evitar configuración nativa, sin sacrificar el funcionamiento offline ni las operaciones CRUD. Ver [sección 6](#6-capa-de-datos--persistencia-local-asyncstorage).

---

## 2. Conceptos Aplicados

| Concepto de la presentación | Implementación en NaturApp | Archivos clave |
|---|---|---|
| Arquitectura en Capas | Carpetas `models/`, `services/`, `viewmodels/`, `app/` | Toda la estructura |
| Patrón MVVM | Models = clases, View = pantallas, ViewModel = Custom Hooks | `models/`, `viewmodels/`, `app/` |
| Persistencia Básica | AsyncStorage para preferencias y sesión | `services/storageService.js` |
| Persistencia Local | AsyncStorage (listas JSON con CRUD) para carrito y favoritos | `services/databaseService.js` |
| Persistencia Remota | `fetch()` asíncrono al backend REST, con modo demo de datos locales | `services/apiService.js`, `services/mockData.js` |
| Operaciones CRUD | Crear, leer, actualizar y eliminar carrito, favoritos y pedidos | `databaseService.js`, `apiService.js` |
| Asincronía | `async/await` en toda operación de E/S | Todos los services y viewmodels |
| Integración entre Capas | Evento UI → ViewModel → Validación → Service → Estado UI | `viewmodels/` → `services/` |

---

## 3. Arquitectura del Proyecto

NaturApp combina **Arquitectura en Capas** con **MVVM** adaptado a React Native mediante Custom Hooks.

```
naturapp/
├── app/                        # CAPA PRESENTACIÓN (Expo Router)
│   ├── _layout.js              # Root layout — inicializa almacenamiento local
│   ├── index.js                # Redirección a /home
│   ├── (tabs)/
│   │   ├── _layout.js          # Tab Navigator (4 tabs)
│   │   ├── home.js             # Catálogo de productos
│   │   ├── cart.js             # Carrito de compras
│   │   ├── orders.js           # Historial de pedidos
│   │   └── profile.js          # Perfil y preferencias
│   └── product/[id].js         # Detalle de producto
├── src/
│   ├── models/                 # CAPA MODELO
│   │   ├── Product.js
│   │   ├── CartItem.js
│   │   └── Order.js
│   ├── services/               # CAPA DE DATOS
│   │   ├── storageService.js   # Persistencia básica  (AsyncStorage)
│   │   ├── databaseService.js  # Persistencia local   (AsyncStorage)
│   │   ├── apiService.js       # Persistencia remota  (API REST / mock)
│   │   └── mockData.js         # Catálogo de ejemplo (modo demo)
│   ├── viewmodels/             # CAPA LÓGICA (ViewModels / Custom Hooks)
│   │   ├── useProducts.js
│   │   ├── useCart.js
│   │   ├── useOrders.js
│   │   └── useProfile.js
│   └── components/             # Componentes reutilizables
│       ├── ProductCard.js
│       ├── CartItemRow.js
│       └── CategoryChip.js
└── docs/                       # Informes técnicos
```

**Regla de dependencia:** cada capa se comunica solo con la adyacente. La Vista nunca accede directamente a los servicios de datos; siempre pasa por un ViewModel.

---

## 4. Capa de Modelo

Los modelos encapsulan las entidades del dominio y su lógica propia.

- **`Product`** — catálogo; métodos `isAvailable()`, `getFormattedPrice()`, `fromJSON()`.
- **`CartItem`** — item del carrito; métodos `getSubtotal()`, `fromRow()` (crea la instancia a partir de un registro almacenado).
- **`Order`** — pedido; métodos `getFormattedDate()`, `getStatusColor()`, `fromJSON()`.

`CartItem.fromRow()` traduce el registro persistido (`product_id`, `name`, `price`, …) a la instancia del modelo. Como `databaseService.js` conserva ese mismo formato de registro, el modelo **no cambió** al migrar de SQLite a AsyncStorage.

---

## 5. Capa de Datos — Persistencia Básica (AsyncStorage)

`storageService.js` guarda pares clave-valor para datos pequeños: nombre y email del usuario, token de sesión, tema oscuro, notificaciones y última categoría visitada. Es el equivalente de `SharedPreferences` (Android) / `UserDefaults` (iOS).

Operaciones: `saveUserProfile`, `getUserProfile`, `setDarkTheme`/`isDarkTheme`, `setNotifications`/`getNotifications`, `saveToken`/`getToken`, `logout`, `saveLastCategory`/`getLastCategory`.

---

## 6. Capa de Datos — Persistencia Local (AsyncStorage)

`databaseService.js` gestiona el **carrito** y los **favoritos**: datos estructurados que requieren CRUD y deben persistir **offline**.

### 6.1 Motivo del cambio SQLite → AsyncStorage

La implementación original usaba `expo-sqlite`, que presentaba problemas de compatibilidad (no funciona en web dentro de SDK 51 y requiere plugin de configuración nativa). Dado que el carrito y los favoritos son **conjuntos pequeños de datos**, no se necesita un motor relacional: se sustituye por **AsyncStorage**, guardando cada colección como una **lista JSON** bajo una clave.

**Ventaja clave:** `databaseService.js` mantiene **exactamente la misma interfaz pública** (`init`, `addToCart`, `getCartItems`, `updateCartQuantity`, `removeFromCart`, `getCartTotal`, `clearCart`, `getCartCount`, `addFavorite`, `removeFavorite`, `isFavorite`, `getFavorites`). Por eso **ningún ViewModel ni pantalla requirió modificación**.

### 6.2 Modelo de almacenamiento

| Clave | Contenido |
|---|---|
| `@naturapp_cart` | Lista JSON de items del carrito |
| `@naturapp_favorites` | Lista JSON de productos favoritos |

Cada registro conserva los campos del esquema anterior (`id`, `product_id`, `name`, `price`, `image`, `quantity` / `added_date`), de modo que `CartItem.fromRow()` sigue siendo compatible.

### 6.3 Mapeo de operaciones SQL → AsyncStorage

| Operación CRUD | SQLite (antes) | AsyncStorage (ahora) |
|---|---|---|
| Agregar al carrito | `INSERT OR REPLACE` + `COALESCE` | `find` + incremento de `quantity` o `push` |
| Leer carrito | `SELECT * ... ORDER BY id DESC` | `readList` + `sort` por `id` desc |
| Actualizar cantidad | `UPDATE ... WHERE product_id` | `find` + reasignación |
| Eliminar item | `DELETE ... WHERE product_id` | `filter` |
| Total del carrito | `SELECT SUM(price*quantity)` | `reduce` |
| Contar items | `SELECT SUM(quantity)` | `reduce` |
| Vaciar carrito | `DELETE FROM cart` | escribir lista vacía |
| Favoritos | `INSERT OR IGNORE` / `DELETE` / `SELECT` | `some` / `filter` / `push` |

Las comparaciones de `product_id` se normalizan con `String()` para replicar la afinidad de tipos que hacía SQLite (evita que `'5' !== 5`).

---

## 7. Capa de Datos — Persistencia Remota (API REST / modo demo)

`apiService.js` expone una interfaz única (`getProducts`, `getProductById`, `searchProducts`, `createOrder`, `getOrders`, `getOrderById`, `login`, `getCategories`) con **dos implementaciones intercambiables** mediante el flag `USE_MOCK`:

- **`RealApi`** — conecta con un backend Express mediante `fetch()` y `async/await`. Incluye un helper `request()` con manejo de errores y cabecera `Authorization` con el token de `storageService`.
- **`MockApi`** — devuelve datos de ejemplo locales (`mockData.js`) simulando latencia de red con `async/await`. Permite ejecutar la app **de forma autónoma, sin backend**, en Android, iOS y **web**.

```js
const USE_MOCK = true;   // datos de ejemplo locales (demo)
// const USE_MOCK = false;  // backend Express real
const ApiService = USE_MOCK ? MockApi : RealApi;
```

### 7.1 Motivo del modo demo

Sin un servidor Express en ejecución, las pantallas de **Inicio** (catálogo) y **Pedidos** (historial) no podían cargar datos —problema que se hace evidente en web, donde además aplican restricciones de **CORS** y *mixed content* que no existen en móvil nativo. El modo mock resuelve esto: el catálogo, la búsqueda, el checkout y el historial funcionan sin dependencias externas.

### 7.2 Pedidos en modo demo

En `MockApi`, `createOrder()` genera un pedido y lo guarda en **AsyncStorage** (clave `@naturapp_orders`); `getOrders()` y `getOrderById()` lo leen desde ahí. Así el flujo de compra queda completo y demostrable: al hacer checkout, el pedido aparece en el historial.

Para volver al backend real basta con poner `USE_MOCK = false` y ajustar `BASE_URL` (el servidor debe habilitar CORS para funcionar en web).

---

## 8. Capa de Lógica (ViewModels)

Custom Hooks que encapsulan estado, validaciones y coordinación entre servicios:

- **`useProducts`** — carga y búsqueda del catálogo (API) + recuerda la última categoría (AsyncStorage).
- **`useCart`** — carrito sobre `databaseService` (local) + checkout hacia `apiService` (remoto). Valida stock, carrito vacío y dirección.
- **`useOrders`** — historial de pedidos (`apiService`: backend real o modo demo).
- **`useProfile`** — datos y preferencias del usuario (AsyncStorage).

La Vista consume **solo** estos hooks, nunca los servicios directamente.

---

## 9. Capa de Presentación

Pantallas (`app/(tabs)/*.js`, `app/product/[id].js`) y componentes reutilizables (`ProductCard`, `CartItemRow`, `CategoryChip`). Cada pantalla obtiene datos y ejecuta acciones a través de un ViewModel, sin conocer los detalles de persistencia.

---

## 10. Integración entre Capas — Flujo del carrito

1. El usuario toca **"Agregar al carrito"** en `HomeScreen` / `ProductDetailScreen`.
2. La pantalla llama a `addItem(product)` de `useCart`.
3. `useCart` **valida** el stock (`product.isAvailable()`).
4. `DatabaseService.addToCart()` guarda en **AsyncStorage**.
5. Se relee el carrito y se recalculan total y conteo.
6. El estado se actualiza y la UI se re-renderiza automáticamente.

La Vista nunca accede directamente al almacenamiento.

---

## 11. Resumen

| Concepto | Archivo(s) | Mecanismo |
|---|---|---|
| Arquitectura en Capas | Toda la estructura | `models/` → `services/` → `viewmodels/` → `app/` |
| MVVM — Model | `models/*.js` | Clases con lógica de dominio |
| MVVM — View | `app/**/*.js`, `components/*.js` | Renderiza y delega a ViewModels |
| MVVM — ViewModel | `viewmodels/use*.js` | Custom Hooks con estado y lógica |
| Persistencia Básica | `storageService.js` | AsyncStorage (clave-valor) |
| Persistencia Local | `databaseService.js` | AsyncStorage (listas JSON con CRUD) |
| Persistencia Remota | `apiService.js`, `mockData.js` | `fetch()` + `async/await` (backend real o modo demo) |
| Asincronía | services y viewmodels | `async/await` en cada E/S |
| Validación | `useCart.js` | Stock, carrito vacío, dirección |
| Integración entre Capas | UI → ViewModel → Service | Flujo de 6 pasos |

NaturApp demuestra separación de responsabilidades y tres niveles de persistencia. La migración de SQLite a AsyncStorage para la capa local resuelve la incompatibilidad multiplataforma manteniendo intactas la arquitectura y la interfaz de datos. El modo demo (`USE_MOCK`) permite ejecutar la app **de forma autónoma en Android, iOS y web** —con `npm run web`— sin necesidad de un backend, conservando la misma interfaz de la capa remota para conectar un servidor Express real cuando se requiera.
