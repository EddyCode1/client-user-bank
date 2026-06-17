import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import useAuthStore from '../../auth/store/useAuthStore';
import { accountClient } from '../api/accountClient'; // Adaptado a tu cliente API móvil
import { useMyAccounts } from '../hooks/useMyAccounts';
import AccountFormModal from '../components/AccountFormModal';
import AccountDetailModal from '../components/AccountDetailModal';
import { getUsers } from '../../user/api/userClient'; // Adaptado a tu cliente de usuarios
import { isAdminUser } from '../../../shared/auth/roles';

const ACCOUNT_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'CORRIENTE', label: 'Corriente' },
  { value: 'AHORRO', label: 'Ahorro' },
  { value: 'NOMINA', label: 'Nómina' },
];

const CURRENCY_OPTIONS = [
  { value: '', label: 'Todas las monedas' },
  { value: 'GTQ', label: 'GTQ' },
  { value: 'USD', label: 'USD' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

function formatCurrency(amount, currency = 'GTQ') {
  return Number(amount ?? 0).toLocaleString('es-GT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
}

// Paleta de colores Premium Matte Dark
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',
  success: '#10B981',
  danger: '#EF4444',
  white: '#FFFFFF',
  inputBg: '#1A1A1A',
  cardBg: '#1A1A1A'
};

export default function AccountScreen() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useMemo(() => isAdminUser(user), [user]);

  const {
    accounts: myAccounts,
    summary: accountSummary,
    loading: myLoading,
    summaryLoading: myInfoLoading,
    reloadAccounts: loadMyAccounts,
  } = useMyAccounts({ autoLoad: true, limit: 50 });

  const [adminAccounts, setAdminAccounts] = useState([]);
  const [adminTotal, setAdminTotal] = useState(0);
  const [adminPage, setAdminPage] = useState(1);
  const [adminLimit] = useState(10);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminType, setAdminType] = useState('');
  const [adminCurrency, setAdminCurrency] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const [owners, setOwners] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTransactions, setDetailTransactions] = useState([]);
  const [detailError, setDetailError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin' : 'mine');

  const loadAdminAccounts = async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const result = await accountClient.getAccounts({
        page: adminPage,
        limit: adminLimit,
        search: adminSearch,
        type: adminType,
        currency: adminCurrency,
        status: adminStatus,
      });
      if (result.success) {
        setAdminAccounts(result.data.items);
        setAdminTotal(result.data.total);
      } else {
        Alert.alert('Error', result.error || 'No se cargaron cuentas admin');
      }
    } catch {
      Alert.alert('Error', 'Error al cargar cuentas de administrador');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAdmin) {
        loadAdminAccounts();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isAdmin, adminPage, adminSearch, adminType, adminCurrency, adminStatus]);

  const fetchOwners = async () => {
    try {
      const result = await getUsers({ page: 1, limit: 200 });
      if (result.success) {
        setOwners(result.data.items || []);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch {
      Alert.alert('Error', 'Error al cargar los clientes propietarios');
    }
  };

  const handleOpenCreate = async () => {
    setAccountToEdit(null);
    setFormError(null);
    if (isAdmin) {
      await fetchOwners();
    }
    setFormOpen(true);
  };

  const handleCreateOrUpdate = async (payload) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const result = accountToEdit
        ? await accountClient.updateAccount(accountToEdit.id, payload)
        : await accountClient.createAccount(payload, { isAdmin });
      if (result.success) {
        Alert.alert('Éxito', accountToEdit ? 'Cuenta actualizada' : 'Cuenta creada');
        setFormOpen(false);
        setAccountToEdit(null);
        loadMyAccounts();
        if (isAdmin) loadAdminAccounts();
      } else {
        setFormError(result.error);
      }
    } catch {
      setFormError('Error inesperado al guardar la cuenta');
    } finally {
      setFormLoading(false);
    }
  };

  const loadAccountTransactions = async (account) => {
    setDetailError(null);
    setDetailLoading(true);
    setDetailTransactions([]);
    try {
      const result = await accountClient.getAccountTransactions(account.id, { limit: 30 });
      if (result.success) {
        setDetailTransactions(result.data.transactions);
      } else {
        setDetailError(result.error);
      }
    } catch {
      setDetailError('Error al obtener movimientos');
    } finally {
      setDetailLoading(false);
    }
  };

  const openAccountDetail = async (account) => {
    setSelectedAccount(account);
    setDetailOpen(true);
    await loadAccountTransactions(account);
  };

  const handleEditAccount = (account) => {
    setAccountToEdit(account);
    setFormError(null);
    setFormOpen(true);
    if (isAdmin) fetchOwners();
  };

  const handleAccountStatusChange = async (account, nextStatus) => {
    try {
      const result = await accountClient.changeAccountStatus(account.id, nextStatus);
      if (result.success) {
        Alert.alert('Éxito', `Cuenta ${nextStatus === 'active' ? 'activada' : 'desactivada'}`);
        loadMyAccounts();
        if (isAdmin) loadAdminAccounts();
        if (detailOpen) setSelectedAccount(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch {
      Alert.alert('Error', 'Error al cambiar estado de la cuenta');
    }
  };

  const totalAdminPages = Math.max(1, Math.ceil(adminTotal / adminLimit));

  // Renderizado optimizado para las tarjetas de "Mis Cuentas"
  const renderMyAccountCard = ({ item: account }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardLabel}>Número de cuenta</Text>
          <Text style={styles.cardValue}>{account.accountNumber}</Text>
        </View>
        <View style={styles.badgeGroup}>
          <Text style={styles.textBadge}>{account.type}</Text>
          <Text style={styles.textBadge}>{account.currency}</Text>
          <Text style={[
            styles.statusBadge, 
            { 
              backgroundColor: account.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: account.status === 'active' ? colors.success : colors.danger 
            }
          ]}>
            {account.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Saldo disponible</Text>
          <Text style={styles.cardBalance}>{formatCurrency(account.balance, account.currency)}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.btnSmall, styles.btnOutline]} 
            onPress={() => openAccountDetail(account)}
          >
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>Detalles</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btnSmall, styles.btnPrimary]} 
            onPress={() => handleEditAccount(account)}
          >
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Renderizado optimizado estilo Fila de Tabla para el Panel Admin Móvil
  const renderAdminAccountRow = ({ item: account }) => (
    <View style={styles.tableRow}>
      <View style={styles.rowMainInfo}>
        <Text style={styles.rowTitle}>{account.accountNumber}</Text>
        <Text style={styles.rowSubtitle}>{account.ownerName || 'Sin cliente'} • {account.type} • {account.currency}</Text>
      </View>
      <View style={styles.rowSecondaryInfo}>
        <Text style={styles.rowBalance}>{formatCurrency(account.balance, account.currency)}</Text>
        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.rowBtn} onPress={() => openAccountDetail(account)}>
            <Text style={styles.rowBtnText}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.rowBtn, { backgroundColor: colors.primary }]} onPress={() => handleEditAccount(account)}>
            <Text style={[styles.rowBtnText, { color: colors.white }]}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Superior */}
      <View style={styles.mainHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titleScreen}>Cuentas</Text>
          <Text style={styles.subtitleScreen}>Administración integral de activos.</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleOpenCreate}>
          <Text style={styles.headerButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs de navegación para Administradores */}
      {isAdmin && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'admin' && styles.tabActive]} 
            onPress={() => setActiveTab('admin')}
          >
            <Text style={[styles.tabText, activeTab === 'admin' && styles.tabTextActive]}>Panel admin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'mine' && styles.tabActive]} 
            onPress={() => setActiveTab('mine')}
          >
            <Text style={[styles.tabText, activeTab === 'mine' && styles.tabTextActive]}>Mis cuentas</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sección Clientes: Mis Cuentas */}
      {(!isAdmin || activeTab === 'mine') && (
        <FlatList
          data={myAccounts}
          keyExtractor={(item) => item.id}
          renderItem={renderMyAccountCard}
          refreshing={myLoading}
          onRefresh={loadMyAccounts}
          ListHeaderComponent={() => (
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionHeading}>Resumen Consolidado</Text>
              {myInfoLoading ? (
                <Text style={styles.loadingText}>Cargando balances...</Text>
              ) : (
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Cuentas</Text>
                    <Text style={styles.summaryValue}>{accountSummary?.totalAccounts ?? myAccounts.length}</Text>
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Saldo Total (GTQ)</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(accountSummary?.totalBalance ?? myAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0))}
                    </Text>
                  </View>
                </View>
              )}
              <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Mis Cuentas de Ahorro/Corrientes</Text>
            </View>
          )}
          ListEmptyComponent={() => !myLoading && <Text style={styles.emptyText}>No posees cuentas bancarias creadas.</Text>}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* Panel Administrativo Global */}
      {isAdmin && activeTab === 'admin' && (
        <FlatList
          data={adminAccounts}
          keyExtractor={(item) => item.id}
          renderItem={renderAdminAccountRow}
          refreshing={adminLoading}
          onRefresh={loadAdminAccounts}
          ListHeaderComponent={() => (
            <View style={styles.adminFiltersBox}>
              <Text style={styles.sectionHeading}>Búsqueda y Filtros de Control</Text>
              <TextInput
                style={styles.searchBar}
                placeholder="Buscar por número o cliente..."
                placeholderTextColor={colors.muted}
                value={adminSearch}
                onChangeText={setAdminSearch}
              />
              <View style={styles.pickersInline}>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={adminType}
                    dropdownIconColor={colors.muted}
                    style={styles.compactPicker}
                    onValueChange={(v) => { setAdminType(v); setAdminPage(1); }}
                  >
                    {ACCOUNT_TYPES.map((o) => <Picker.Item key={o.value} label={o.label} value={o.value} color={colors.text} style={styles.pickerItem}/>)}
                  </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={adminCurrency}
                    dropdownIconColor={colors.muted}
                    style={styles.compactPicker}
                    onValueChange={(v) => { setAdminCurrency(v); setAdminPage(1); }}
                  >
                    {CURRENCY_OPTIONS.map((o) => <Picker.Item key={o.value} label={o.label} value={o.value} color={colors.text} style={styles.pickerItem}/>)}
                  </Picker>
                </View>
              </View>
              <View style={[styles.pickerWrapper, { marginTop: 10 }]}>
                <Picker
                  selectedValue={adminStatus}
                  dropdownIconColor={colors.muted}
                  style={styles.compactPicker}
                  onValueChange={(v) => { setAdminStatus(v); setAdminPage(1); }}
                >
                  {STATUS_OPTIONS.map((o) => <Picker.Item key={o.value} label={o.label} value={o.value} color={colors.text} style={styles.pickerItem}/>)}
                </Picker>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={styles.paginationBlock}>
              <Text style={styles.emptyText}>Total de cuentas registradas: {adminTotal}</Text>
              <View style={styles.paginationRow}>
                <TouchableOpacity 
                  disabled={adminPage <= 1} 
                  style={[styles.btnPage, adminPage <= 1 && { opacity: 0.4 }]}
                  onPress={() => setAdminPage((p) => Math.max(1, p - 1))}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Ant.</Text>
                </TouchableOpacity>
                <Text style={styles.pageLabel}>Pág. {adminPage} de {totalAdminPages}</Text>
                <TouchableOpacity 
                  disabled={adminPage >= totalAdminPages} 
                  style={[styles.btnPage, adminPage >= totalAdminPages && { opacity: 0.4 }]}
                  onPress={() => setAdminPage((p) => Math.min(totalAdminPages, p + 1))}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Sig.</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => !adminLoading && <Text style={styles.emptyText}>Ninguna cuenta coincide con los criterios.</Text>}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* Modales de Gestión de Negocio */}
      <AccountFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setAccountToEdit(null); setFormError(null); }}
        onSubmit={handleCreateOrUpdate}
        account={accountToEdit}
        isLoading={formLoading}
        submitError={formError}
        isAdmin={isAdmin}
        users={owners}
      />

      <AccountDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        account={selectedAccount}
        isAdmin={isAdmin}
        onEdit={(acc) => {
          handleEditAccount(acc);
          setDetailOpen(false);
        }}
        onStatusChange={handleAccountStatusChange}
        transactions={detailTransactions}
        transactionsLoading={detailLoading}
        error={detailError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  titleScreen: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitleScreen: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.white,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryContainer: {
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 20,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  badgeGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  textBadge: {
    fontSize: 10,
    color: colors.text,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  cardBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  adminFiltersBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    marginBottom: 10,
  },
  pickersInline: {
    flexDirection: 'row',
    gap: 10,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactPicker: {
    color: colors.text,
    height: 44,
  },
  pickerItem: {
    fontSize: 13,
    backgroundColor: colors.surface,
  },
  tableRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMainInfo: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  rowSecondaryInfo: {
    alignItems: 'flex-end',
    gap: 8,
  },
  rowBalance: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 6,
  },
  rowBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  rowBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  paginationBlock: {
    marginTop: 10,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  btnPage: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  pageLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  loadingText: {
    fontSize: 13,
    color: colors.muted,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
  },
});