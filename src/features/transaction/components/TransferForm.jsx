import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import useTransactionStore from '../store/useTransactionStore';
import { styles, colors } from './TransferForm.styles';

export default function TransferForm({ onSuccess, initialDestinationAccountId = '' }) {
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    destinationAccountId: '',
    amount: '',
    reference: '',
    concept: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTransfer } = useTransactionStore();

  useEffect(() => {
    const trimmed = initialDestinationAccountId?.trim();
    if (!trimmed) return;
    
    setFormData((prev) => ({
      ...prev,
      destinationAccountId: trimmed
    }));
  }, [initialDestinationAccountId]);

  const validateForm = () => {
    const newErrors = {};

    // Validar cuenta origen
    if (!formData.sourceAccountId || formData.sourceAccountId.trim() === '') {
      newErrors.sourceAccountId = 'La cuenta origen es requerida';
    } else if (!/^[a-zA-Z0-9-]{3,}$/.test(formData.sourceAccountId.trim())) {
      newErrors.sourceAccountId = 'Formato de cuenta origen inválido';
    }

    // Validar cuenta destino
    if (!formData.destinationAccountId || formData.destinationAccountId.trim() === '') {
      newErrors.destinationAccountId = 'La cuenta destino es requerida';
    } else if (!/^[a-zA-Z0-9-]{3,}$/.test(formData.destinationAccountId.trim())) {
      newErrors.destinationAccountId = 'Formato de cuenta destino inválido';
    }

    // Validar que las cuentas sean diferentes
    if (
      formData.sourceAccountId.trim() &&
      formData.destinationAccountId.trim() &&
      formData.sourceAccountId.trim() === formData.destinationAccountId.trim()
    ) {
      newErrors.destinationAccountId = 'La cuenta destino debe ser diferente a la cuenta origen';
    }

    // Validar monto
    if (!formData.amount || formData.amount === '') {
      newErrors.amount = 'El monto es requerido';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = 'El monto debe ser un número válido';
      } else if (amount <= 0) {
        newErrors.amount = 'El monto debe ser mayor a 0';
      } else if (amount > 999999999) {
        newErrors.amount = 'El monto excede el límite máximo permitido';
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        newErrors.amount = 'El monto debe tener máximo 2 decimales';
      }
    }

    // Validar referencia
    if (formData.reference && formData.reference.length > 100) {
      newErrors.reference = 'La referencia no puede exceder 100 caracteres';
    }

    // Validar concepto
    if (formData.concept && formData.concept.length > 500) {
      newErrors.concept = 'El concepto no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Atención', 'Por favor completa correctamente todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTransfer({
        sourceAccountId: formData.sourceAccountId.trim(),
        destinationAccountId: formData.destinationAccountId.trim(),
        amount: parseFloat(formData.amount),
        reference: formData.reference.trim() || undefined,
        concept: formData.concept.trim() || undefined
      });

      if (result.success) {
        Alert.alert('Éxito', 'Transferencia realizada con éxito');
        setFormData({
          sourceAccountId: '',
          destinationAccountId: '',
          amount: '',
          reference: '',
          concept: ''
        });
        setErrors({});
        onSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'No se pudo procesar la transferencia');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Error inesperado al procesar la transferencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Crear Transferencia</Text>
      <Text style={styles.subtitle}>Envía dinero entre cuentas y registra referencia/concepto opcional.</Text>

      <View style={styles.formGap}>
        {/* Source Account Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cuenta Origen *</Text>
          <TextInput
            style={[styles.input, errors.sourceAccountId && styles.inputError]}
            value={formData.sourceAccountId}
            onChangeText={(val) => handleFieldChange('sourceAccountId', val)}
            placeholder="Ej: tu número de cuenta"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.sourceAccountId && <Text style={styles.errorText}>{errors.sourceAccountId}</Text>}
        </View>

        {/* Destination Account Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cuenta Destino *</Text>
          <TextInput
            style={[styles.input, errors.destinationAccountId && styles.inputError]}
            value={formData.destinationAccountId}
            onChangeText={(val) => handleFieldChange('destinationAccountId', val)}
            placeholder="Ej: número de cuenta del beneficiario"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.destinationAccountId && <Text style={styles.errorText}>{errors.destinationAccountId}</Text>}
        </View>

        {/* Amount Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Monto (GTQ) *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            value={formData.amount}
            onChangeText={(val) => handleFieldChange('amount', val)}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />
          {errors.amount ? (
            <Text style={styles.errorText}>{errors.amount}</Text>
          ) : (
            <Text style={styles.hintText}>Máximo 2 decimales</Text>
          )}
        </View>

        {/* Reference Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Referencia (Opcional)</Text>
          <TextInput
            style={[styles.input, errors.reference && styles.inputError]}
            value={formData.reference}
            onChangeText={(val) => handleFieldChange('reference', val)}
            placeholder="Ej: Pago de servicios"
            placeholderTextColor={colors.muted}
            maxLength={100}
          />
          {errors.reference && <Text style={styles.errorText}>{errors.reference}</Text>}
          <Text style={styles.hintText}>{formData.reference.length}/100</Text>
        </View>

        {/* Concept Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Concepto (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.concept && styles.inputError]}
            value={formData.concept}
            onChangeText={(val) => handleFieldChange('concept', val)}
            placeholder="Descripción de la transferencia"
            placeholderTextColor={colors.muted}
            maxLength={500}
            multiline
            numberOfLines={3}
          />
          {errors.concept && <Text style={styles.errorText}>{errors.concept}</Text>}
          <Text style={styles.hintText}>{formData.concept.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.btnSubmit, isSubmitting && styles.btnSubmitDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.btnSubmitText}>Realizar Transferencia</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}