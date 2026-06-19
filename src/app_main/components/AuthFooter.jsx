import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import LogoEmblem from './LogoEmblem';

/**
 * Footer reducido para pantallas de autenticación (login, registro, verificación).
 * Mantiene la marca, avisos legales mínimos y soporte nativo telefónico.
 * * @param {Object} props
 * @param {Object} props.navigation - Objeto de navegación de React Navigation para redirecciones
 */
const AuthFooter = ({ navigation }) => {
  const year = new Date().getFullYear();

  // Función nativa para realizar llamadas telefónicas directas al soporte de Guatemala
  const handleCallSupport = () => {
    Linking.openURL('tel:24116000').catch((err) => 
      console.error('No se pudo abrir el marcador de llamadas:', err)
    );
  };

  return (
    <View style={styles.footerContainer}>
      {/* Sección de Marca e Información de Seguridad */}
      <View style={styles.brandRow}>
        <LogoEmblem size="sm" />
        <View style={styles.brandTextContainer}>
          <Text style={styles.brandTitle}>Banco del Quetzal</Text>
          <Text style={styles.securityText}>Conexión cifrada TLS 1.3</Text>
        </View>
      </View>

      {/* Enlaces de Navegación y Políticas */}
      <View style={styles.navContainer}>
        <TouchableOpacity 
          onPress={() => navigation?.navigate('Welcome')} 
          activeOpacity={0.7}
        >
          <Text style={styles.navLink}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation?.navigate('TermsAndConditions')} 
          activeOpacity={0.7}
        >
          <Text style={styles.navLink}>Términos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation?.navigate('PrivacyPolicy')} 
          activeOpacity={0.7}
        >
          <Text style={styles.navLink}>Privacidad</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleCallSupport} 
          activeOpacity={0.7}
        >
          <Text style={[styles.navLink, styles.supportLink]}>Soporte 2411-6000</Text>
        </TouchableOpacity>
      </View>

      {/* Copyright Legal */}
      <Text style={styles.copyrightText}>
        © {year} Corporación Banco del Quetzal
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#0A0F14', // Fondo profundo mate
    borderTopWidth: 1,
    borderTopColor: '#16222F', // Borde sutil oscuro
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTextContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0', // Texto claro
    letterSpacing: 0.3,
  },
  securityText: {
    fontSize: 10,
    color: '#1FA187', // Acento turquesa/verde jade para denotar seguridad
    fontWeight: '500',
    marginTop: 1,
  },
  navContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16, // Funciona de forma nativa en versiones modernas de React Native
  },
  navLink: {
    fontSize: 11,
    color: '#94A3B8', // Gris slate suave
    fontWeight: '500',
  },
  supportLink: {
    color: '#1FA187', // Resalte turquesa mate para el canal de soporte rápido
  },
  copyrightText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default AuthFooter;