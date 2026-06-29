import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useOrders } from '../../src/viewmodels/useOrders';

export default function OrdersScreen() {
  const { orders, loading, error, refresh } = useOrders();

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#148F77" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Pedidos</Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Pedido #{item.id}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.getStatusColor() },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.date}>{item.getFormattedDate()}</Text>
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.itemCount}>
                  {item.items.length} producto(s)
                </Text>
                <Text style={styles.total}>S/ {item.total?.toFixed(2)}</Text>
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No tienes pedidos aún</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A5276', marginBottom: 16 },
  error: { color: '#E74C3C', textAlign: 'center', marginTop: 40, fontSize: 15 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#999' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#1A5276' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  date: { fontSize: 13, color: '#888', marginBottom: 4 },
  address: { fontSize: 13, color: '#555', marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  itemCount: { fontSize: 13, color: '#888' },
  total: { fontSize: 16, fontWeight: 'bold', color: '#148F77' },
});
