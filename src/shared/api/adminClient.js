import axios from 'axios';
import useAuthStore from '../../features/auth/store/useAuthStore';
import { attachTokenRefreshInterceptor } from './tokenRefresh';
import { handleSessionError } from './sessionErrorHandler';

// IP de desarrollo para pruebas en emuladores/dispositivos (Reemplaza con tu IP local de ser necesario)
const DEV_MACHINE_IP = '192.168.1.45'; 

/**
 * En React Native se leen las variables desde process.env (vía react-native-dotenv)
 * Se provee un fallback automático con la IP local de tu máquina en vez de 'localhost'
 */
const apiBase = (
  process.env.VITE_API_BASE || `http://${DEV_MACHINE_IP}:5025/api/v1`
).replace(/\/$/, '');

/** Servidor Node (Sistema Bancario): transacciones, depósitos, cuentas, etc. */
const bankingApiBase = (
  process.env.VITE_BANKING_API_BASE || `http://${DEV_MACHINE_IP}:3000/SistemaBancarioAdmin/v1`
).replace(/\/$/, '');

/** AdminController (.NET) → api/v1/admin */
const adminClient = axios.create({
  baseURL: `${apiBase}/admin`,
  headers: { 'Content-Type': 'application/json' },
});

/** Rutas bajo api/v1 no prefijadas con /admin (UsersController, etc.) */
export const publicClient = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

/** Cliente para el backend Node (MongoDB): /transactions, /accounts, etc. */
export const bankingClient = axios.create({
  baseURL: bankingApiBase,
  headers: { 'Content-Type': 'application/json' },
});

/** Interceptor compartido para agregar token, renovar sesión y manejar errores */
function attachInterceptors(client) {
  client.interceptors.request.use(
    (config) => {
      // Zustand funciona perfectamente igual en Web y React Native
      const token = useAuthStore.getState().getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // En React Native, FormData nativo requiere conservar el Content-Type multipart/form-data automático
      if (config.data && config.data.constructor.name === 'FormData') {
        delete config.headers['Content-Type'];
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.config?._retry) {
        handleSessionError(error);
      }
      return Promise.reject(error);
    }
  );

  attachTokenRefreshInterceptor(client);
}

// Vinculación de interceptores globales
attachInterceptors(adminClient);
attachInterceptors(publicClient);
attachInterceptors(bankingClient);

export default adminClient;