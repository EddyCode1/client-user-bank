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

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    if (field === 'telefono') {
      // Filtrar inmediatamente para permitir solo dígitos y un máximo de 8 caracteres
      value = value.replace(/\D/g, '').slice(0, 8);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre.trim()) tempErrors.nombre = 'Nombre requerido';
    if (!formData.username.trim()) tempErrors.username = 'Usuario requerido';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email requerido';
    } else if (!emailRegex.test(formData.email.trim())) {
      tempErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!formData.telefono) {
      tempErrors.telefono = 'Teléfono requerido';
    } else if (formData.telefono.length !== 8) {
      tempErrors.telefono = 'El teléfono debe tener exactamente 8 dígitos';
    }

    if (!formData.password) {
      tempErrors.password = 'Contraseña requerida';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'Confirmar contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await authService.register({
        nombre: formData.nombre.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono,
        password: formData.password,
      });

      if (res.success) {
        Alert.alert(
          'Cuenta creada',
          'Revisa tu correo para verificar y espera activación administrativa.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Hubo un problema al procesar el registro.');
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
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para gestionar tu cuenta.</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={[styles.inputWrapper, errors.nombre && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="account-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#555555"
                  value={formData.nombre}
                  onChangeText={(text) => handleInputChange('nombre', text)}
                  editable={!isLoading}
                />
              </View>
              {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            {/* Usuario */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <View style={[styles.inputWrapper, errors.username && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="at" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nombre_usuario"
                  placeholderTextColor="#555555"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  editable={!isLoading}
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="email-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor="#555555"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  editable={!isLoading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={[styles.inputWrapper, errors.telefono && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="phone-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="12345678"
                  placeholderTextColor="#555555"
                  keyboardType="number-pad"
                  maxLength={8}
                  value={formData.telefono}
                  onChangeText={(text) => handleInputChange('telefono', text)}
                  editable={!isLoading}
                />
              </View>
              {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputErrorBorder]}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#555555"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                  <MaterialCommunityIcons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Botón Registrar */}
            <TouchableOpacity 
              style={[styles.btnPrimary, isLoading && styles.btnDisabled]} 
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.btnContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Creando cuenta...</Text>
                </View>
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>Crear cuenta</Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" style={styles.arrowIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <Text style={styles.loginPrompt}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.linkInline} onPress={() => navigation.navigate('Login')}>
              Inicia sesión
            </Text>
          </Text>

          {/* Enlaces de Verificación */}
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
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: 12,
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
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
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
    marginTop: 10,
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
  loginPrompt: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
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