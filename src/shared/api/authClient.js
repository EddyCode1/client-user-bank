import axios from 'axios';
import useAuthStore from '../../features/auth/store/useAuthStore';
import { attachTokenRefreshInterceptor } from './tokenRefresh';
import { handleSessionError } from './sessionErrorHandler';

const authClient = axios.create({
  baseURL: (
    process.env.EXPO_PUBLIC_API_AUTH_URL || 'http://192.168.1.45:5025/api/v1'
  ).replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
});

authClient.interceptors.request.use(
  (config) => {
    // Lectura de token desde el store global de Zustand
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error no proviene de un reintento fallido de refresh token, procesar manejo de sesión
    if (!error.config?._retry) {
      handleSessionError(error);
    }
    return Promise.reject(error);
  }
);

// Adjunta el interceptor secuencial para la renovación transparente de tokens caídos (401)
attachTokenRefreshInterceptor(authClient);

export default authClient;