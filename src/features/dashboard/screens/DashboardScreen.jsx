import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  DeviceEventEmitter,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Importación de componentes e hilos de estado adaptados
import SummaryCard from '../components/SummaryCard';
import QuickLinks from '../components/QuickLinks';
import useAuthStore from '../../auth/store/useAuthStore';
import { accountService } from '../../account/service';
import { transactionService } from '../../transaction/service/transactionService';
import { getFavorites as fetchFavorites } from '../../favorite/service/favoriteService';
import { bankingClient } from '../../../shared/api/adminClient';

const { width } = Dimensions.get('window');

// Paleta de Colores de Alta Fidelidad Mate/Oscuro
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  card: '#262626',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5', // Turquesa
  accentPurple: '#A855F7',
  accentGreen: '#22C55E',
  accentOrange: '#F59E42',
  danger: '#EF4444',
  white: '#FFFFFF'
};

const quickLinksBase = [
  { id: 1, label: 'Cuentas',         path: 'Account',       icon: '◉', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
  { id: 2, label: 'Favoritos',       path: 'Favorites',     icon: '★', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
  { id: 3, label: 'Productos',       path: 'Products',      icon: '◫', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
  { id: 4, label: 'Servicios',       path: 'Services',      icon: '◌', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
  { id: 5, label: 'Saldos',          path: 'Saldos',        icon: '💳', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
  { id: 6, label: 'Horarios',        path: 'Schedules',     icon: '🕐', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
  { id: 7, label: 'Transacciones',   path: 'Transactions',  icon: '⇄', roles: ['USER_ROLE', 'ADMIN_ROLE'] },
];

const promoSlides = [
  {
    id: 1,
    tag: 'Créditos',
    title: 'Encuentra el crédito ideal para ti',
    subtitle: 'Tasas preferenciales para clientes verificados y acompañamiento financiero.',
    ctaLabel: 'Solicitar ahora',
    ctaPath: 'Products',
    image: require('../../../assets/banner-creditos.png'),
    overlay: 'rgba(30, 58, 95, 0.85)',
  },
  {
    id: 2,
    tag: 'Beneficios',
    title: 'Servicios exclusivos para ti',
    subtitle: 'Descuentos en tiendas y salud disponibles directo desde tu portal móvil.',
    ctaLabel: 'Ver catálogo',
    ctaPath: 'Services',
    image: require('../../../assets/banner-servicios.png'),
    overlay: 'rgba(13, 59, 46, 0.85)',
  },
];

const institutionalProducts = [
  {
    id: 1,
    title: 'Cuentas de Ahorro',
    description: 'Haz crecer tu dinero con opciones flexibles y rendimiento competitivo.',
    photo: require('../../../assets/card-ahorro.png'),
    path: 'Account',
    accent: '#00ADB5',
  },
  {
    id: 2,
    title: 'Seguros y Protección',
    description: 'Protege lo que más valoras: coberturas de vida, salud y hogar adaptadas.',
    photo: require('../../../assets/card-seguros.png'),
    path: 'Services',
    accent: '#22C55E',
  },
  {
    id: 3,
    title: 'Educación Financiera',
    description: 'Planifica tu futuro y aprende a administrar tus ingresos con cursos gratuitos.',
    photo: require('../../../assets/card-educacion.png'),
    path: 'Favorites',
    accent: '#A855F7',
  },
];

const securityTips = [
  { id: 1, title: 'Tu contraseña es personal', description: 'Nunca compartas tus credenciales. El banco jamás solicitará claves por llamada.', image: require('../../../assets/security-password.png') },
  { id: 2, title: 'Verifica la URL siempre', description: 'Asegúrate de estar en el canal digital oficial antes de ingresar.', image: require('../../../assets/security-url.png') },
  { id: 3, title: 'Sesión protegida', description: 'Utilizamos tokens encriptados. Cierra sesión al finalizar tus consultas.', image: require('../../../assets/security-jwt.png') },
];

const currencyOptions = ['GTQ', 'USD', 'EUR'];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Estados de Tipo de Cambio y Conversor
  const [referenceRates, setReferenceRates] = useState(null);
  const [loadingReferenceRates, setLoadingReferenceRates] = useState(true);
  const [referenceError, setReferenceError] = useState('');
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('GTQ');
  const [toCurrency, setToCurrency] = useState('USD');
  const [conversionResult, setConversionResult] = useState(null);
  const [loadingConversion, setLoadingConversion] = useState(false);
  const [exchangeError, setExchangeError] = useState('');

  // Resúmenes de cuenta
  const [summary, setSummary] = useState({ accounts: null, balance: null, transactions: null, favorites: null });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  const user = useAuthStore((s) => s.user);
  const userRole = user?.rol || user?.role || 'USER_ROLE';

  // Rotación Automática del Banner (Carrusel)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % promoSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Carga del Sumario Core Bancario
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setSummaryLoading(true);
        const [accountInfo, txInfo, favInfo] = await Promise.all([
          accountService.getMyInfo(),
          transactionService.getMyTransactions({ limit: 1 }),
          fetchFavorites(),
        ]);

        if (isMounted) {
          setSummary({
            accounts: accountInfo?.data?.summary?.totalAccounts ?? 0,
            balance: accountInfo?.data?.summary?.totalBalance ?? 0,
            transactions: txInfo?.data?.total ?? 0,
            favorites: favInfo?.success ? (favInfo.data?.length ?? 0) : 0,
          });
        }
      } catch {
        if (isMounted) setSummaryError('No se pudo cargar el resumen bancario.');
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Sincronización de Favoritos con Emisor de Eventos de React Native
  useEffect(() => {
    const refreshFavs = async () => {
      const favInfo = await fetchFavorites();
      setSummary((prev) => ({
        ...prev,
        favorites: favInfo?.success ? (favInfo.data?.length ?? 0) : prev.favorites,
      }));
    };

    const sub = DeviceEventEmitter.addListener('favorites:updated', refreshFavs);
    return () => sub.remove();
  }, []);

  // Consumo de API Externa para Tasas de Mercado
  useEffect(() => {
    async function loadReferenceRates() {
      try {
        setLoadingReferenceRates(true);
        const [usdRes, eurRes] = await Promise.all([
          fetch('https://api.exchangerate.host/latest?base=USD&symbols=GTQ'),
          fetch('https://api.exchangerate.host/latest?base=EUR&symbols=GTQ'),
        ]);

        const usdData = await usdRes.json();
        const eurData = await eurRes.json();

        setReferenceRates({
          usdRate: Number(usdData?.rates?.GTQ ?? 7.80), // Fallback controlado regional
          eurRate: Number(eurData?.rates?.GTQ ?? 8.40),
          updatedAt: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
        });
      } catch {
        setReferenceError('Tasas de mercado no disponibles offline.');
      } finally {
        setLoadingReferenceRates(false);
      }
    }
    loadReferenceRates();
  }, []);

  // Convertidor de Divisas Integrado con Debounce Técnico (350ms)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!amount || Number(amount) <= 0) {
        setConversionResult(null);
        return;
      }
      try {
        setLoadingConversion(true);
        setExchangeError('');
        const res = await bankingClient.get('/currency/convert', {
          params: { from: fromCurrency, to: toCurrency, amount: Number(amount) },
        });
        if (res?.data?.success) {
          setConversionResult(res.data);
        }
      } catch {
        setExchangeError('Falla de sincronización con el backend cambista.');
      } finally {
        setLoadingConversion(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [amount, fromCurrency, toCurrency]);

  const quickLinks = useMemo(() => quickLinksBase.filter(l => l.roles.includes(userRole)), [userRole]);

  const formatCurrency = (val) => {
    return `Q ${Number(val ?? 0).toFixed(2)}`;
  };

  const currentSlide = promoSlides[activeSlide];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* ── Carrusel / Banner Promocional ── */}
      <View style={styles.carouselContainer}>
        <Image source={currentSlide.image} style={styles.carouselImage} resizeMode="cover" />
        <View style={[styles.carouselOverlay, { backgroundColor: currentSlide.overlay }]} />
        
        <View style={styles.carouselContent}>
          <Text style={styles.carouselTag}>Banco del Quetzal · {currentSlide.tag}</Text>
          <h2 style={styles.carouselTitle}>{currentSlide.title}</h2>
          <Text style={styles.carouselSubtitle}>{currentSlide.subtitle}</Text>
          
          <View style={styles.carouselActions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate(currentSlide.ctaPath)}>
              <Text style={styles.btnPrimaryText}>{currentSlide.ctaLabel}</Text>
            </TouchableOpacity>
          </View>

          {/* Dots Indicadores */}
          <View style={styles.dotContainer}>
            {promoSlides.map((slide, i) => (
              <View key={slide.id} style={[styles.dot, i === activeSlide ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
        </View>
      </View>

      {/* ── Grid de Métricas (Summary Cards) ── */}
      <View style={styles.metricsGrid}>
        <SummaryCard title="Saldo total" value={formatCurrency(summary.balance)} icon="💰" loading={summaryLoading} error={summaryError} accent={colors.primary} />
        <SummaryCard title="Cuentas" value={summary.accounts} icon="🏦" loading={summaryLoading} error={summaryError} accent={colors.accentGreen} />
        <SummaryCard title="Transacciones" value={summary.transactions} icon="⇄" loading={summaryLoading} error={summaryError} accent={colors.accentPurple} />
        <SummaryCard title="Favoritos" value={summary.favorites} icon="★" loading={summaryLoading} error={summaryError} accent={colors.accentOrange} />
      </View>

      {/* ── Accesos Rápidos ── */}
      <View style={styles.sectionSection}>
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <Text style={styles.sectionSubtitle}>Selecciona una sección operativa para continuar.</Text>
        <View style={styles.innerSpacing}>
          <QuickLinks links={quickLinks} loading={summaryLoading} />
        </View>
      </View>

      {/* ── Tipo de Cambio e Intercambio de Moneda ── */}
      <View style={styles.sectionSection}>
        <Text style={styles.sectionTitle}>Tipo de cambio de referencia</Text>
        {loadingReferenceRates ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.exchangeRow}>
            <View style={styles.rateBox}><Text style={styles.rateLabel}>🇺🇸 USD</Text><Text style={styles.rateValue}>Q {referenceRates?.usdRate?.toFixed(2)}</Text></View>
            <View style={styles.rateBox}><Text style={styles.rateLabel}>🇪🇺 EUR</Text><Text style={styles.rateValue}>Q {referenceRates?.eurRate?.toFixed(2)}</Text></View>
          </View>
        )}

        {/* Formulario Conversor */}
        <View style={styles.converterBox}>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            placeholderTextColor={colors.muted}
            onChangeText={setAmount}
            placeholder="Monto a simular"
          />
          <View style={styles.resultBox}>
            {loadingConversion ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : conversionResult ? (
              <Text style={styles.resultText}>
                {conversionResult.amount} {conversionResult.from} = <Text style={{color: colors.primary, fontWeight: '700'}}>{conversionResult.convertedAmount} {conversionResult.to}</Text>
              </Text>
            ) : (
              <Text style={styles.resultPlaceholder}>Ingresa un monto válido para calcular.</Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Catálogo de Productos Institucionales ── */}
      <Text style={styles.sectionTitle}>Destacados e Inversión</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollProducts}>
        {institutionalProducts.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => navigation.navigate(product.path)}>
            <Image source={product.photo} style={styles.productImg} />
            <View style={styles.productContent}>
              <Text style={[styles.productTag, { color: product.accent }]}>{product.title}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>{product.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Tips de Seguridad Escaneables ── */}
      <View style={[styles.sectionSection, { marginBottom: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Tu seguridad es prioridad</Text>
        <View style={styles.securityGrid}>
          {securityTips.map(tip => (
            <View key={tip.id} style={styles.securityItem}>
              <Text style={styles.securityItemTitle}>• {tip.title}</Text>
              <Text style={styles.securityItemDesc}>{tip.description}</Text>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 16,
    gap: 20,
  },
  carouselContainer: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImage: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  carouselTag: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  carouselTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  carouselSubtitle: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.9,
  },
  carouselActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  btnPrimary: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnPrimaryText: {
    color: '#1E3A5F',
    fontWeight: '700',
    fontSize: 13,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.white,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  metricsGrid: {
    width: '100%',
  },
  sectionSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  innerSpacing: {
    marginTop: 16,
  },
  exchangeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  rateBox: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  rateValue: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  converterBox: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultBox: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    color: colors.text,
    fontSize: 13,
  },
  resultPlaceholder: {
    color: colors.muted,
    fontSize: 13,
  },
  scrollProducts: {
    flexDirection: 'row',
    marginTop: 8,
  },
  productCard: {
    width: width * 0.65,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 14,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: 110,
    backgroundColor: colors.white,
  },
  productContent: {
    padding: 12,
    gap: 4,
  },
  productTag: {
    fontSize: 14,
    fontWeight: '700',
  },
  productDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  securityGrid: {
    marginTop: 12,
    gap: 10,
  },
  securityItem: {
    gap: 2,
  },
  securityItemTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  securityItemDesc: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    paddingLeft: 10,
  },
});