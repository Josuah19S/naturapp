import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ApiService from '../../src/services/apiService';
import DatabaseService from '../../src/services/databaseService';
import { Product } from '../../src/models/Product';
import { useCart } from '../../src/viewmodels/useCart';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ApiService.getProductById(id);
        setProduct(Product.fromJSON(data));
        const fav = await DatabaseService.isFavorite(id);
        setIsFavorite(fav);
      } catch {
        Alert.alert('Error', 'No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await DatabaseService.removeFavorite(product.id);
    } else {
      await DatabaseService.addFavorite(product);
    }
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = async () => {
    try {
      await addItem(product);
      Alert.alert('Agregado', `${product.name} se agregó al carrito.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#148F77" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{product.name}</Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Text style={styles.heart}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>{product.getFormattedPrice()}</Text>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.benefits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Beneficios</Text>
            {product.benefits.map((b, i) => (
              <Text key={i} style={styles.benefit}>• {b}</Text>
            ))}
          </>
        )}

        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Stock disponible:</Text>
          <Text style={[styles.stockValue, !product.isAvailable() && styles.outOfStock]}>
            {product.isAvailable() ? `${product.stock} unidades` : 'Sin stock'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, !product.isAvailable() && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={!product.isAvailable()}
        >
          <Text style={styles.addBtnText}>Agregar al Carrito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 280 },
  body: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1A5276', flex: 1, marginRight: 10 },
  heart: { fontSize: 26 },
  category: {
    fontSize: 13,
    color: '#888',
    textTransform: 'capitalize',
    marginTop: 4,
    marginBottom: 8,
  },
  price: { fontSize: 26, fontWeight: 'bold', color: '#148F77', marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5276',
    marginBottom: 6,
    marginTop: 12,
  },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },
  benefit: { fontSize: 14, color: '#444', marginBottom: 4, lineHeight: 20 },
  stockRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  stockLabel: { fontSize: 14, color: '#555' },
  stockValue: { fontSize: 14, fontWeight: '600', color: '#27AE60', marginLeft: 6 },
  outOfStock: { color: '#E74C3C' },
  addBtn: {
    backgroundColor: '#148F77',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addBtnDisabled: { backgroundColor: '#BDC3C7' },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
