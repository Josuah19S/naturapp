import { useEffect } from 'react';
import { Stack } from 'expo-router';
import DatabaseService from '../src/services/databaseService';

export default function RootLayout() {
  // Inicializar almacenamiento local (AsyncStorage) al arrancar la app
  useEffect(() => {
    DatabaseService.init()
      .then(() => console.log('Almacenamiento local listo'))
      .catch(err => console.error('Error almacenamiento:', err));
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1A5276' },
        headerTintColor: '#FFF',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Detalle del Producto' }} />
    </Stack>
  );
}
