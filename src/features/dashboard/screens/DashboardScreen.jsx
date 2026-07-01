import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '../../../shared/store/authStore';
import { SPACING, FONT_SIZE, RADIUS } from '../../../shared/constants/theme';
import SummaryCard from '../components/SummaryCard';
import QuickLinks from '../components/QuickLinks';
import { useMyAccounts } from '../../account/hooks/useMyAccounts';
import { navigateToMainTab } from '../../../shared/navigation/tabNavigation';

// Paleta oscura consistente con el resto de la app (Favoritos, Transacciones, Productos, etc.)
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  accent: '#6366F1',
};

const QUICK_LINKS = [
  { id: 'account',      label: 'Mis Cuentas',    icon: '🏦', path: 'Account' },
  { id: 'transactions', label: 'Transacciones',  icon: '💸', path: 'Transacciones' },
  { id: 'favorites',    label: 'Favoritos',      icon: '⭐', path: 'Favorites' },
  { id: 'profile',      label: 'Mi Perfil',      icon: '👤', path: { tab: 'More', screen: 'Profile' } },
  { id: 'products',     label: 'Productos',      icon: '📦', path: { tab: 'More', screen: 'Products' } },
  { id: 'services',     label: 'Servicios',      icon: '🧾', path: { tab: 'More', screen: 'Services' } },
];

export default function DashboardScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const { accounts, summary, loading, summaryLoading, refresh } = useMyAccounts();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const formatBalance = (amount) =>
    Number(amount || 0).toLocaleString('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      maximumFractionDigits: 2,
    });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading || summaryLoading}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Saludo */}
      <Animated.View
        entering={FadeInDown.duration(450).springify().damping(15)}
        style={styles.greetingCard}
      >
        <Text style={styles.greetingLabel}>Banco del Quetzal</Text>
        <Text style={styles.greetingText}>
          {greeting}, {user?.nombre || user?.name || user?.username || 'Usuario'}
        </Text>
        <Text style={styles.greetingSubtext}>
          Bienvenido a tu banca digital
        </Text>
      </Animated.View>

      {/* Resumen de cuentas */}
      <Animated.Text
        entering={FadeInUp.duration(400).delay(80)}
        style={styles.sectionTitle}
      >
        Resumen
      </Animated.Text>
      <View style={styles.cardsRow}>
        <View style={styles.cardHalf}>
          <SummaryCard
            title="Balance total"
            value={formatBalance(summary?.totalBalance)}
            icon="💰"
            loading={summaryLoading}
            accent={colors.primary}
            onClick={() => navigateToMainTab(navigation, 'Account')}
            tooltip="Ver mis cuentas"
            index={0}
          />
        </View>
        <View style={styles.cardHalf}>
          <SummaryCard
            title="Cuentas activas"
            value={String(summary?.totalAccounts ?? accounts.length ?? 0)}
            icon="🏦"
            loading={summaryLoading}
            accent={colors.accent}
            onClick={() => navigateToMainTab(navigation, 'Account')}
            tooltip="Ver mis cuentas"
            index={1}
          />
        </View>
      </View>

      {/* Accesos rápidos */}
      <Animated.Text
        entering={FadeInUp.duration(400).delay(140)}
        style={styles.sectionTitle}
      >
        Accesos rápidos
      </Animated.Text>
      <QuickLinks links={QUICK_LINKS} loading={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  greetingCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greetingLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: FONT_SIZE.sm,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.sm,
  },
  cardHalf: {
    flex: 1,
  },
});
