import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_PIC_PREFIX = 'bq-profile-pic-';

function profilePicStorageKey(user) {
  if (!user) return null;
  const key = user.id ?? user.username;
  if (key == null || key === '') return null;
  return `${PROFILE_PIC_PREFIX}${String(key)}`;
}

// Auxiliares asíncronos para persistir imágenes base64 en almacenamiento masivo
async function readStoredProfilePictureAsync(user) {
  const k = profilePicStorageKey(user);
  if (!k) return null;
  try {
    return await AsyncStorage.getItem(k);
  } catch {
    return null;
  }
}

async function writeStoredProfilePictureAsync(user, dataUrl) {
  const k = profilePicStorageKey(user);
  if (!k || !dataUrl) return;
  try {
    await AsyncStorage.setItem(k, dataUrl);
  } catch (e) {
    console.warn('[auth] No se pudo persistir la foto de perfil:', e.message);
  }
}

async function removeStoredProfilePictureAsync(user) {
  const k = profilePicStorageKey(user);
  if (!k) return;
  try {
    await AsyncStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (token, user, refreshToken = null) => {
        // En móviles leemos de forma asíncrona antes de despachar el estado mutado
        const storedPic = user ? await readStoredProfilePictureAsync(user) : null;
        const mergedUser = user
          ? {
              ...user,
              profilePicture:
                storedPic || user.profilePicture || user.avatar || null,
            }
          : null;

        set({
          token,
          user: mergedUser,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setTokens: (token, refreshToken = null) => set({ token, refreshToken }),
      
      setUser: (user) => set({ user }),
      
      /** Actualiza campos del usuario en sesión y persiste la foto de manera asíncrona */
      patchUser: (partial) =>
        set((state) => {
          if (!state.user) return state;
          const nextUser = { ...state.user, ...partial };
          
          if (Object.prototype.hasOwnProperty.call(partial, 'profilePicture')) {
            if (partial.profilePicture) {
              writeStoredProfilePictureAsync(nextUser, partial.profilePicture);
            } else {
              removeStoredProfilePictureAsync(nextUser);
            }
          }
          return { user: nextUser };
        }),

      logout: () => set({ token: null, user: null, refreshToken: null, isAuthenticated: false }),

      getToken: () => get().token,
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      // Se inyecta explícitamente el almacenamiento nativo de React Native
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Manejo de la hidratación diferida para recuperar llaves pesadas
useAuthStore.persist.onFinishHydration(async () => {
  const u = useAuthStore.getState().user;
  if (!u) return;
  
  const stored = await readStoredProfilePictureAsync(u);
  if (stored && !u.profilePicture) {
    useAuthStore.setState({ user: { ...u, profilePicture: stored } });
  }
});

export default useAuthStore;