import StorageService from './storageService';

const BASE_URL = 'http://192.168.1.100:9090/api';

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

const ApiService = {
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

export default ApiService;
