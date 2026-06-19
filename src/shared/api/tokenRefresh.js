import axios from 'axios';
import Toast from 'react-native-toast-message';
import useAuthStore from '../../features/auth/store/useAuthStore';

// IP unificada para la comunicación en red local de desarrollo
const DEV_MACHINE_IP = '192.168.1.45';

const authBaseURL = (
  process.env.VITE_AUTH_URL || `http://${DEV_MACHINE_IP}:5025/api/v1/Auth`
).replace(/\/$/, '');

let refreshPromise = null;

/**
 * Lanza la petición HTTP POST explícita para intercambiar el Refresh Token vencido por un par nuevo.
 */
async function requestNewTokens(refreshToken) {
  const response = await axios.post(
    `${authBaseURL}/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  const data = response.data || {};
  const token = data.token || data.Token;
  const newRefreshToken = data.refreshToken || data.RefreshToken || refreshToken;

  if (!token) {
    throw new Error('El backend no devolvió un token renovado');
  }

  // Almacena el par de llaves en tu store global de Zustand
  useAuthStore.getState().setTokens(token, newRefreshToken);
  return { token, refreshToken: newRefreshToken };
}

/**
 * Controla de forma segura el flujo concurrente de renovación de credenciales.
 */
export async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error('No hay refresh token disponible');
  }

  if (!refreshPromise) {
    refreshPromise = requestNewTokens(refreshToken).finally(() => {
      refreshPromise = null; // Libera el candado al finalizar la petición
    });
  }

  return refreshPromise;
}

/**
 * Fuerza el cierre de sesión destruyendo el estado y notificando de forma nativa en la pantalla.
 */
export function forceLogout(message = 'Tu sesión expiró por seguridad. Inicia sesión de nuevo.') {
  // 1. Limpiar estado de autenticación en Zustand
  useAuthStore.getState().logout();
  
  // 2. Disparar banner superior/inferior nativo
  Toast.show({
    type: 'error',
    text1: 'Sesión Finalizada',
    text2: message,
    position: 'bottom',
  });

  // NOTA NATIVA: Al cambiar el token a null, el enrutador condicional de React Navigation
  // desmonterá los layouts restringidos y renderizará automáticamente la vista de Login.
}

/**
 * Inyecta el interceptor de respuestas encargado de capturar respuestas 401 (Unauthorized)
 * e intentar resolverlas tras bambalinas antes de reventar la UI.
 */
export function attachTokenRefreshInterceptor(client) {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error?.response?.status;

      // Romper el ciclo de inmediato si:
      // - No es un error 401.
      // - No tenemos acceso al request original.
      // - Es una llamada repetida por segunda vez (_retry).
      // - Tiene banderas explícitas de exclusión o es la misma ruta de /refresh.
      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest._skipAuthRefresh ||
        originalRequest.url?.includes('/refresh')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true; // Marcamos la petición para evitar bucles infinitos

      try {
        // Ejecutamos la promesa compartida de renovación
        const { token } = await refreshAccessToken();
        
        // Re-inyectamos el nuevo token Bearer en las cabeceras originales
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Re-enviamos el request original exactamente con los mismos parámetros
        return client(originalRequest);
      } catch (refreshError) {
        // Si el refresh token mutó, fue revocado o expiró en base de datos, deslogueo inmediato
        forceLogout();
        return Promise.reject(refreshError);
      }
    }
  );
}