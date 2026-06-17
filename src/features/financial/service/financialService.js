/**
 * Servicio simulado de datos financieros para tarjetas y préstamos
 * Optimizado con validaciones seguras para entornos React Native (Android/iOS)
 */

import {
  CREDIT_CARDS,
  LOANS,
  FINANCIAL_HISTORY,
} from '../constants/financialData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normaliza y filtra el historial de transacciones.
 * Incluye safe-guards para prevenir fallos de parsing de fechas y strings nulos en mobile.
 */
const filterHistory = (history, filters) => {
  const { startDate, endDate, type, currency, status, search } = filters || {};

  // Helper para parsear fechas de forma segura en motores JS de dispositivos móviles (como JSCore/Hermes)
  const parseSafeDate = (dateStr) => {
    if (!dateStr) return null;
    // Convierte "YYYY-MM-DD" a formato amigable reemplazando guiones para evitar desfases de zona horaria
    return new Date(dateStr.replace(/-/g, '/'));
  };

  return history.filter((item) => {
    if (!item) return false;

    const itemDate = parseSafeDate(item.date);
    const filterStart = parseSafeDate(startDate);
    const filterEnd = parseSafeDate(endDate);

    // Validaciones de rangos cronológicos
    const afterStart = filterStart && itemDate ? itemDate >= filterStart : true;
    const beforeEnd = filterEnd && itemDate ? itemDate <= filterEnd : true;
    
    // Validaciones de selectores
    const matchesType = type && type !== 'Todos' ? item.type === type : true;
    const matchesCurrency = currency && currency !== 'Todos' ? item.currency === currency : true;
    const matchesStatus = status && status !== 'Todos' ? item.status === status : true;
    
    // Búsqueda por texto con safe-guards contra campos undefined o nulos
    const cleanSearch = String(search || '').toLowerCase().trim();
    const matchesSearch = cleanSearch
      ? (item.description || '').toLowerCase().includes(cleanSearch) ||
        (item.category || '').toLowerCase().includes(cleanSearch)
      : true;

    return afterStart && beforeEnd && matchesType && matchesCurrency && matchesStatus && matchesSearch;
  });
};

export const financialService = {
  getCreditCards: async () => {
    await delay(200);
    return { success: true, data: CREDIT_CARDS };
  },
  
  getLoans: async () => {
    await delay(200);
    return { success: true, data: LOANS };
  },
  
  getFinancialHistory: async (filters = {}) => {
    await delay(200);
    return {
      success: true,
      data: filterHistory(FINANCIAL_HISTORY, filters),
    };
  },
};