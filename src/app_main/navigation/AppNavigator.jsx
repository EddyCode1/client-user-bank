import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useAuthStore from '../../features/auth/store/useAuthStore';

// Navegadores hijos
import AuthNavigator from './AuthNavigator'; // El que tiene Login/Registro
import MainNavigator from './MainNavigator'; // El que tiene Drawer y vistas privadas

const Stack = createStackNavigator();

/**
 * AppNavigator central:
 * Actúa como el guardia de seguridad (equivalente a tu ProtectedRoute).
 * Decide qué grupo de navegación mostrar basado en el estado de autenticación.
 */
export default function AppNavigator() {
  const { isAuthenticated, token } = useAuthStore();
  const isLoggedIn = !!(isAuthenticated && token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // Si hay sesión, solo existen las rutas del Main (Privadas)
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // Si no hay sesión, solo existen las rutas del Auth (Públicas)
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}