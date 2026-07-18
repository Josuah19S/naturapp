# NaturApp

Aplicación móvil de comercio electrónico de productos naturales, inspirada en Santa Natura. Desarrollada con React Native y Expo como proyecto académico para el curso **Taller de Construcción de Software Móvil** — UNMSM, Ingeniería de Software.

## Arquitectura

El proyecto implementa **Arquitectura en Capas** combinada con el patrón **MVVM** adaptado a React Native mediante Custom Hooks:

```
Presentación (app/, components/)
      ↓
Lógica de Negocio (viewmodels/)
      ↓
Capa de Datos (services/)
      ↓
  ┌──────────────────────────────────────┐
  │  AsyncStorage (preferencias + local)  │  API REST  │
  └──────────────────────────────────────┘
```

> **Nota:** La persistencia local (carrito y favoritos) se implementa sobre **AsyncStorage** en lugar de SQLite, por compatibilidad multiplataforma (Android, iOS y web) y para no requerir configuración nativa. `databaseService.js` conserva la misma interfaz CRUD, por lo que los ViewModels y las pantallas no cambian.

## Estructura del Proyecto

```
naturapp/
├── app/                        # Navegación con Expo Router
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
│   ├── models/                 # Capa Modelo (MVVM)
│   │   ├── Product.js
│   │   ├── CartItem.js
│   │   └── Order.js
│   ├── services/               # Capa de Datos
│   │   ├── storageService.js   # AsyncStorage (preferencias)
│   │   ├── databaseService.js  # AsyncStorage (carrito, favoritos)
│   │   ├── apiService.js       # API REST / modo demo (productos, pedidos)
│   │   └── mockData.js         # Catálogo de ejemplo (modo demo)
│   ├── viewmodels/             # Capa Lógica (Custom Hooks)
│   │   ├── useProducts.js
│   │   ├── useCart.js
│   │   ├── useOrders.js
│   │   └── useProfile.js
│   └── components/             # Componentes reutilizables
│       ├── ProductCard.js
│       ├── CartItemRow.js
│       └── CategoryChip.js
├── docs/                       # Informes técnicos (informe-s10.md)
├── app.json
└── package.json
```

## Conceptos Implementados (Sesión 10)

| Concepto | Implementación |
|---|---|
| Arquitectura en Capas | `models/` → `services/` → `viewmodels/` → `app/` |
| Patrón MVVM | Models = clases, View = screens, ViewModel = hooks |
| Persistencia Básica | `AsyncStorage` (clave-valor) en `storageService.js` |
| Persistencia Local | `AsyncStorage` (listas JSON con CRUD) en `databaseService.js` |
| Persistencia Remota | `fetch` + `async/await` en `apiService.js` (con modo demo sin backend) |
| CRUD completo | Carrito y Pedidos (crear, leer, actualizar, eliminar) |
| Asincronía | `async/await` en todos los services y viewmodels |
| Integración entre Capas | UI → ViewModel → Validación → Service → Estado UI |

## Funcionalidades

- **Catálogo**: explorar productos por categoría y búsqueda
- **Carrito**: agregar, modificar cantidad y eliminar productos (persistido en AsyncStorage)
- **Favoritos**: marcar/desmarcar productos favoritos (AsyncStorage)
- **Pedidos**: realizar checkout y consultar historial (API REST o modo demo)
- **Perfil**: editar nombre, email y preferencias (AsyncStorage)
- **Detalle de producto**: vista completa con beneficios y control de favoritos

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar con Expo Go
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios

# Web (navegador)
npm run web
```

> La app arranca en **modo demo** (datos de ejemplo locales), así que funciona en Android, iOS y web sin necesidad de backend. Ver [Modo Demo](#modo-demo-sin-backend).

## Modo Demo (sin backend)

Por defecto la app funciona **de forma autónoma** con datos de ejemplo locales (`src/services/mockData.js`), sin necesidad de servidor. Así el catálogo, la búsqueda, el checkout y el historial de pedidos funcionan en cualquier plataforma, **incluida la web**. Los pedidos creados se guardan en AsyncStorage.

Esto se controla con un flag en `src/services/apiService.js`:

```js
const USE_MOCK = true;  // datos de ejemplo locales (demo)
// const USE_MOCK = false;  // usar backend Express real
```

## Configuración del Backend (opcional)

Para conectar un backend Express real, pon `USE_MOCK = false` y actualiza la URL base en `src/services/apiService.js`:

```js
const BASE_URL = 'http://192.168.1.100:9090/api';
```

Actualiza la IP con la dirección de tu servidor Express. **Para que funcione en web, el servidor debe habilitar CORS** (p. ej. el middleware `cors` en Express). El backend debe exponer los endpoints:

- `GET /api/products` — listar productos (con `?category=` opcional)
- `GET /api/products/:id` — detalle de producto
- `GET /api/products/search?q=` — búsqueda
- `GET /api/orders` — historial de pedidos
- `POST /api/orders` — crear pedido
- `POST /api/auth/login` — autenticación
- `GET /api/categories` — listar categorías

## Tecnologías

- **React Native** + **Expo SDK 51**
- **Expo Router** — navegación file-based
- **@react-native-async-storage/async-storage** — persistencia local (preferencias, carrito y favoritos)
- **@expo/vector-icons** — iconografía (Ionicons)

---

UNMSM — Facultad de Ingeniería de Sistemas e Informática — Escuela Profesional de Ingeniería de Software