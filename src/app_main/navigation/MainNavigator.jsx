import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Sidebar from '../components/Sidebar';
// ... importa tus screens de las features correspondientes

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <Sidebar {...props} />}>
      <Drawer.Screen name="Dashboard" component={DashboardPage} />
      <Drawer.Screen name="Saldos" component={FinancialPage} />
      <Drawer.Screen name="Cuentas" component={AccountPage} />
      <Drawer.Screen name="Transacciones" component={TransactionPage} />
      <Drawer.Screen name="Productos" component={ProductPage} />
      <Drawer.Screen name="Servicios" component={ServicePage} />
      <Drawer.Screen name="Favoritos" component={FavoritePage} />
      <Drawer.Screen name="Perfil" component={ProfilePage} />
      <Drawer.Screen name="Usuarios" component={UsersPage} />
      <Drawer.Screen name="DetalleUsuario" component={UserDetailPage} />
      <Drawer.Screen name="Forbidden" component={ForbiddenPage} />
    </Drawer.Navigator>
  );
}