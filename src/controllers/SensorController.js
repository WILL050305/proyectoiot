/**
 * CONTROLADOR: SensorController
 * Custom Hook que maneja la lógica de negocio de los sensores
 */

import { useState, useEffect, useCallback } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import { GraficoModel } from '../models/GraficoModel';

export const useSensorController = () => {
  const [sensores, setSensores] = useState({
    sensor1: null,
    sensor2: null
  });
  const [isOnline, setIsOnline] = useState({
    sensor1: false,
    sensor2: false
  });
  const [datosGrafico, setDatosGrafico] = useState([]);

  // Suscribirse a cambios de sensores
  useEffect(() => {
    console.log('🔥 Conectando a Firebase Realtime Database...');
    
    const unsubscribe = FirebaseService.onSensoresChange((sensoresData, error) => {
      if (error) {
        console.error('Error al obtener sensores:', error);
        return;
      }

      if (sensoresData) {
        setSensores(sensoresData);
        
        // Actualizar estado online
        setIsOnline({
          sensor1: sensoresData.sensor1?.estaOnline() || false,
          sensor2: sensoresData.sensor2?.estaOnline() || false
        });

        console.log('✅ Sensores actualizados:', {
          sensor1: { 
            planta: sensoresData.sensor1?.planta, 
            humedad: sensoresData.sensor1?.humedad, 
            rele: sensoresData.sensor1?.rele_estado 
          },
          sensor2: { 
            planta: sensoresData.sensor2?.planta, 
            humedad: sensoresData.sensor2?.humedad, 
            rele: sensoresData.sensor2?.rele_estado 
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Actualizar datos del gráfico cuando cambian los sensores
  useEffect(() => {
    if (sensores.sensor1 && sensores.sensor2) {
      setDatosGrafico(prevData => {
        const newPoint = new GraficoModel({
          humedad1: sensores.sensor1.humedad || 0,
          humedad2: sensores.sensor2.humedad || 0,
          timestamp: new Date().getTime()
        });

        // Mantener solo los últimos 12 puntos
        const updatedData = [...prevData, newPoint];
        if (updatedData.length > 12) {
          updatedData.shift();
        }

        return updatedData;
      });
    }
  }, [sensores]);

  // Verificar estado online cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (sensores.sensor1 || sensores.sensor2) {
        setIsOnline({
          sensor1: sensores.sensor1?.estaOnline() || false,
          sensor2: sensores.sensor2?.estaOnline() || false
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sensores]);

  // Función para toggle riego
  const toggleRiego = useCallback(async (sensorId, nuevoEstado) => {
    console.log(`🚿 Cambiando estado de riego ${sensorId} a:`, nuevoEstado);
    const result = await FirebaseService.updateReleEstado(sensorId, nuevoEstado);
    
    if (!result.success) {
      throw new Error('Error al actualizar el estado del riego');
    }
    
    return result;
  }, []);

  return {
    sensores,
    isOnline,
    datosGrafico,
    toggleRiego,
    setDatosGrafico
  };
};

export default useSensorController;
