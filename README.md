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
  ┌───────────────────────┐
  │  AsyncStorage │ SQLite │ API REST  │
  └───────────────────────┘
```

## Estructura del Proyecto

```
naturapp/
├── app/                        # Navegación con Expo Router
│   ├── _layout.js              # Root layout — inicializa SQLite
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
│   │   ├── databaseService.js  # SQLite (carrito, favoritos)
│   │   └── apiService.js       # API REST (productos, pedidos)
│   ├── viewmodels/             # Capa Lógica (Custom Hooks)
│   │   ├── useProducts.js
│   │   ├── useCart.js
│   │   ├── useOrders.js
│   │   └── useProfile.js
│   └── components/             # Componentes reutilizables
│       ├── ProductCard.js
│       ├── CartItemRow.js
│       └── CategoryChip.js
├── docs/                       # Informes técnicos (PDF)
├── app.json
└── package.json
```

## Conceptos Implementados (Sesión 10)

| Concepto | Implementación |
|---|---|
| Arquitectura en Capas | `models/` → `services/` → `viewmodels/` → `app/` |
| Patrón MVVM | Models = clases, View = screens, ViewModel = hooks |
| Persistencia Básica | `AsyncStorage` en `storageService.js` |
| Persistencia Local | `expo-sqlite` en `databaseService.js` |
| Persistencia Remota | `fetch` + `async/await` en `apiService.js` |
| CRUD completo | Carrito (INSERT/SELECT/UPDATE/DELETE) y Pedidos |
| Asincronía | `async/await` en todos los services y viewmodels |
| Integración entre Capas | UI → ViewModel → Validación → Service → Estado UI |

## Funcionalidades

- **Catálogo**: explorar productos por categoría y búsqueda
- **Carrito**: agregar, modificar cantidad y eliminar productos (persistido en SQLite)
- **Favoritos**: marcar/desmarcar productos favoritos (SQLite)
- **Pedidos**: realizar checkout y consultar historial (API REST)
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
```

## Configuración del Backend

La URL base de la API está en `src/services/apiService.js`:

```js
const BASE_URL = 'http://192.168.1.100:9090/api';
```

Actualiza la IP con la dirección local de tu servidor Express. El backend debe exponer los endpoints:

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
- **expo-sqlite** — base de datos local
- **@react-native-async-storage/async-storage** — preferencias
- **@expo/vector-icons** — iconografía (Ionicons)

---

UNMSM — Facultad de Ingeniería de Sistemas e Informática — Escuela Profesional de Ingeniería de Software