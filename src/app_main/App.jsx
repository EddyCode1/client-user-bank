import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import AppNavigator from './navigation/AppNavigator'; // El que unifica Auth y Main

export default function App() {
  return (
    <>
      {/* Contenedor raíz de navegación nativa */}
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>

      {/* Notificaciones globales (Toast) */}
      <Toast 
        position="top"
        topOffset={50}
        config={toastConfig} 
      />
    </>
  );
}

// Configuración de estilos para el Toast nativo (equivalente a tu diseño web)
const toastConfig = {
  success: ({ text1, props }) => (
    <View style={[styles.toastBase, { backgroundColor: '#10b981' }]}>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
  error: ({ text1, props }) => (
    <View style={[styles.toastBase, { backgroundColor: '#ef4444' }]}>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastBase: {
    padding: 16,
    borderRadius: 8,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});