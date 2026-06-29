import { useState, useEffect, useCallback } from 'react';
import DatabaseService from '../services/databaseService';
import ApiService from '../services/apiService';
import { CartItem } from '../models/CartItem';

export function useCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await DatabaseService.getCartItems();
      setItems(rows.map(r => CartItem.fromRow(r)));
      const t = await DatabaseService.getCartTotal();
      setTotal(t);
      const c = await DatabaseService.getCartCount();
      setCount(c);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (product) => {
    if (!product.isAvailable()) {
      throw new Error('Producto sin stock');
    }
    await DatabaseService.addToCart(product);
    await loadCart();
  }, [loadCart]);

  const updateQuantity = useCallback(async (productId, qty) => {
    if (qty < 0) return;
    await DatabaseService.updateCartQuantity(productId, qty);
    await loadCart();
  }, [loadCart]);

  const removeItem = useCallback(async (productId) => {
    await DatabaseService.removeFromCart(productId);
    await loadCart();
  }, [loadCart]);

  const checkout = useCallback(async (address) => {
    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }
    if (!address.trim()) {
      throw new Error('Ingrese una dirección');
    }
    const order = await ApiService.createOrder({
      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      total,
      address,
    });
    await DatabaseService.clearCart();
    await loadCart();
    return order;
  }, [items, total, loadCart]);

  useEffect(() => {
    DatabaseService.init().then(loadCart);
  }, [loadCart]);

  return {
    items,
    total,
    count,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    checkout,
    refresh: loadCart,
  };
}
