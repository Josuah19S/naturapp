import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useProfile } from '../../src/viewmodels/useProfile';
import StorageService from '../../src/services/storageService';

export default function ProfileScreen() {
  const {
    name,
    setName,
    email,
    setEmail,
    darkTheme,
    notifications,
    saveProfile,
    toggleTheme,
    toggleNotifications,
  } = useProfile();

  const handleSave = async () => {
    await saveProfile();
    Alert.alert('Guardado', 'Perfil actualizado correctamente.');
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await StorageService.logout();
          Alert.alert('Sesión cerrada');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Perfil</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos Personales</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Tema oscuro</Text>
          <Switch
            value={darkTheme}
            onValueChange={toggleTheme}
            trackColor={{ true: '#148F77' }}
          />
        </View>
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Notificaciones</Text>
          <Switch
            value={notifications}
            onValueChange={toggleNotifications}
            trackColor={{ true: '#148F77' }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A5276', marginBottom: 20 },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5276',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  saveBtn: {
    backgroundColor: '#148F77',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  preferenceLabel: { fontSize: 15, color: '#333' },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutText: { color: '#E74C3C', fontWeight: '600', fontSize: 15 },
});
