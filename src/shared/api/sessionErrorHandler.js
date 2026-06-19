import Toast from 'react-native-toast-message'; // O la librería de alertas que uses en tu UI
import useAuthStore from '../../features/auth/store/useAuthStore';

let lastForbiddenToastAt = 0;
const FORBIDDEN_TOAST_COOLDOWN_MS = 2500;

/**
 * Evalúa si el mensaje de error del backend indica un fallo crítico de firma o expiración del JWT.
 */
function isAuthTokenFailure(error) {
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.title ||
      error?.message ||
      ''
  ).toLowerCase();

  return (
    message.includes('token') ||
    message.includes('jwt') ||
    message.includes('expired') ||
    message.includes('expirado') ||
    message.includes('invalid signature') ||
    message.includes('unauthorized')
  );
}

/**
 * Maneja de forma centralizada las respuestas HTTP con errores de autenticación o permisos (401 / 403).
 */
export function handleSessionError(error) {
  const status = error?.response?.status;
  const shouldLogout = status === 401 || (status === 403 && isAuthTokenFailure(error));

  if (shouldLogout) {
    // 1. Limpiamos el estado global de autenticación en Zustand
    useAuthStore.getState().logout();
    
    // 2. Desplegamos la notificación nativa en la pantalla móvil
    Toast.show({
      type: 'error',
      text1: 'Sesión Expirada',
      text2: 'Tu sesión expiró por seguridad. Inicia sesión de nuevo.',
      position: 'bottom',
    });

    // NOTA DE NAVEGACIÓN: Al ejecutar .logout(), tu RootNavigator de React Native
    // detectará que token === null y cambiará automáticamente el flujo visual al Login.
    return;
  }

  // Control de accesos denegados sin desloguear (Mismo rol sin permisos suficientes para un endpoint)
  if (status === 403) {
    const now = Date.now();
    if (now - lastForbiddenToastAt >= FORBIDDEN_TOAST_COOLDOWN_MS) {
      lastForbiddenToastAt = now;
      
      Toast.show({
        type: 'error',
        text1: 'Acceso Denegado',
        text2: 'No tienes permisos para realizar esta acción.',
        position: 'bottom',
      });
    }
  }
}