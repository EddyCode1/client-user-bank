import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

// Mapeo numérico exacto de tamaños para asegurar un aspecto circular perfecto (1:1)
const SIZES = {
  sm: 44,  // h-11 w-11 web
  md: 64,  // h-16 w-16 web
  lg: 80,  // h-20 w-20 web
  xl: 144, // h-36 w-36 web
};

export default function LogoEmblem({ size = 'md' }) {
  const currentSize = SIZES[size] || SIZES.md;

  // Calculamos dinámicamente el radio del borde para garantizar el círculo perfecto
  const dynamicContainerStyle = {
    width: currentSize,
    height: currentSize,
    borderRadius: currentSize / 2,
  };

  return (
    <View style={[styles.outerContainer, dynamicContainerStyle]}>
      <View style={styles.innerContainer}>
        <Image
          source={require('../../../assets/kinal_sports.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombras premium optimizadas para hilos nativos (iOS y Android)
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3, // Respaldo de sombra sutil para Android
    borderWidth: 1,
    borderColor: 'rgba(47, 127, 191, 0.12)',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC', // Fondo gris mate sutil para dar profundidad en reemplazo del gradiente
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8%', // Mantiene el respiro interno exacto de la web
  },
  logoImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.02 }], // Mantiene la ligera escala de enfoque visual
  },
});