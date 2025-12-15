/**
 * CONTROLADOR: HistorialController
 * Custom Hook que maneja la lógica de negocio del historial
 */

import { useState, useEffect, useCallback } from 'react';
import { FirebaseService } from '../services/FirebaseService';

export const useHistorialController = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  // Suscribirse a cambios del historial
  useEffect(() => {
    const unsubscribe = FirebaseService.onHistorialChange((historialData, error) => {
      if (error) {
        console.error('Error al obtener historial:', error);
        setLoading(false);
        return;
      }

      if (historialData) {
        setHistorial(historialData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Obtener historial filtrado por sensor
  const getHistorialBySensor = useCallback((sensorId) => {
    return historial.filter(item => item.sensor === sensorId);
  }, [historial]);

  // Obtener últimos N registros
  const getUltimosRegistros = useCallback((cantidad = 10) => {
    return historial.slice(-cantidad);
  }, [historial]);

  return {
    historial,
    loading,
    getHistorialBySensor,
    getUltimosRegistros
  };
};

export default useHistorialController;
