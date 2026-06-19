import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Si usas Expo cambia a: import { LinearGradient } from 'expo-linear-gradient';
import { Facebook, Instagram, Youtube, MessageSquare, Twitter, ChevronDown, ChevronUp } from 'lucide-react-native';
import BrandLogo from './BrandLogo';

// Activamos soporte de animaciones de layout nativas para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const linksData = [
  {
    title: 'Acerca del Banco',
    items: [
      { label: 'Sobre Banco del Quetzal', screen: 'About' },
      { label: 'Calificación y reconocimiento', screen: 'Awards' },
      { label: 'Inversionista', screen: 'Investors' },
      { label: 'Línea de ética', screen: 'Ethics' },
      { label: 'Sostenibilidad empresarial', screen: 'Sustainability' },
      { label: 'Trabaja con nosotros', screen: 'Careers' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Información Financiera', screen: 'FinancialInfo' },
      { label: 'Gobierno Corporativo', screen: 'Governance' },
      { label: 'Términos y Condiciones', screen: 'TermsAndConditions' },
      { label: 'Legales', screen: 'Legals' },
    ],
  },
  {
    title: 'Accesos rápidos',
    items: [
      { label: 'Blog', screen: 'Blog' },
      { label: 'Medios y Prensa', screen: 'Press' },
      { label: 'Mapa del Sitio', screen: 'SiteMap' },
    ],
  },
  {
    title: 'Contáctanos',
    items: [
      { label: 'Teléfono: 2411-6000', action: 'tel:24116000', isAction: true },
      { label: 'PBX: 1717', action: 'tel:1717', isAction: true },
      { label: 'Dirección: Vía 5 5-35 Zona 4, Guatemala', action: 'maps://app?daddr=Via+5+5-35+Zona+4+Guatemala', isAction: true },
    ],
  },
];

const Footer = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (title) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSection(activeSection === title ? null : title);
  };

  const handlePressItem = (item) => {
    if (item.isAction && item.action) {
      Linking.openURL(item.action).catch((err) => console.error('No se pudo ejecutar la acción:', err));
    } else if (item.screen && navigation) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <LinearGradient
      colors={['#05406B', '#0A4C7A', '#0E2235']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Efectos de luces sutiles (Blur) */}
      <View style={styles.blurTopLeft} />
      <View style={styles.blurBottomRight} />

      {/* Bloque Identidad Superior */}
      <View style={styles.headerBlock}>
        <BrandLogo compact />
        <Text style={styles.subBrandText}>BANCO DEL QUETZAL</Text>
        
        {/* Fila de Redes Sociales */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('#')}>
            <Facebook color="#22D3EE" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('#')}>
            <Instagram color="#22D3EE" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('#')}>
            <Youtube color="#22D3EE" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('#')}>
            <MessageSquare color="#22D3EE" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('#')}>
            <Twitter color="#22D3EE" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Listas Desplegables de Enlaces */}
      <View style={styles.menuContainer}>
        {linksData.map((col) => {
          const isOpen = activeSection === col.title;
          return (
            <View key={col.title} style={styles.sectionWrapper}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => toggleSection(col.title)}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionTitle}>{col.title}</Text>
                {isOpen ? <ChevronUp color="#22D3EE" size={16} /> : <ChevronDown color="#22D3EE" size={16} />}
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.itemsList}>
                  {col.items.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.itemTouch} 
                      onPress={() => handlePressItem(item)}
                    >
                      <Text style={styles.itemText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Bloque de Derechos y Enlaces Legales Basales */}
      <View style={styles.bottomBlock}>
        <Text style={styles.copyrightText}>
          2026 © Todos los derechos reservados.{"\n"}Corporación Banco del Quetzal.
        </Text>
        
        <View style={styles.legalLinksRow}>
          <TouchableOpacity onPress={() => navigation?.navigate('PrivacyPolicy')}>
            <Text style={styles.legalLink}>Política de privacidad</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>|</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('TermsAndConditions')}>
            <Text style={styles.legalLink}>Términos de uso</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginTop: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  blurTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  blurBottomRight: {
    position: 'absolute',
    bottom: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(253, 224, 71, 0.04)',
  },
  headerBlock: {
    alignItems: 'center',
  },
  subBrandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22D3EE',
    letterSpacing: 1.5,
    marginTop: 6,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.1)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 20,
  },
  menuContainer: {
    gap: 4,
  },
  sectionWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  itemsList: {
    paddingBottom: 12,
    paddingLeft: 4,
    gap: 12,
  },
  itemTouch: {
    paddingVertical: 2,
  },
  itemText: {
    fontSize: 13,
    color: 'rgba(241, 245, 249, 0.75)',
  },
  bottomBlock: {
    alignItems: 'center',
    gap: 12,
  },
  copyrightText: {
    fontSize: 11,
    color: 'rgba(241, 245, 249, 0.4)',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: 'rgba(34, 211, 238, 0.7)',
  },
  legalDivider: {
    color: 'rgba(255, 255, 255, 0.1)',
  },
});

export default Footer;