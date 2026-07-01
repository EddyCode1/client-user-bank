import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { COLORS, SPACING, FONT_SIZE, RADIUS, GRADIENTS } from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth";

import bankLogo from "../../../../assets/bank-logo.png";

const FIELD_STAGGER = 70;

const RegisterScreen = ({ navigation }) => {
    const { handleRegister, loading } = useAuth();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            password: "",
            phone: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleRegister(data);
            Alert.alert(
                "Registro exitoso",
                "Tu cuenta ha sido creada. Revisa tu correo y espera activación administrativa.",
                [{ text: "OK", onPress: () => navigation.navigate("Login") }],
            );
        } catch (error) {
            const message =
                error.response?.data?.message || "Error al registrarse";
            Alert.alert("Error", message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInDown.duration(450).springify().damping(14)}
                    style={styles.header}
                >
                    <Image
                        source={bankLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.subtitle}>Crear cuenta</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(450).delay(100).springify().damping(16)}
                    style={styles.card}
                >
                    <Animated.View entering={FadeInLeft.duration(400).delay(1 * FIELD_STAGGER)}>
                        <Controller
                            control={control}
                            rules={{ required: "Nombre requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Nombre"
                                    placeholder="Tu nombre"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.name?.message}
                                />
                            )}
                            name="name"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInLeft.duration(400).delay(2 * FIELD_STAGGER)}>
                        <Controller
                            control={control}
                            rules={{ required: "Apellido requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Apellido"
                                    placeholder="Tu apellido"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.surname?.message}
                                />
                            )}
                            name="surname"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInLeft.duration(400).delay(3 * FIELD_STAGGER)}>
                        <Controller
                            control={control}
                            rules={{ required: "Usuario requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Usuario"
                                    placeholder="nombre_usuario"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    error={errors.username?.message}
                                />
                            )}
                            name="username"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInLeft.duration(400).delay(4 * FIELD_STAGGER)}>
                        <Controller
                            control={control}
                            rules={{
                                required: "Teléfono requerido",
                                pattern: {
                                    value: /^\d{8}$/,
                                    message: "Debe tener exactamente 8 dígitos",
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Teléfono"
                                    placeholder="Ej: 12345678"
                                    keyboardType="numeric"
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.phone?.message}
                                />
                            )}
                            name="phone"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInLeft.duration(400).delay(5 * FIELD_STAGGER)}>
                        <Controller
                            control={control}
                            rules={{
                                required: "Email requerido",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Email inválido",
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Email"
                                    placeholder="correo@ejemplo.com"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    error={errors.email?.message}
                                />
                            )}
                            name="email"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInLeft.duration(400).delay(6 * FIELD_STAGGER)}>
                        <Controller
                            control={control}
                            rules={{
                                required: "Contraseña requerida",
                                minLength: {
                                    value: 8,
                                    message: "Mínimo 8 caracteres",
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Contraseña"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    value={value}
                                    error={errors.password?.message}
                                />
                            )}
                            name="password"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.duration(400).delay(7 * FIELD_STAGGER)}>
                        <Button
                            title="Registrarse"
                            onPress={handleSubmit(onSubmit)}
                            loading={loading}
                            style={styles.button}
                        />
                    </Animated.View>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(400).delay(8 * FIELD_STAGGER)}
                    style={styles.footer}
                >
                    <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate("Login")}
                    >
                        Inicia Sesión
                    </Text>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 220,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        paddingTop: SPACING.xxl,
        paddingBottom: SPACING.xxl,
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.lg,
    },
    logo: {
        height: 60,
        width: 180,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.surface,
        marginTop: SPACING.sm,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
    },
    button: {
        marginTop: SPACING.lg,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SPACING.xl,
        paddingBottom: SPACING.xxl,
    },
    footerText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textLight,
    },
    link: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: "700",
    },
});

export default RegisterScreen;
