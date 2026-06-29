import * as SQLite from 'expo-sqlite';

let db = null;

const DatabaseService = {
  async init() {
    db = await SQLite.openDatabaseAsync('naturapp.db');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        quantity INTEGER DEFAULT 1
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        added_date TEXT DEFAULT (datetime('now'))
      );
    `);
  },

  async addToCart(product) {
    const result = await db.runAsync(
      `INSERT OR REPLACE INTO cart (product_id, name, price, image, quantity)
       VALUES (?, ?, ?, ?,
         COALESCE((SELECT quantity + 1 FROM cart WHERE product_id = ?), 1))`,
      [product.id, product.name, product.price, product.image, product.id]
    );
    return result.lastInsertRowId;
  },

  async getCartItems() {
    const rows = await db.getAllAsync('SELECT * FROM cart ORDER BY id DESC');
    return rows;
  },

  async updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    await db.runAsync(
      'UPDATE cart SET quantity = ? WHERE product_id = ?',
      [quantity, productId]
    );
  },

  async removeFromCart(productId) {
    await db.runAsync('DELETE FROM cart WHERE product_id = ?', [productId]);
  },

  async getCartTotal() {
    const result = await db.getFirstAsync(
      'SELECT SUM(price * quantity) as total FROM cart'
    );
    return result?.total || 0;
  },

  async clearCart() {
    await db.runAsync('DELETE FROM cart');
  },

  async getCartCount() {
    const result = await db.getFirstAsync(
      'SELECT SUM(quantity) as count FROM cart'
    );
    return result?.count || 0;
  },

  async addFavorite(product) {
    await db.runAsync(
      `INSERT OR IGNORE INTO favorites (product_id, name, price, image)
       VALUES (?, ?, ?, ?)`,
      [product.id, product.name, product.price, product.image]
    );
  },

  async removeFavorite(productId) {
    await db.runAsync(
      'DELETE FROM favorites WHERE product_id = ?',
      [productId]
    );
  },

  async isFavorite(productId) {
    const row = await db.getFirstAsync(
      'SELECT id FROM favorites WHERE product_id = ?',
      [productId]
    );
    return !!row;
  },

  async getFavorites() {
    return await db.getAllAsync(
      'SELECT * FROM favorites ORDER BY added_date DESC'
    );
  },
};

export default DatabaseService;
