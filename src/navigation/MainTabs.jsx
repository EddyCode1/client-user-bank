import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { COLORS, RADIUS } from "../shared/constants/theme";

// Tabs principales
import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import AccountScreen from "../features/account/screens/AccountScreen";
import FavoriteScreen from "../features/favorite/screens/FavoriteScreen";

// Stack: Transacciones
import TransactionScreen from "../features/transaction/screens/TransactionScreen";
import AdminDepositsScreen from "../features/transaction/screens/AdminDepositsScreen";

// Stack: Más
import MoreMenuScreen from "../features/more/screens/MoreMenuScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import ProductScreen from "../features/product/screens/ProductScreen";
import ServiceScreen from "../features/service/screens/ServiceScreen";
import FinancialScreen from "../features/financial/screens/FinancialScreen";
import ScheduleScreen from "../features/schedule/screens/ScheduleScreen";
import UsersScreen from "../features/user/screens/UsersScreen";
import UserDetailScreen from "../features/user/screens/UserDetailScreen";

const Tab = createBottomTabNavigator();
const TransStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

const stackHeaderOptions = {
    headerShown: true,
    headerStyle: { backgroundColor: COLORS.surface },
    headerTintColor: COLORS.text,
    headerTitleStyle: { fontWeight: "700" },
    headerShadowVisible: false,
    animation: "slide_from_right",
};

function TransactionsStack() {
    return (
        <TransStack.Navigator screenOptions={stackHeaderOptions}>
            <TransStack.Screen
                name="TransactionMain"
                component={TransactionScreen}
                options={{ title: "Transacciones" }}
            />
            <TransStack.Screen
                name="AdminDeposits"
                component={AdminDepositsScreen}
                options={{ title: "Depósitos" }}
            />
        </TransStack.Navigator>
    );
}

function MoreStackNavigator() {
    return (
        <MoreStack.Navigator screenOptions={stackHeaderOptions}>
            <MoreStack.Screen
                name="MoreMenu"
                component={MoreMenuScreen}
                options={{ title: "Más" }}
            />
            <MoreStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Mi Perfil" }}
            />
            <MoreStack.Screen
                name="Products"
                component={ProductScreen}
                options={{ title: "Productos" }}
            />
            <MoreStack.Screen
                name="Services"
                component={ServiceScreen}
                options={{ title: "Servicios" }}
            />
            <MoreStack.Screen
                name="Financial"
                component={FinancialScreen}
                options={{ title: "Financiero" }}
            />
            <MoreStack.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ title: "Horario" }}
            />
            <MoreStack.Screen
                name="Users"
                component={UsersScreen}
                options={{ title: "Usuarios" }}
            />
            <MoreStack.Screen
                name="DetalleUsuario"
                component={UserDetailScreen}
                options={{ title: "Detalle de usuario" }}
            />
        </MoreStack.Navigator>
    );
}

const TAB_ICONS = {
    Dashboard: "dashboard",
    Account: "account-balance",
    Transacciones: "swap-horiz",
    Favorites: "star",
    More: "menu",
};

function AnimatedTabIcon({ name, color, size, focused }) {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(focused ? 1.15 : 1, { damping: 10, stiffness: 220 });
        translateY.value = withSpring(focused ? -2 : 0, { damping: 10, stiffness: 220 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: translateY.value }],
    }));

    return (
        <View style={styles.tabIconWrapper}>
            {focused && <View style={styles.tabIconActiveDot} />}
            <Animated.View style={animatedStyle}>
                <MaterialIcons name={name} size={size} color={color} />
            </Animated.View>
        </View>
    );
}

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.text,
                headerTitleStyle: { fontWeight: "700" },
                headerShadowVisible: false,
                animation: "shift",
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 64,
                    paddingBottom: 10,
                    paddingTop: 8,
                },
                tabBarIcon: ({ color, size, focused }) => (
                    <AnimatedTabIcon
                        name={TAB_ICONS[route.name]}
                        color={color}
                        size={size}
                        focused={focused}
                    />
                ),
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: "Inicio" }}
            />
            <Tab.Screen
                name="Account"
                component={AccountScreen}
                options={{ title: "Cuentas" }}
            />
            <Tab.Screen
                name="Transacciones"
                component={TransactionsStack}
                options={{ title: "Transacciones", headerShown: false }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoriteScreen}
                options={{ title: "Favoritos" }}
            />
            <Tab.Screen
                name="More"
                component={MoreStackNavigator}
                options={{ title: "Más", headerShown: false }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabIconWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    tabIconActiveDot: {
        position: "absolute",
        top: -10,
        width: 4,
        height: 4,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.primary,
    },
});
