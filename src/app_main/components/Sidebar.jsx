import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  ArrowLeftRight, 
  Package, 
  Settings, 
  Star, 
  Users, 
  LogOut 
} from 'lucide-react-native';
import useAuthStore from '../../features/auth/store/useAuthStore';
import LogoEmblem from './LogoEmblem';
import { isAdminUser } from '../../shared/auth/roles';

const menuItems = [
  { screen: 'PanelGeneral', label: 'Panel general', icon: LayoutDashboard },
  { screen: 'Saldos', label: 'Saldos', icon: Wallet },
  { screen: 'Cuentas', label: 'Cuentas', icon: CreditCard },
  { screen: 'Transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { screen: 'Productos', label: 'Productos', icon: Package },
  { screen: 'Servicios', label: 'Servicios', icon: Settings },
  { screen: 'Favoritos', label: 'Favoritos', icon: Star },
];

/**
 * Contenido personalizado para el Drawer Navigation (Menú Lateral Móvil).
 */
const Sidebar = (props) => {
  const { state, navigation } = props;
  const { logout, user } = useAuthStore();
  const isAdmin = isAdminUser(user);

  // Obtener el nombre de la pantalla activa en la pila nativa
  const activeRouteName = state?.routeNames[state.index];

  const handleLogout = () => {
    logout();
    // Resetea el stack de navegación hacia el flujo de autenticación
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Fijo Superior */}
      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <LogoEmblem size="sm" />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandSubtitle}>BANCO DEL QUETZAL</Text>
            <Text style={styles.brandTitle}>Mesa financiera</Text>
          </View>
        </View>

        {user?.nombre && (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeText} numberOfLines={1}>
              👋 Hola, <Text style={styles.userName}>{user.nombre}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Cuerpo del menú con Scroll Nativo */}
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeading}>Menú principal</Text>
        
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeRouteName === item.screen;

          return (
            <TouchableOpacity
              key={item.screen}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
              style={[styles.menuItemTouch, isActive && styles.menuItemActive]}
            >
              <IconComponent 
                color={isActive ? '#FFFFFF' : '#05406B'} 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[styles.menuItemLabel, isActive && styles.menuItemLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Sección condicional para Administradores */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <View style={styles.adminDivider} />
            <Text style={styles.sectionHeading}>Administración</Text>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('UsersManagement')}
              activeOpacity={0.7}
              style={[
                styles.menuItemTouch, 
                activeRouteName === 'UsersManagement' && styles.menuItemActiveAdmin
              ]}
            >
              <Users 
                color={activeRouteName === 'UsersManagement' ? '#FFFFFF' : '#05406B'} 
                size={20} 
              />
              <Text 
                style={[
                  styles.menuItemLabel, 
                  activeRouteName === 'UsersManagement' && styles.menuItemLabelActive
                ]}
              >
                Usuarios
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </DrawerContentScrollView>

      {/* Footer Fijo Inferior: Cierre de Sesión */}
      <View style={styles.footerBlock}>
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <LogOut color="#FFFFFF" size={18} />
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBlock: {
    paddingTop: 24, // Ajuste para darle aire abajo de la barra de estado si es necesario
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0F14',
    marginTop: 2,
  },
  welcomeBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748B',
  },
  userName: {
    fontWeight: '600',
    color: '#0A0F14',
  },
  scrollContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  menuItemTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#05406B', // Color primario corporativo
    shadowColor: '#05406B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemActiveAdmin: {
    backgroundColor: '#0A4C7A', // Variante para diferenciar admin si se desea
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  menuItemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  adminSection: {
    marginTop: 16,
  },
  adminDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  footerBlock: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626', // Rojo institucional para danger/logout
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Sidebar;