import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// PERSISTENCIA LOCAL ESTRUCTURADA - AsyncStorage
// Reemplaza a expo-sqlite manteniendo la MISMA interfaz de
// DatabaseService, para no alterar ViewModels ni pantallas.
// Los datos (carrito, favoritos) se guardan como listas JSON
// bajo una clave cada una y persisten offline en el dispositivo.
// ============================================

const CART_KEY = '@naturapp_cart';
const FAVORITES_KEY = '@naturapp_favorites';

// Lee una lista JSON de forma segura; ante error devuelve []
async function readList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(`Error leyendo ${key}:`, error);
    return [];
  }
}

// Guarda una lista serializándola a JSON
async function writeList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

const DatabaseService = {
  // --- INICIALIZAR almacenamiento ---
  // AsyncStorage no requiere esquema; se asegura que las claves
  // existan. Se conserva el método por compatibilidad de interfaz.
  async init() {
    const cart = await AsyncStorage.getItem(CART_KEY);
    if (cart === null) await writeList(CART_KEY, []);
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    if (favorites === null) await writeList(FAVORITES_KEY, []);
  },

  // === OPERACIONES CRUD DEL CARRITO ===

  // CREATE: Agregar producto al carrito (o incrementar cantidad)
  async addToCart(product) {
    const cart = await readList(CART_KEY);
    const existing = cart.find(item => item.product_id === String(product.id));
    if (existing) {
      existing.quantity += 1;
      existing.id = Date.now(); // lo mueve al inicio (más reciente)
    } else {
      cart.push({
        id: Date.now(),
        product_id: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
    await writeList(CART_KEY, cart);
    return existing ? existing.id : cart[cart.length - 1].id;
  },

  // READ: Obtener todos los items del carrito (más recientes primero)
  async getCartItems() {
    const cart = await readList(CART_KEY);
    return cart.sort((a, b) => b.id - a.id);
  },

  // UPDATE: Cambiar cantidad de un item
  async updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    const cart = await readList(CART_KEY);
    const item = cart.find(i => i.product_id === String(productId));
    if (item) {
      item.quantity = quantity;
      await writeList(CART_KEY, cart);
    }
  },

  // DELETE: Eliminar un item del carrito
  async removeFromCart(productId) {
    const cart = await readList(CART_KEY);
    await writeList(
      CART_KEY,
      cart.filter(i => i.product_id !== String(productId))
    );
  },

  // READ: Obtener total del carrito
  async getCartTotal() {
    const cart = await readList(CART_KEY);
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  // DELETE: Vaciar el carrito completo
  async clearCart() {
    await writeList(CART_KEY, []);
  },

  // READ: Contar items en el carrito
  async getCartCount() {
    const cart = await readList(CART_KEY);
    return cart.reduce((sum, i) => sum + i.quantity, 0);
  },

  // === OPERACIONES CRUD DE FAVORITOS ===

  async addFavorite(product) {
    const favorites = await readList(FAVORITES_KEY);
    if (!favorites.some(f => f.product_id === String(product.id))) {
      favorites.push({
        id: Date.now(),
        product_id: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        added_date: new Date().toISOString(),
      });
      await writeList(FAVORITES_KEY, favorites);
    }
  },

  async removeFavorite(productId) {
    const favorites = await readList(FAVORITES_KEY);
    await writeList(
      FAVORITES_KEY,
      favorites.filter(f => f.product_id !== String(productId))
    );
  },

  async isFavorite(productId) {
    const favorites = await readList(FAVORITES_KEY);
    return favorites.some(f => f.product_id === String(productId));
  },

  async getFavorites() {
    const favorites = await readList(FAVORITES_KEY);
    // Ordena por fecha de agregado, más recientes primero
    return favorites.sort((a, b) =>
      a.added_date < b.added_date ? 1 : -1
    );
  },
};

export default DatabaseService;
