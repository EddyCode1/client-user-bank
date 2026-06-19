import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import useAuthStore from '../../features/auth/store/useAuthStore';

// Importaciones de tus componentes nativos ya migrados
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfileButton from '../../features/account/components/ProfileButton';

// Importación de las pantallas de negocio individuales (reemplazan las subrutas del Outlet)
import PanelGeneralScreen from '../../features/dashboard/screens/PanelGeneralScreen';
import SaldosScreen from '../../features/dashboard/screens/SaldosScreen';
import CuentasScreen from '../../features/dashboard/screens/CuentasScreen';
import TransaccionesScreen from '../../features/dashboard/screens/TransaccionesScreen';
import ProductosScreen from '../../features/dashboard/screens/ProductosScreen';
import ServiciosScreen from '../../features/dashboard/screens/ServiciosScreen';
import FavoritosScreen from '../../features/dashboard/screens/FavoritosScreen';
import ProfileScreen from '../../features/dashboard/screens/ProfileScreen';
import UsersManagementScreen from '../../features/admin/screens/UsersManagementScreen';

const Drawer = createDrawerNavigator();

/**
 * Contenedor de Pantalla Único (Emula el ciclo de vida del Layout Web).
 * Envuelve cada pantalla del módulo para inyectar de forma homogénea el Navbar superior,
 * el área de contenido scrolleable, el ProfileButton flotante y el Footer institucional.
 */
const ScreenLayoutWrapper = ({ component: Component, navigation }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <View style={styles.layoutContainer}>
      {/* Navbar Superior unificado conectado con el Drawer de React Navigation */}
      <Navbar navigation={navigation} />

      {/* Contenedor con Scroll que unifica la vista de negocio con el Footer */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Se monta dinámicamente la pantalla de negocio activa en el stack */}
          <Component navigation={navigation} />
        </View>
        
        {/* Footer institucional al final del Scroll general */}
        <Footer navigation={navigation} />
      </ScrollView>

      {/* Botón flotante de Perfil (Mantiene la persistencia absoluta de la versión web) */}
      <ProfileButton
        imageUrl={user?.profilePicture}
        email={user?.email}
        onEditProfile={() => navigation.navigate('Perfil')}
        onLogout={handleLogout}
        onChangePhoto={() => navigation.navigate('Perfil', { editPhoto: 1 })}
      />
    </View>
  );
};

/**
 * Navegador Principal (Sustituye al MainLayout web).
 * Centraliza las rutas protegidas del panel bajo un Drawer Navigator optimizado.
 */
export default function MainNavigator() {
  return (
    <Drawer.Navigator
      // Inyectamos nuestro Sidebar nativo personalizado
      drawerContent={(props) => <Sidebar {...props} />}
      screenOptions={{
        headerShown: false, // Desactivamos el header por defecto para usar el Navbar corporativo
        drawerType: 'slide', // Transición fluida nativa estilo slide premium
        swipeEnabled: true,  // Permite abrir/cerrar el menú arrastrando el dedo desde el borde
      }}
    >
      <Drawer.Screen name="PanelGeneral">
        {(props) => <ScreenLayoutWrapper {...props} component={PanelGeneralScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Saldos">
        {(props) => <ScreenLayoutWrapper {...props} component={SaldosScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Cuentas">
        {(props) => <ScreenLayoutWrapper {...props} component={CuentasScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Transacciones">
        {(props) => <ScreenLayoutWrapper {...props} component={TransaccionesScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Productos">
        {(props) => <ScreenLayoutWrapper {...props} component={ProductosScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Servicios">
        {(props) => <ScreenLayoutWrapper {...props} component={ServiciosScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Favoritos">
        {(props) => <ScreenLayoutWrapper {...props} component={FavoritosScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="Perfil">
        {(props) => <ScreenLayoutWrapper {...props} component={ProfileScreen} />}
      </Drawer.Screen>
      <Drawer.Screen name="UsersManagement">
        {(props) => <ScreenLayoutWrapper {...props} component={UsersManagementScreen} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Color mate de fondo base (--bg)
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
});