import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './storageService';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mockData';

// ============================================
// PERSISTENCIA REMOTA - API REST
// ============================================
// USE_MOCK = true  → la app funciona SIN backend, con datos de ejemplo
//                    locales (demo autónoma, ideal para web).
// USE_MOCK = false → usa el backend Express real en BASE_URL.
// Cambia el flag cuando tengas el servidor corriendo.
const USE_MOCK = true;

const BASE_URL = 'http://192.168.1.100:9090/api';
const ORDERS_KEY = '@naturapp_orders';

// Simula la latencia de una petición de red
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

async function request(endpoint, options = {}) {
  try {
    const token = await StorageService.getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// IMPLEMENTACIÓN MOCK (sin backend)
// ============================================
async function readOrders() {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

const MockApi = {
  async getProducts(category = null) {
    await delay();
    if (!category) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(p => p.category === category);
  },

  async getProductById(id) {
    await delay();
    const product = MOCK_PRODUCTS.find(p => p.id === String(id));
    if (!product) throw new Error('Producto no encontrado');
    return product;
  },

  async searchProducts(query) {
    await delay();
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
  },

  async createOrder(orderData) {
    await delay();
    const orders = await readOrders();
    const order = {
      id: Date.now(),
      ...orderData,
      status: 'pendiente',
      date: new Date().toISOString(),
    };
    orders.unshift(order);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
  },

  async getOrders() {
    await delay();
    return readOrders();
  },

  async getOrderById(id) {
    await delay();
    const orders = await readOrders();
    const order = orders.find(o => String(o.id) === String(id));
    if (!order) throw new Error('Pedido no encontrado');
    return order;
  },

  async login(email) {
    await delay();
    return {
      token: 'mock-token',
      user: { name: 'Usuario Demo', email },
    };
  },

  async getCategories() {
    await delay();
    return MOCK_CATEGORIES;
  },
};

// ============================================
// IMPLEMENTACIÓN REAL (backend Express)
// ============================================
const RealApi = {
  async getProducts(category = null) {
    const query = category ? `?category=${category}` : '';
    return await request(`/products${query}`);
  },

  async getProductById(id) {
    return await request(`/products/${id}`);
  },

  async searchProducts(query) {
    return await request(`/products/search?q=${encodeURIComponent(query)}`);
  },

  async createOrder(orderData) {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders() {
    return await request('/orders');
  },

  async getOrderById(id) {
    return await request(`/orders/${id}`);
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      await StorageService.saveToken(data.token);
      await StorageService.saveUserProfile(data.user.name, data.user.email);
    }
    return data;
  },

  async getCategories() {
    return await request('/categories');
  },
};

const ApiService = USE_MOCK ? MockApi : RealApi;

export default ApiService;
