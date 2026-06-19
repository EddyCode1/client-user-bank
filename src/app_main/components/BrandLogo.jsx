import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LogoEmblem from './LogoEmblem';

/**
 * Marca institucional pura para pantallas de autenticación: emblema + nombre y eslogan.
 * Totalmente desacoplada de cualquier otra estructura global.
 * * @param {Object} props
 * @param {boolean} props.compact - Modifica el tamaño del emblema y los espaciados en pantallas densas.
 */
const BrandLogo = ({ compact = false }) => {
  return (
    <View style={[styles.container, compact ? styles.gapCompact : styles.gapNormal]}>
      
      {/* Componente del Emblema Independiente */}
      <LogoEmblem size={compact ? 'lg' : 'xl'} />

      <View style={styles.textContainer}>
        {/* Título Principal Institucional con soporte Small-Caps */}
        <Text 
          style={[
            styles.title, 
            compact ? styles.titleCompact : styles.titleNormal
          ]}
        >
          Banco del Quetzal
        </Text>

        {/* Eslogan Corporativo */}
        <Text 
          style={[
            styles.slogan, 
            compact ? styles.sloganCompact : styles.sloganNormal
          ]}
        >
          Tu bienestar es nuestro trabajo
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gapNormal: {
    gap: 24, // Equivalente a gap-6 de Tailwind (24px)
  },
  gapCompact: {
    gap: 16, // Equivalente a gap-4 de Tailwind (16px)
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 8, // Emula perfectamente el space-y-2 de la versión web
  },
  title: {
    fontWeight: '700',
    color: '#E2E8F0', // Texto claro mate para alta visibilidad en interfaces oscuras
    textAlign: 'center',
    letterSpacing: 1.2, // tracking-[0.08em] aproximado
    fontVariant: ['small-caps'], // Forzado nativo de mayúsculas tipo versalitas
  },
  titleNormal: {
    fontSize: 26,
  },
  titleCompact: {
    fontSize: 20,
  },
  slogan: {
    fontStyle: 'italic',
    color: '#94A3B8', // Tono muted gris slate sutil
    textAlign: 'center',
    maxWidth: 280, // Evita que se desborde horizontalmente en pantallas delgadas
  },
  sloganNormal: {
    fontSize: 14,
    lineHeight: 20,
  },
  sloganCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default BrandLogo;