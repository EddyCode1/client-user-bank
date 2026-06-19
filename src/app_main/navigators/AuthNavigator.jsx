import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa tus pantallas reales de autenticación
import LoginScreen from '../../features/auth/screens/LoginScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';

const Stack = createStackNavigator();

/**
 * Navegador de Autenticación (Sustituye al AuthLayout web).
 * Define el fondo institucional en relieve de forma global para que actúe como una capa base fija
 * debajo de todas las transiciones de pantalla de Login, Registro, etc.
 */
export default function AuthNavigator() {
  return (
    <View style={styles.masterContainer}>
      {/* Imagen de fondo base fija para todo el flujo de autenticación */}
      <Image
        source={require('../../assets/LoginImage.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        accessible={false}
        importantForAccessibility="no"
      />

      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Ocultamos el header nativo por defecto
          cardStyle: { backgroundColor: 'transparent' }, // Crítico: permite ver la imagen de fondo fija
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9', // slate-100 base
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
});