/**
 * CONTROLADOR: PlantaController
 * Custom Hook que maneja la lógica de negocio de las plantas
 */

import { useState, useEffect, useCallback } from 'react';
import { FirestoreService } from '../services/FirestoreService';
import { PlantaModel } from '../models/PlantaModel';

export const usePlantaController = () => {
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar plantas al iniciar
  useEffect(() => {
    fetchPlantas();
  }, []);

  // Obtener todas las plantas
  const fetchPlantas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FirestoreService.getPlantas();
      
      if (result.success) {
        setPlantas(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en fetchPlantas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva planta
  const createPlanta = useCallback(async (plantaData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirestoreService.createPlanta(plantaData);
      
      if (result.success) {
        await fetchPlantas(); // Recargar lista
        return { success: true };
      } else {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en createPlanta:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchPlantas]);

  // Actualizar planta existente
  const updatePlanta = useCallback(async (plantaId, plantaData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirestoreService.updatePlanta(plantaId, plantaData);
      
      if (result.success) {
        await fetchPlantas(); // Recargar lista
        return { success: true };
      } else {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en updatePlanta:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchPlantas]);

  // Eliminar planta
  const deletePlanta = useCallback(async (plantaId, sensores = {}) => {
    // Verificar si la planta está asignada a algún sensor
    const sensorAsignado = Object.entries(sensores).find(([key, sensor]) => {
      return sensor?.planta === plantaId;
    });

    if (sensorAsignado) {
      const [sensorKey, sensorData] = sensorAsignado;
      alert(`No se puede eliminar esta planta porque está asignada al ${sensorKey.toUpperCase()}.\n\nPara eliminarla, primero debes desasignarla del sensor.`);
      return { success: false, cancelled: true, reason: 'asignada_a_sensor' };
    }

    if (!window.confirm('¿Estás seguro de eliminar esta planta?')) {
      return { success: false, cancelled: true };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await FirestoreService.deletePlanta(plantaId);
      
      if (result.success) {
        await fetchPlantas(); // Recargar lista
        return { success: true };
      } else {
        setError(result.error.message);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error en deletePlanta:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchPlantas]);

  // Obtener planta por ID
  const getPlantaById = useCallback((plantaId) => {
    return plantas.find(p => p.id === plantaId);
  }, [plantas]);

  // Crear modelo vacío para formulario
  const createEmptyPlanta = useCallback(() => {
    return new PlantaModel();
  }, []);

  return {
    plantas,
    loading,
    error,
    fetchPlantas,
    createPlanta,
    updatePlanta,
    deletePlanta,
    getPlantaById,
    createEmptyPlanta
  };
};

export default usePlantaController;
