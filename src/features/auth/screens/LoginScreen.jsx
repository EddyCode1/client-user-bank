import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';
import { authService } from '../services/authService';

// Paleta Premium Matte Dark con acento Turquesa
const colors = {
  bg: '#121212',
  surface: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  primary: '#00ADB5',       // Turquesa característico
  primaryMuted: 'rgba(0, 173, 181, 0.1)',
  danger: '#EF4444',
  inputBg: '#1A1A1A'
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuthStore();
  const navigation = useNavigation();

  const handleValidation = () => {
    let tempErrors = {};
    if (!email.trim()) tempErrors.email = 'Correo o usuario requerido';
    if (!password) tempErrors.password = 'Contraseña requerida';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!handleValidation()) return;

    setIsLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      if (result.success) {
        login(result.token, result.user, result.refreshToken);
        Alert.alert('Éxito', 'Sesión iniciada correctamente');
        
        // Redirige al lobby/home de la app reseteando el stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Lobby' }],
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>Banco del Quetzal</Text>
            </View>
            <Text style={styles.title}>Inicia sesión</Text>
            <Text style={styles.subtitle}>Accede a tu banca digital.</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            
            {/* Input Correo / Usuario */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo o usuario</Text>
              <View style={[styles.inputWrapper, errors.email ? styles.inputErrorBorder : null]}>
                <MaterialCommunityIcons name="email-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@dominio.com"
                  placeholderTextColor="#555555"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  editable={!isLoading}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Input Contraseña */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Contraseña</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, errors.password ? styles.inputErrorBorder : null]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={18} 
                    color={colors.muted} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Botón Submit */}
            <TouchableOpacity 
              style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.btnContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Iniciando sesión...</Text>
                </View>
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>Iniciar sesión</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" style={styles.arrowIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Registro */}
          <Text style={styles.registerPrompt}>
            ¿Aún no tienes cuenta?{' '}
            <Text style={styles.linkInline} onPress={() => navigation.navigate('Register')}>
              Regístrate
            </Text>
          </Text>

          {/* Microlinks Inferiores */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('VerifyEmail')}>
              <Text style={styles.footerLinkText}>Verificar correo</Text>
            </TouchableOpacity>
            <Text style={styles.divider}>·</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ResendVerification')}>
              <Text style={styles.footerLinkText}>Reenviar verificación</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeContainer: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 173, 181, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 14,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },
  forgotPasswordText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 14,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: 10,
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 6,
  },
  registerPrompt: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
  },
  linkInline: {
    color: colors.primary,
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  footerLinkText: {
    fontSize: 11,
    color: colors.muted,
  },
  divider: {
    color: colors.border,
    marginHorizontal: 8,
    fontSize: 12,
  }
});