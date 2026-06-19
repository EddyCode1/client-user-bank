import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Menu } from 'lucide-react-native';
import useAuthStore from '../../features/auth/store/useAuthStore';
import LogoEmblem from './LogoEmblem';

/**
 * Barra superior limpia y profesional optimizada para la navegación móvil.
 * Conecta directamente con el Drawer de React Navigation.
 * * @param {Object} props
 * @param {Object} props.navigation - Objeto de navegación nativo para abrir el menú lateral.
 */
const Navbar = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbarContainer}>
        
        {/* Bloque Izquierdo: Menú + Logo + Textos */}
        <View style={styles.leftSection}>
          {/* Botón táctil para desplegar el Drawer lateral nativo */}
          <TouchableOpacity
            onPress={() => navigation?.openDrawer()}
            style={styles.menuButton}
            activeOpacity={0.7}
            accessibilityLabel="Abrir menú de navegación"
          >
            <Menu color="#05406B" size={22} />
          </TouchableOpacity>

          {/* Logotipo circular */}
          <LogoEmblem size="sm" />

          {/* Divisor vertical sutil */}
          <View style={styles.verticalDivider} />

          {/* Información del Usuario en sesión */}
          <View style={styles.userInfo}>
            <Text style={styles.brandSubtitle}>BANCO DEL QUETZAL</Text>
            <Text style={styles.welcomeText} numberOfLines={1}>
              Bienvenido, {user?.nombre || 'Usuario'}
            </Text>
          </View>
        </View>

        {/* Bloque Derecho: Estado de seguridad (Simplificado para mobile view) */}
        <View style={styles.securityBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.securityText}>Protegido</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    // Asegura sombras sutiles en la parte superior de la pantalla
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  navbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0, // Permite el correcto truncado de textos hijos en flexbox
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0F14',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981', // Verde esmeralda vivo
  },
  securityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
});

export default Navbar;